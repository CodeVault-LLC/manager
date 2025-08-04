import path, { resolve } from 'path'
import {
  defineConfig,
  externalizeDepsPlugin,
  bytecodePlugin
} from 'electron-vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { getReplacements } from './app-info'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()],
    resolve: {
      alias: {
        '@main': path.resolve('src/main'),
        '@shared': path.resolve(__dirname, '../../packages/shared'),
        '@manager/data': path.resolve(__dirname, '../../packages/data/src'),
        '@manager/core': path.resolve(__dirname, '../../packages/core/src'),
        '@manager/common': path.resolve(__dirname, '../../libs/common/src')
      }
    },
    define: {
      ...getReplacements()
    },
    build: {
      rollupOptions: {
        external: ['drizzle-orm', 'libsql', 'drizzle-orm/sqlite-core']
      }
    }
  },
  preload: {
    plugins: [],
    resolve: {
      alias: {
        '@manager/data': path.resolve(__dirname, '../../packages/data/src'),
        '@manager/core': path.resolve(__dirname, '../../packages/core/src'),
        '@manager/common': path.resolve(__dirname, '../../libs/common/src')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts')
        },
        output: {
          entryFileNames: '[name].js',
          format: 'cjs'
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': path.resolve('src/renderer/src'),
        '@manager/data': path.resolve(__dirname, '../../packages/data/src'),
        '@manager/core': path.resolve(__dirname, '../../packages/core/src'),
        '@manager/ui': path.resolve(__dirname, '../../libs/ui/src'),
        '@manager/common': path.resolve(__dirname, '../../libs/common/src'),
        '@shared': path.resolve(__dirname, '../../packages/shared')
      }
    },
    plugins: [
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react()
    ]
  }
})
