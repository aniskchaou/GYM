const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const PUBLIC = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript',
  '.css': 'text/css', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(PUBLIC, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  if (!ext) filePath = path.join(PUBLIC, 'index.html');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(PUBLIC, 'index.html'), (e2, d2) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(d2);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ██████╗ ██╗   ██╗███╗   ███╗███████╗██╗      ██████╗ ██╗    ██╗');
  console.log('  ██╔════╝ ╚██╗ ██╔╝████╗ ████║██╔════╝██║     ██╔═══██╗██║    ██║');
  console.log('  ██║  ███╗ ╚████╔╝ ██╔████╔██║█████╗  ██║     ██║   ██║██║ █╗ ██║');
  console.log('  ██║   ██║  ╚██╔╝  ██║╚██╔╝██║██╔══╝  ██║     ██║   ██║██║███╗██║');
  console.log('  ╚██████╔╝   ██║   ██║ ╚═╝ ██║██║     ███████╗╚██████╔╝╚███╔███╔╝');
  console.log('   ╚═════╝    ╚═╝   ╚═╝     ╚═╝╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝');
  console.log('');
  console.log(`  🎮  DEMO MODE  —  No backend, no database`);
  console.log(`  🌐  Open your browser:  http://localhost:${PORT}`);
  console.log('');
  console.log('  Demo credentials:');
  console.log('  • Owner        owner@demogym.com      / Owner@1234');
  console.log('  • Trainer      trainer@demogym.com    / Trainer@1234');
  console.log('  • Member       member@demogym.com     / Member@1234');
  console.log('  • Receptionist reception@demogym.com  / Reception@1234');
  console.log('');
});

