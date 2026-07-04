import ts from 'typescript';

function isGasPNotImplementedThrow(statement: ts.Statement): boolean {
  if (!ts.isThrowStatement(statement) || !statement.expression) return false;
  const expr = statement.expression;
  if (!ts.isNewExpression(expr)) return false;
  return ts.isIdentifier(expr.expression) && expr.expression.text === 'GasPNotImplementedError';
}

function bodyIsStub(body: ts.Block | undefined): boolean {
  return body !== undefined && body.statements.length === 1 && isGasPNotImplementedThrow(body.statements[0]!);
}

function collectFunctionDeclarations(sourceFile: ts.SourceFile): Map<string, ts.FunctionDeclaration> {
  const map = new Map<string, ts.FunctionDeclaration>();
  function visit(node: ts.Node): void {
    if (ts.isFunctionDeclaration(node) && node.name) map.set(node.name.text, node);
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return map;
}

function scanObjectLiteralMembers(
  obj: ts.ObjectLiteralExpression,
  functionDecls: Map<string, ts.FunctionDeclaration>,
  implemented: Set<string>
): void {
  for (const prop of obj.properties) {
    if (ts.isMethodDeclaration(prop) && ts.isIdentifier(prop.name)) {
      if (!bodyIsStub(prop.body)) implemented.add(prop.name.text);
    } else if (ts.isShorthandPropertyAssignment(prop)) {
      const name = prop.name.text;
      const fn = functionDecls.get(name);
      if (!fn || !bodyIsStub(fn.body)) implemented.add(name);
    } else if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      (ts.isArrowFunction(prop.initializer) || ts.isFunctionExpression(prop.initializer))
    ) {
      const body = prop.initializer.body;
      const isStub = ts.isBlock(body) && bodyIsStub(body);
      if (!isStub) implemented.add(prop.name.text);
    }
  }
}

function findClassScope(sourceFile: ts.SourceFile, name: string): ts.ClassDeclaration | undefined {
  let found: ts.ClassDeclaration | undefined;
  function visit(node: ts.Node): void {
    if (found) return;
    if (ts.isClassDeclaration(node) && node.name?.text === name) found = node;
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return found;
}

function isFunctionLikeNode(node: ts.Node): boolean {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isGetAccessor(node) ||
    ts.isSetAccessor(node)
  );
}

function findLocalObjectLiteralVariable(scope: ts.Node, name: string): ts.ObjectLiteralExpression | undefined {
  let found: ts.ObjectLiteralExpression | undefined;
  function visit(node: ts.Node): void {
    if (found) return;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      found = node.initializer;
      return;
    }
    if (node !== scope && isFunctionLikeNode(node)) return;
    ts.forEachChild(node, visit);
  }
  visit(scope);
  return found;
}

function findReturnedObjectLiteral(fn: ts.FunctionDeclaration): ts.ObjectLiteralExpression | undefined {
  let returnExpr: ts.Expression | undefined;
  function visit(node: ts.Node): void {
    if (returnExpr) return;
    if (ts.isReturnStatement(node) && node.expression) {
      returnExpr = node.expression;
      return;
    }
    if (node !== fn.body && isFunctionLikeNode(node)) return;
    ts.forEachChild(node, visit);
  }
  if (fn.body) visit(fn.body);
  if (!returnExpr) return undefined;

  if (ts.isObjectLiteralExpression(returnExpr)) return returnExpr;
  if (ts.isIdentifier(returnExpr) && fn.body) {
    return findLocalObjectLiteralVariable(fn.body, returnExpr.text);
  }
  return undefined;
}

function findFactoryReturnObject(sourceFile: ts.SourceFile, scopeName: string): ts.ObjectLiteralExpression | undefined {
  const factoryDecls = collectFunctionDeclarations(sourceFile);
  const factory = factoryDecls.get(`create${scopeName}`);
  return factory ? findReturnedObjectLiteral(factory) : undefined;
}

function findConstObjectLiteral(sourceFile: ts.SourceFile, name: string): ts.ObjectLiteralExpression | undefined {
  let found: ts.ObjectLiteralExpression | undefined;
  function visit(node: ts.Node): void {
    if (found) return;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      found = node.initializer;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return found;
}

function findImplementedMethodsInScope(sourceFile: ts.SourceFile, scopeName: string): Set<string> {
  const implemented = new Set<string>();

  const classScope = findClassScope(sourceFile, scopeName);
  if (classScope) {
    for (const member of classScope.members) {
      if (ts.isMethodDeclaration(member) && ts.isIdentifier(member.name) && !bodyIsStub(member.body)) {
        implemented.add(member.name.text);
      }
    }
    return implemented;
  }

  const functionDecls = collectFunctionDeclarations(sourceFile);

  const factoryObj = findFactoryReturnObject(sourceFile, scopeName);
  if (factoryObj) {
    scanObjectLiteralMembers(factoryObj, functionDecls, implemented);
    return implemented;
  }

  const constObj = findConstObjectLiteral(sourceFile, scopeName);
  if (constObj) {
    scanObjectLiteralMembers(constObj, functionDecls, implemented);
    return implemented;
  }

  throw new Error(`findImplementedMethods: could not locate implementation scope "${scopeName}"`);
}

function findImplementedMethodsInFile(sourceFile: ts.SourceFile): Set<string> {
  const implemented = new Set<string>();

  function visit(node: ts.Node): void {
    const isNamedFunction =
      (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name)) ||
      (ts.isFunctionDeclaration(node) && node.name !== undefined);

    if (isNamedFunction) {
      const name = (node as ts.MethodDeclaration | ts.FunctionDeclaration).name;
      const body = (node as ts.MethodDeclaration | ts.FunctionDeclaration).body;
      if (name && ts.isIdentifier(name) && body && ts.isBlock(body) && !bodyIsStub(body)) {
        implemented.add(name.text);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return implemented;
}

export function findImplementedMethods(source: string, scopeName?: string): Set<string> {
  const sourceFile = ts.createSourceFile('shim.ts', source, ts.ScriptTarget.Latest, true);
  return scopeName === undefined
    ? findImplementedMethodsInFile(sourceFile)
    : findImplementedMethodsInScope(sourceFile, scopeName);
}
