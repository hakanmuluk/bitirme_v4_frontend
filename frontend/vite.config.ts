import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // 1) use esbuild minifier (fast & low‑memory)  –or–  set to false to skip minify
    minify: 'esbuild',   // or  false
  }
});
