import puppeteer from 'puppeteer';
import handler from 'serve-handler';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const BUILD_DIR = path.resolve(__dirname, '../build');

// Routes we want to pre-render
const routes = [
  '/',
  '/video-portfolio',
  '/case-study/audio',
];

console.log('Starting prerender script...');

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: BUILD_DIR,
    rewrites: [{ source: '**', destination: '/index.html' }]
  });
});

server.listen(PORT, async () => {
  console.log(`Local server started at http://localhost:${PORT}`);
  
  let browser;
  try {
    console.log('Launching headless browser...');
    browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    for (const route of routes) {
      console.log(`Prerendering ${route}...`);
      const page = await browser.newPage();
      
      // Set viewport for a standard desktop
      await page.setViewport({ width: 1280, height: 800 });
      
      // Visit the page and wait for it to be fully loaded
      await page.goto(`http://localhost:${PORT}${route}`, { 
        waitUntil: 'networkidle0',
        timeout: 60000 
      });
      
      // Wait extra time for framer-motion animations to complete
      // so the snapshot captures elements with opacity: 1
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let html = await page.content();
      
      // Puppeteer's React execution removes the data-prerendered flag. 
      // We need to inject it back so that real users' browsers hide the flash.
      html = html.replace(/id="root"/, 'id="root" data-prerendered="true"');
      
      // Save the generated HTML
      const routeDir = path.join(BUILD_DIR, route);
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      
      const filePath = path.join(routeDir, 'index.html');
      fs.writeFileSync(filePath, html);
      console.log(`✅ Saved ${filePath}`);
      
      await page.close();
    }
  } catch (error) {
    console.error('Error during prerendering:', error);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
    server.close();
    console.log('Prerendering complete!');
  }
});
