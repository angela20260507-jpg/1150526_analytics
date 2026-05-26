import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import dotenv from 'dotenv';

// Load env files for local development
dotenv.config({ path: '.env.local' });
dotenv.config();

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/generate')) {
            let body = '';
            req.on('data', chunk => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                // Dynamically import the api handler so it works under vite environment
                const { default: handler } = await server.ssrLoadModule('./api/generate.ts');
                
                const parsedBody = body ? JSON.parse(body) : {};
                const vercelReq = Object.assign(req, { body: parsedBody });
                
                const vercelRes = {
                  status(statusCode: number) {
                    res.statusCode = statusCode;
                    return this;
                  },
                  json(data: any) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    return this;
                  },
                  setHeader(name: string, value: string) {
                    res.setHeader(name, value);
                    return this;
                  },
                  send(data: any) {
                    res.end(data);
                    return this;
                  }
                };
                
                await handler(vercelReq, vercelRes);
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message || 'Internal Server Error' }));
              }
            });
          } else {
            next();
          }
        });
      }
    },
  };
});
