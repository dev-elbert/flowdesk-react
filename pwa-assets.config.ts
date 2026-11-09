import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config';

// Fundo escuro do app nos ícones que o celular recorta (Android) ou arredonda (iPhone).
const background = '#090f1c';

// Gera os ícones do app (PNG) a partir do favicon.svg: npm run generate-pwa-assets
export default defineConfig({
  preset: {
    ...preset,
    maskable: { ...preset.maskable, resizeOptions: { background } },
    apple: { ...preset.apple, resizeOptions: { background } },
  },
  images: ['public/favicon.svg'],
});
