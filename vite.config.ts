import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'node:path'
import pocketMockPlugin from './plugin/vite-plugin-pocket-mock.js' // <--- 引入刚才写的插件
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        css: 'injected',
      },
      emitCss: false,
    }),
    pocketMockPlugin(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.svelte'],
      rollupTypes: true,
      tsconfigPath: './tsconfig.app.json'
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'PocketMock',
      fileName: (format) => `pocket-mock.${format}.js`
    },
    rollupOptions: {
      external: [],
    }
  }
})