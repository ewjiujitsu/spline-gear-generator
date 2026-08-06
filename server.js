// Minimal static server for the generator.
//
// ZERO DEPENDENCIES, deliberately: the whole app is one self-contained HTML file
// with no external scripts and no network calls, so the server only has to hand
// that file over. No npm install means nothing to audit, nothing to patch, and
// no supply-chain surface — the deploy cannot break because of someone else's
// package. Node's built-in http module is all this needs.
//
// Railway (and most PaaS) inject the port to listen on via the PORT env var, and
// require binding to 0.0.0.0 rather than localhost, or the health check fails.

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.png':  'image/png',
};

const server = http.createServer((req, res) => {
  // Path traversal guard: resolve, then confirm the result is still inside ROOT.
  const raw = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = raw === '/' ? 'index.html' : raw.replace(/^\/+/, '');
  const file = path.resolve(ROOT, rel);

  if (!file.startsWith(ROOT + path.sep) && file !== path.join(ROOT, 'index.html')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      // The app is one file that changes on every deploy — never let a browser
      // serve a stale copy, or users end up on an old version with no way to
      // tell. The in-page version badge is the check; caching would defeat it.
      'Cache-Control': 'no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Spline & gear generator listening on ' + PORT);
});
