export type StubOutputFormat = 'object' | 'class';

export function generateStubSource(
  interfaceName: string,
  methodNames: readonly string[],
  alreadyImplemented: ReadonlySet<string>,
  outputFormat: StubOutputFormat = 'object'
): string {
  const missing = methodNames.filter((name) => !alreadyImplemented.has(name));

  if (outputFormat === 'class') {
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

  const stubs = missing
    .map(
      (name) => `  ${name}(...args: unknown[]): never {
    throw new GasPNotImplementedError('${interfaceName}', '${name}');
  },`
    )
    .join('\n');

  return `import { GasPNotImplementedError } from '../../errors.js';

export const ${interfaceName}Stubs = {
${stubs}
};
`;
}
