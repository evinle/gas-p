import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { gasPVitePlugin } from 'gas-p/vite';

const srcDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [gasPVitePlugin({ srcDir })],
});
