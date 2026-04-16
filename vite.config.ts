import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createHash } from 'crypto';
import { defineConfig, loadEnv, Plugin } from 'vite';

// Plugin to inject Subresource Integrity (SRI) hashes into index.html
function sriHashPlugin(): Plugin {
  return {
    name: 'sri-hash',
    enforce: 'post',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;

      const tags: Array<{ tag: string; attrs: Record<string, string> }> = [];

      for (const [fileName, chunk] of Object.entries(ctx.bundle)) {
        if (chunk.type === 'chunk' && chunk.fileName.endsWith('.js')) {
          const hash = createHash('sha384').update(chunk.code).digest('base64');
          tags.push({
            tag: 'script',
            attrs: {
              src: `/${fileName}`,
              integrity: `sha384-${hash}`,
              crossorigin: 'anonymous',
            },
          });
        } else if (chunk.type === 'asset' && chunk.fileName.endsWith('.css')) {
          const hash = createHash('sha384').update(chunk.source as string).digest('base64');
          tags.push({
            tag: 'link',
            attrs: {
              rel: 'stylesheet',
              href: `/${fileName}`,
              integrity: `sha384-${hash}`,
              crossorigin: 'anonymous',
            },
          });
        }
      }

      return tags;
    },
  };
}

export default defineConfig(({ mode }) => {
  const _env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), sriHashPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            recharts: ['recharts'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions', 'firebase/app-check'],
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
