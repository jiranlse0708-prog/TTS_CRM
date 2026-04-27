// 로컬 프리뷰용 임시 서버
// index.html이 /TTS_CRM/assets/... 절대 경로를 사용하므로 그 접두사를 벗겨서 현재 폴더에서 서빙합니다.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.map':  'application/json; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // /TTS_CRM/ 접두사 제거 (배포 경로 호환)
  if (urlPath.startsWith('/TTS_CRM/')) urlPath = urlPath.slice('/TTS_CRM'.length);
  if (urlPath === '/TTS_CRM')         urlPath = '/';
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  const safe = path.normalize(path.join(ROOT, urlPath));
  if (!safe.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }

  fs.stat(safe, (err, stat) => {
    if (err || !stat.isFile()) {
      // SPA fallback
      const fallback = path.join(ROOT, 'index.html');
      fs.readFile(fallback, (e, data) => {
        if (e) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(data);
      });
      return;
    }
    const ext = path.extname(safe).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(safe).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[ready] http://localhost:${PORT}/  (also /TTS_CRM/)`);
});
