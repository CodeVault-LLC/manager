import path, { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': path.resolve('src/main'),
        '@shared': path.resolve(__dirname, '../../packages/shared'),
        '@manager': path.resolve(__dirname, '../../libs/')
      }
    },
    build: {
      rollupOptions: {
        external: ['drizzle-orm', 'libsql', 'drizzle-orm/sqlite-core']
      }
    }
  },
  preload: {
    resolve: {
      alias: {
        '@manager': path.resolve(__dirname, '../../libs/')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts')
        },
        output: {
          entryFileNames: '[name].js',
          format: 'cjs',
        },
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': path.resolve('src/renderer/src'),
        '@manager': path.resolve(__dirname, '../../libs/'),
        '@shared': path.resolve(__dirname, '../../packages/shared')
      }
    },
    plugins: [
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react()
    ]
  }
})
