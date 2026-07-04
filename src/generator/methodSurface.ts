import ts from 'typescript';
import { readFileSync } from 'fs';

function findModuleMember(
  node: ts.Node,
  segments: string[]
): ts.ModuleBlock | ts.SourceFile | undefined {
  if (segments.length === 0) return undefined;
  const [head, ...rest] = segments;
  let match: ts.ModuleDeclaration | undefined;

  ts.forEachChild(node, (child) => {
    if (match) return;
    if (ts.isModuleDeclaration(child) && child.name.text === head) {
      match = child;
    }
  });

  if (!match || !match.body || !ts.isModuleBlock(match.body)) return undefined;
  if (rest.length === 0) return match.body;
  return findModuleMember(match.body, rest);
}

function findInterface(scope: ts.Node, name: string): ts.InterfaceDeclaration | undefined {
  let found: ts.InterfaceDeclaration | undefined;
  ts.forEachChild(scope, (child) => {
    if (found) return;
    if (ts.isInterfaceDeclaration(child) && child.name.text === name) {
      found = child;
    }
  });
  return found;
}

export function extractMethodSurface(filePath: string, qualifiedInterfaceName: string): string[] {
  const segments = qualifiedInterfaceName.split('.');
  const interfaceName = segments[segments.length - 1];
  const namespaceSegments = segments.slice(0, -1);
  if (interfaceName === undefined) throw new Error(`Invalid interface name: ${qualifiedInterfaceName}`);

  const sourceFile = ts.createSourceFile(
    filePath,
    readFileSync(filePath, 'utf-8'),
    ts.ScriptTarget.Latest,
    true
  );

  const scope = findModuleMember(sourceFile, namespaceSegments);
  if (!scope) throw new Error(`Namespace not found: ${namespaceSegments.join('.')}`);

  const interfaceDecl = findInterface(scope, interfaceName);
  if (!interfaceDecl) throw new Error(`Interface not found: ${qualifiedInterfaceName}`);

  const names: string[] = [];
  for (const member of interfaceDecl.members) {
    if (ts.isMethodSignature(member) && ts.isIdentifier(member.name)) {
      if (!names.includes(member.name.text)) names.push(member.name.text);
    }
  }
  return names;
}
