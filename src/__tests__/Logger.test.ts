import { describe, it, expect, vi, afterEach } from 'vitest';
import { Logger } from '../shims/Logger.js';

afterEach(() => { vi.restoreAllMocks(); });

describe('Logger.log()', () => {
  it('writes the message to stdout', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    Logger.log('hello from GAS');
    expect(spy).toHaveBeenCalledWith('hello from GAS');
  });
});
