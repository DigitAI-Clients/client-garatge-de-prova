import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  // Mantenim tsconfigPaths per resoldre els @/ automàticament
  plugins: [react(), tsconfigPaths()],
  
  resolve: {
    alias: {
      // 👇 AQUEST ÉS EL FIX CLAU:
      // Quan algú importi "server-only", li donem el nostre fitxer buit
      'server-only': path.resolve(__dirname, './__mocks__/server-only.ts'),
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    
    // 👇 CORRECCIÓ DE RUTA: 
    // He posat 'src/test/setup.ts' (singular) perquè coincideixi amb el teu projecte.
    // VERIFICA que tens el fitxer a: src/test/setup.ts
    setupFiles: ['./src/test/setup.ts'], 
    
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    // Opcional: Ignorar CSS als tests per velocitat
    css: false,
  },
});