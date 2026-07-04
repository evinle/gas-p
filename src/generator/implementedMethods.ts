import ts from 'typescript';

function isGasPNotImplementedThrow(statement: ts.Statement): boolean {
  if (!ts.isThrowStatement(statement) || !statement.expression) return false;
  const expr = statement.expression;
  if (!ts.isNewExpression(expr)) return false;
  return ts.isIdentifier(expr.expression) && expr.expression.text === 'GasPNotImplementedError';
}

export function findImplementedMethods(source: string): Set<string> {
  const sourceFile = ts.createSourceFile('shim.ts', source, ts.ScriptTarget.Latest, true);
  const implemented = new Set<string>();

  function visit(node: ts.Node): void {
    const isNamedFunction =
      (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name)) ||
      (ts.isFunctionDeclaration(node) && node.name !== undefined);

    if (isNamedFunction && node.body && ts.isBlock(node.body)) {
      const name = (node as ts.MethodDeclaration | ts.FunctionDeclaration).name;
      if (name && ts.isIdentifier(name)) {
        const isStub = node.body.statements.length === 1 && isGasPNotImplementedThrow(node.body.statements[0]!);
        if (!isStub) implemented.add(name.text);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return implemented;
}
