import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { parse } from 'url'
import fs from 'fs'
import path from 'path'

// Mock Vercel environment for local dev
const apiMiddleware = () => {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url.startsWith('/api/places')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
              try {
                const parsedBody = JSON.parse(body);
                // Dynamically import the handler
                const { default: handler } = await import('./api/places.js');
                
                // Polyfill Vercel's res.status().json()
                res.status = (code) => {
                  res.statusCode = code;
                  return res;
                };
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                };

                // Inject the body
                req.body = parsedBody;
                
                await handler(req, res);
              } catch (err) {
                console.error(err);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
        }
        next();
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiMiddleware()],
})
