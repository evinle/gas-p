import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execFileSync } from 'child_process';

vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
}));

const mockExecFileSync = vi.mocked(execFileSync);

beforeEach(() => { vi.resetAllMocks(); });

describe('runInSubprocess()', () => {
  it('spawns a node subprocess with the given script and returns the parsed JSON result', async () => {
    mockExecFileSync.mockReturnValue(JSON.stringify({ hello: 'world' }));
    const { runInSubprocess } = await import('../core/subprocessBridge.js');
    const result = runInSubprocess('process.stdout.write(JSON.stringify({ hello: "world" }))');
    expect(result).toEqual({ hello: 'world' });
    expect(mockExecFileSync).toHaveBeenCalledTimes(1);
  });

  it('rethrows a subprocess-side error as a normal JS Error with a clean message', async () => {
    mockExecFileSync.mockReturnValue(JSON.stringify({ __gasp_subprocess_error__: 'calendar not found' }));
    const { runInSubprocess } = await import('../core/subprocessBridge.js');
    expect(() => runInSubprocess('...')).toThrow('calendar not found');
  });

  it('throws a clear error when the subprocess produces non-JSON output', async () => {
    mockExecFileSync.mockReturnValue('not json at all');
    const { runInSubprocess } = await import('../core/subprocessBridge.js');
    expect(() => runInSubprocess('...')).toThrow(/Unexpected subprocess output/);
  });
});
