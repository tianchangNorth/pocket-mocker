import fs from 'fs';
import path from 'path';

const CONFIG_FILE_NAME = 'pocket-mock.json';

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

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        
        if (req.url?.startsWith('/__pocket_mock/rules') && req.method === 'GET') {
          
          const configPath = path.resolve(process.cwd(), CONFIG_FILE_NAME);

          try {
            if (fs.existsSync(configPath)) {
              const data = fs.readFileSync(configPath, 'utf-8');

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
              const defaultRules = createDefaultRules();
              fs.writeFileSync(configPath, JSON.stringify(defaultRules, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(defaultRules));
              
            }
            return; 
          } catch (e) {
            console.error('[PocketMock] Failed to read/write config', e);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to handle config' }));
            return;
          }
        }

        if (req.url?.startsWith('/__pocket_mock/save') && req.method === 'POST') {
          
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', () => {
            try {
              const configPath = path.resolve(process.cwd(), CONFIG_FILE_NAME);
              const parsed = JSON.parse(body);
              fs.writeFileSync(configPath, JSON.stringify(parsed, null, 2));

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
              
            } catch (e) {
              const isSyntaxError = e instanceof SyntaxError;
              console.error(isSyntaxError ? '[PocketMock] Invalid config JSON' : '[PocketMock] Save failed', e);
              res.statusCode = isSyntaxError ? 400 : 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: isSyntaxError ? 'Invalid JSON' : 'Save failed' }));
            }
          });
          return; 
        }

        next();
      });
    }
  }
}
