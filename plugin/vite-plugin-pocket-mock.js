// vite-plugin-pocket-mock.ts
const fs = require('fs');
const path = require('path');

// We store configuration in this file in the project root directory
const CONFIG_FILE_NAME = 'pocket-mock.json';

module.exports = function pocketMockPlugin() {
  return {
    name: 'vite-plugin-pocket-mock',

    // configureServer hook allows us to add custom middleware to Vite's dev server
    configureServer(server) {
      console.log('[PocketMock] Plugin loaded');

      server.middlewares.use((req, res, next) => {
        console.log(`[PocketMock] Request: ${req.method} ${req.url}`);

        // Handle /__pocket_mock/rules
        if (req.url?.startsWith('/__pocket_mock/rules') && req.method === 'GET') {
          console.log('[PocketMock] Handling GET /__pocket_mock/rules');
          const configPath = path.resolve(process.cwd(), CONFIG_FILE_NAME);

          try {
            if (fs.existsSync(configPath)) {
              // If file exists, read and return it
              const data = fs.readFileSync(configPath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
              console.log(`[PocketMock] Read config file: ${CONFIG_FILE_NAME}`);
            } else {
              // If file doesn't exist, return empty array
              res.setHeader('Content-Type', 'application/json');
              res.end('[]');
              console.log(`[PocketMock] Config file not found, returning empty array`);
            }
            return; // Important: don't call next()
          } catch (e) {
            console.error('[PocketMock] Failed to read config', e);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to read config' }));
            return;
          }
        }

        // Handle /__pocket_mock/save
        if (req.url?.startsWith('/__pocket_mock/save') && req.method === 'POST') {
          console.log('[PocketMock] Handling POST /__pocket_mock/save');
          // Node.js handles POST Body through streams
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', () => {
            try {
              const configPath = path.resolve(process.cwd(), CONFIG_FILE_NAME);
              // Write to file with formatting (2-space indent)
              // The body here is already a JSON string from the frontend
              fs.writeFileSync(configPath, body);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
              console.log(`[PocketMock] Rules saved to ${CONFIG_FILE_NAME}`);
            } catch (e) {
              console.error('[PocketMock] Save failed', e);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Save failed' }));
            }
          });
          return; // Important: don't call next()
        }

        // If not our API, continue with other requests
        next();
      });
    }
  }
}