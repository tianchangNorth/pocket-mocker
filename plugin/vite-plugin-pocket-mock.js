// vite-plugin-pocket-mock.ts
import fs from 'fs';
import path from 'path';

// We store configuration in this file in the project root directory
const CONFIG_FILE_NAME = 'pocket-mock.json';

// Create default rules for new installations
function createDefaultRules() {
  return [
    {
      id: 'demo-1',
      method: 'GET',
      url: '/api/demo',
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          code: 0,
          message: 'Hello PocketMock',
          data: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        }
      },
      enabled: true,
      delay: 500,
      status: 200,
      headers: {},
      createdAt: new Date().toISOString()
    }
  ];
}

export default function pocketMockPlugin() {
  return {
    name: 'vite-plugin-pocket-mock',

    // configureServer hook allows us to add custom middleware to Vite's dev server
    configureServer(server) {
      

      server.middlewares.use((req, res, next) => {
        

        // Handle /__pocket_mock/rules
        if (req.url?.startsWith('/__pocket_mock/rules') && req.method === 'GET') {
          
          const configPath = path.resolve(process.cwd(), CONFIG_FILE_NAME);

          try {
            if (fs.existsSync(configPath)) {
              // If file exists, read and return it
              const data = fs.readFileSync(configPath, 'utf-8');

              // Check if file is empty or contains invalid JSON
              if (!data.trim()) {
                
                res.setHeader('Content-Type', 'application/json');
                res.end('[]');
              } else if (data.trim() === '[]') {
                
                res.setHeader('Content-Type', 'application/json');
                res.end('[]');
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
                
              }
            } else {
              // If file doesn't exist, create it with default rules only for first-time use
              
              const defaultRules = createDefaultRules();
              fs.writeFileSync(configPath, JSON.stringify(defaultRules, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(defaultRules));
              
            }
            return; // Important: don't call next()
          } catch (e) {
            console.error('[PocketMock] Failed to read/write config', e);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to handle config' }));
            return;
          }
        }

        // Handle /__pocket_mock/save
        if (req.url?.startsWith('/__pocket_mock/save') && req.method === 'POST') {
          
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