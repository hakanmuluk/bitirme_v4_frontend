import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,     // 📉 huge RAM saver
    minify: 'esbuild',    // lightweight minifier
  }
});
