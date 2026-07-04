import { describe, it, expect, vi, afterEach } from 'vitest';
import { createServer, type ViteDevServer } from 'vite';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gasPVitePlugin } from '../adapters/vitePlugin.js';

// Exercises the real Vite dev server (server.watcher/server.hot), not the
// hand-rolled fakes in vitePlugin.test.ts — this is what actually proves the
// plugin's hot-reload wiring holds up against Vite's true API, the way a
// future `vite` upgrade could otherwise silently break.
describe('gasPVitePlugin hot reload (real Vite dev server)', () => {
  let server: ViteDevServer | undefined;
  let srcDir: string | undefined;

  afterEach(async () => {
    await server?.close();
    server = undefined;
    if (srcDir) rmSync(srcDir, { recursive: true, force: true });
    srcDir = undefined;
  });

  it('sends a full-reload over the real hot channel when a watched .gs file changes on disk', async () => {
    srcDir = mkdtempSync(join(tmpdir(), 'gas-p-hotreload-'));
    writeFileSync(join(srcDir, 'Code.gs'), 'function add(a, b) {\n  return a + b;\n}\n');

    server = await createServer({
      configFile: false,
      root: srcDir,
      logLevel: 'silent',
      // WSL2/network filesystems don't reliably deliver native fs change
      // events to chokidar; polling makes the test deterministic everywhere
      // at the cost of the (short, fixed) polling interval below.
      server: { watch: { usePolling: true, interval: 50 } },
      plugins: [gasPVitePlugin({ srcDir })],
    });

    const sent: unknown[] = [];
    vi.spyOn(server.hot, 'send').mockImplementation((payload: unknown) => {
      sent.push(payload);
    });

    // server.watcher.add(srcDir), called inside the plugin's configureServer,
    // scans the directory asynchronously before it's actually watching —
    // writing immediately risks a race where the edit lands before the scan
    // completes and chokidar never sees it. Wait until the watcher actually
    // reports the file as watched before editing it.
    await vi.waitFor(
      () => {
        const watched = server!.watcher.getWatched();
        expect(Object.values(watched).flat()).toContain('Code.gs');
      },
      { timeout: 5000, interval: 50 }
    );

    writeFileSync(join(srcDir, 'Code.gs'), 'function add(a, b) {\n  return a + b + 1;\n}\n');

    await vi.waitFor(
      () => {
        expect(sent).toContainEqual({ type: 'full-reload' });
      },
      { timeout: 12000, interval: 100 }
    );
  }, 15000);
});
