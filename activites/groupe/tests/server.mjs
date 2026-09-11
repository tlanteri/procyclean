import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export function startServer() {
  const sessions = new Map();
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/test-db') {
      if (request.method === 'POST') {
        let body = ''; for await (const chunk of request) body += chunk;
        const { key, value } = JSON.parse(body); sessions.set(key, value);
      }
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(Object.fromEntries(sessions))); return;
    }
    let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    try {
      let data = fs.readFileSync(file);
      // Le remplacement n'existe que sur ce serveur de test local.
      if (url.pathname === '/activites/groupe/session.js') data = Buffer.from(data.toString().replace(/https:\/\/www\.gstatic\.com\/firebasejs\/12\.16\.0\/firebase-(app|auth|database)\.js/g, '/activites/groupe/tests/firebase.js'));
      const mime = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.ttf':'font/ttf' };
      response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
      response.end(data);
    } catch { response.writeHead(404).end(); }
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ server, origin:`http://127.0.0.1:${server.address().port}` })));
}
