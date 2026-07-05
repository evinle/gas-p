export function generateShimScaffoldSource(outputName: string): string {
  return `import { ${outputName}Stubs } from './generated/${outputName}.stubs.js';

class ${outputName} extends ${outputName}Stubs {}

const instance = new ${outputName}();
export { instance as ${outputName} };
`;
}
