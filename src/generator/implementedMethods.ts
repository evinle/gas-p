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

export function findImplementedMethods(source: string, scopeName: string): Set<string> {
  const sourceFile = ts.createSourceFile('shim.ts', source, ts.ScriptTarget.Latest, true);

  const classScope = findClassScope(sourceFile, scopeName);
  if (!classScope) throw new Error(`findImplementedMethods: could not locate class "${scopeName}"`);

  const implemented = new Set<string>();
  for (const member of classScope.members) {
    if (ts.isMethodDeclaration(member) && ts.isIdentifier(member.name) && !bodyIsStub(member.body)) {
      implemented.add(member.name.text);
    }
  }
  return implemented;
}
