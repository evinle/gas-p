export function generateStubSource(
  interfaceName: string,
  methodNames: readonly string[],
  alreadyImplemented: ReadonlySet<string>
): string {
  const missing = methodNames.filter((name) => !alreadyImplemented.has(name));

  const methods = missing
    .map(
      (name) => `  ${name}(...args: unknown[]): never {
    throw new GasPNotImplementedError('${interfaceName}', '${name}');
  }`
    )
    .join('\n');

  return `import { GasPNotImplementedError } from '../../errors.js';

export abstract class ${interfaceName}Stubs {
${methods}
}
`;
}
