const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = parseInt(process.env.PORT || '8081', 10);
const DIST_DIR = path.resolve(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.map': 'application/json',
};

function getSafeFilePath(urlPath) {
  const cleanPath = urlPath.split('?')[0].split('#')[0];
  const decodedPath = decodeURIComponent(cleanPath);
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '');
  const candidate = path.join(DIST_DIR, normalizedPath);

  if (!candidate.startsWith(DIST_DIR)) {
    return null;
  }
  return candidate;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  const cleanUrl = req.url.split('?')[0];
  if (cleanUrl === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'esubli-web', timestamp: new Date().toISOString() }));
    return;
  }

  let filePath = getSafeFilePath(req.url);

  if (!filePath || cleanUrl === '/') {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    let finalPath = filePath;

    if (err || !stats.isFile()) {
      const subIndex = path.join(filePath, 'index.html');
      if (fs.existsSync(subIndex)) {
        finalPath = subIndex;
      } else {
        finalPath = path.join(DIST_DIR, 'index.html');
      }
    }

    fs.stat(finalPath, (fallbackErr, finalStats) => {
      if (fallbackErr || !finalStats.isFile()) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Web bundle not found. Please ensure "npm run build" was executed before starting.');
        return;
      }

      const ext = path.extname(finalPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      const isStaticAsset =
        finalPath.includes(path.sep + '_expo' + path.sep) ||
        finalPath.includes(path.sep + 'assets' + path.sep);

      const cacheControl = isStaticAsset
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=0, must-revalidate';

      const headers = {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
      };

      if (req.method === 'HEAD') {
        res.writeHead(200, headers);
        res.end();
        return;
      }

      const acceptEncoding = req.headers['accept-encoding'] || '';
      const rawStream = fs.createReadStream(finalPath);

      if (
        /\bgzip\b/.test(acceptEncoding) &&
        (contentType.startsWith('text/') ||
          contentType.includes('javascript') ||
          contentType.includes('json'))
      ) {
        headers['Content-Encoding'] = 'gzip';
        res.writeHead(200, headers);
        rawStream.pipe(zlib.createGzip()).pipe(res);
      } else {
        headers['Content-Length'] = finalStats.size;
        res.writeHead(200, headers);
        rawStream.pipe(res);
      }
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[E-Subli Web] Server running on http://0.0.0.0:${PORT}`);
  console.log(`[E-Subli Web] Serving static files from: ${DIST_DIR}`);
});
