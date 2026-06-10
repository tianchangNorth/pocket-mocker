import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'node:url'

import path from 'node:path'
import pocketMockPlugin from './plugin/vite-plugin-pocket-mock.js'
import dts from 'vite-plugin-dts'

const CODEMIRROR_DEDUPE = [
  '@codemirror/state',
  '@codemirror/view',
  '@codemirror/language',
  '@codemirror/commands',
  '@codemirror/search',
  '@codemirror/autocomplete',
  '@codemirror/lint'
]

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
  resolve: {
    dedupe: CODEMIRROR_DEDUPE,
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  publicDir: false,
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
