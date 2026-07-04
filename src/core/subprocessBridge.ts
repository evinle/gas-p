import { execFileSync } from 'child_process';

function isSubprocessError(x: unknown): x is { __gasp_subprocess_error__: string } {
  return typeof x === 'object' && x !== null && '__gasp_subprocess_error__' in x;
}

export function runInSubprocess(script: string): unknown {
  const output = execFileSync(process.execPath, ['--input-type=module'], {
    input: script,
    encoding: 'utf-8',
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(output);
  } catch {
    throw new Error(`Unexpected subprocess output (not valid JSON): ${output}`);
  }

  if (isSubprocessError(parsed)) {
    throw new Error(parsed.__gasp_subprocess_error__);
  }
  return parsed;
}
