import { describe, it, expect } from 'vitest';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execFileAsync = promisify(execFile);
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

async function packedFiles(): Promise<string[]> {
  const { stdout } = await execFileAsync('npm', ['pack', '--dry-run', '--json'], {
    cwd: repoRoot,
  });
  const [{ files }] = JSON.parse(stdout);
  return files.map((f: { path: string }) => f.path);
}

describe('npm pack contents', () => {
  it('excludes test files, source maps, and TypeScript sources', async () => {
    const files = await packedFiles();

    const offenders = files.filter(
      (path) =>
        path.includes('__tests__') ||
        path.endsWith('.test.js') ||
        path.endsWith('.map') ||
        (path.endsWith('.ts') && !path.endsWith('.d.ts')),
    );

    expect(offenders).toEqual([]);
  });

  it('includes the built entry points declared in exports and bin', async () => {
    const files = await packedFiles();

    expect(files).toContain('dist/cli.js');
    expect(files).toContain('dist/adapters/vitePlugin.js');
    expect(files).toContain('dist/client/transportShim.js');
  });
});
