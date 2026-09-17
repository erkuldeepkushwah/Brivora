import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

function sendHtmlWithScript(res, filePath) {
  fs.readFile(filePath, 'utf-8', (err, html) => {
    if (err) {
      return res.status(500).send('Error loading page: ' + err.message);
    }
    const injected = html.includes('</body>')
      ? html.replace('</body>', '<script src="/nav-links.js"></script></body>')
      : html + '<script src="/nav-links.js"></script>';
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(injected);
  });
}

// Serve nav-links.js explicitly
app.get('/nav-links.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'nav-links.js'));
});

// Map routes to HTML files
// 8 selected pages:
// 1. home1 -> home.html
// 2. about -> about.html
// 3. list of service 2 -> service.html
// 4. Case studies 1 -> case-studies.html
// 5. Blog 2 -> blog.html
// 6. Contact 1 -> contact.html
// 7. Logos -> logs.html
// 8. Case cards -> course.html
const routeMap = {
  // 1. Home 1
  '/': 'home.html',
  '/index.html': 'home.html',
  '/home': 'home.html',
  '/home.html': 'home.html',
  '/home1': 'home.html',
  '/home-page-1': 'home.html',

  // 2. About
  '/about': 'about.html',
  '/about.html': 'about.html',

  // 3. List of services 2
  '/service': 'service.html',
  '/service.html': 'service.html',
  '/services': 'service.html',
  '/services.html': 'service.html',
  '/our-services': 'service.html',
  '/list-of-services-2': 'service.html',

  // 4. Case studies 1
  '/case-studies': 'case-studies.html',
  '/case-studies.html': 'case-studies.html',
  '/case-studies-1': 'case-studies.html',

  // 5. Blog 2
  '/blog': 'blog.html',
  '/blog.html': 'blog.html',
  '/blog2': 'blog.html',
  '/blog02': 'blog.html',

  // 6. Contact 1
  '/contact': 'contact.html',
  '/contact.html': 'contact.html',
  '/contact1': 'contact.html',

  // 7. Logos
  '/logs': 'logs.html',
  '/logs.html': 'logs.html',
  '/logos': 'logs.html',
  '/logos.html': 'logs.html',
  '/more/logos': 'logs.html',

  // 8. Course
  '/course': 'course.html',
  '/course.html': 'course.html',
  '/courses': 'course.html',

  // 9. Login
  '/login': 'login.html',
  '/login.html': 'login.html',
  '/signin': 'login.html',
};

// Register routes
Object.entries(routeMap).forEach(([route, file]) => {
  const filePath = path.join(__dirname, 'altes', file);
  app.get(route, (req, res) => sendHtmlWithScript(res, filePath));
  if (!route.endsWith('.html') && route !== '/') {
    app.get(`${route}/`, (req, res) => sendHtmlWithScript(res, filePath));
  }
});

// Serve static assets from 'altes', 'Public', 'public', and root
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'Public')));
app.use('/Public', express.static(path.join(__dirname, 'Public')));
app.use(express.static(path.join(__dirname, 'altes')));
app.use('/altes', express.static(path.join(__dirname, 'altes')));
app.use(express.static(__dirname));

// Fallback for HTML pages or root
app.use((req, res) => {
  sendHtmlWithScript(res, path.join(__dirname, 'altes', 'home.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
