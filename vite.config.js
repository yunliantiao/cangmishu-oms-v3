import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import { resolve } from 'path';
import { theme } from './src/lib/theme';

function toSassVars(obj) {
  return Object.entries(obj)
    .map(([key, value]) => `$${key}: ${value};`)
    .join('\n');
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: resolve(__dirname, 'src/quasar-variables.scss'),
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/css/base.scss";
          ${toSassVars(theme)}
        `,
      },
    },
  },
});
