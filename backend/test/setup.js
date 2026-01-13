import 'dotenv/config';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, '..');

export function createTestServer() {
  return http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const { url } = req;
    const [urlPath, queryString] = url.split('?');

    const queryParams = new URLSearchParams(queryString);
    req.query = Object.fromEntries(queryParams.entries());

    let filePath = path.join(backendDir, urlPath);

    const staticJsFile = filePath.endsWith('.js') ? filePath : filePath + '.js';

    if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isDirectory()) {
      if (fs.existsSync(staticJsFile)) {
        filePath = staticJsFile;
      } else {
        const parentDir = path.dirname(filePath);
        const slug = path.basename(filePath);
        if (fs.existsSync(parentDir) && fs.lstatSync(parentDir).isDirectory()) {
          const files = fs.readdirSync(parentDir);
          const dynamicFile = files.find(file => file.startsWith('[') && file.endsWith('].js'));
          if (dynamicFile) {
            const paramName = dynamicFile.slice(1, -4);
            req.query[paramName] = slug;
            filePath = path.join(parentDir, dynamicFile);
          }
        }
      }
    }

    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.js');
    }

    if (!filePath.endsWith('.js') && !fs.existsSync(filePath)) {
      filePath += '.js';
    }

    try {
      if (fs.existsSync(filePath)) {
        const moduleURL = 'file://' + filePath + '?t=' + Date.now();
        const module = await import(moduleURL);
        const handler = module.default;

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', () => {
          if (body) {
            try {
              req.body = JSON.parse(body);
            } catch (e) {
              req.body = body;
            }
          }
          handler(req, res);
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Not Found: ${req.url}` }));
      }
    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
  });
}
