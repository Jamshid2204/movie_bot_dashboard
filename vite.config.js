import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Pure static SPA. No dev proxy needed anymore — the app talks to Supabase directly.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: { outDir: 'dist', emptyOutDir: true },
});
