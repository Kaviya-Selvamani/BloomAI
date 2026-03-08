const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const base = process.argv[2] || 'http://localhost:5176';
  const outDir = 'screenshots';
  const routes = [
    '/',
    '/dashboard',
    '/ask',
    '/diagnostic',
    '/roadmap',
    '/learn',
    '/quiz',
    '/statistics',
    '/history',
    '/profile'
  ];

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  for (const route of routes) {
    const url = (base + (route.startsWith('/') ? route : '/' + route)).replace(/\/\/+/, '/').replace('http:/', 'http://');
    const name = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '_');
    const outPath = `${outDir}/${name}.png`;
    try {
      console.log('Opening', url);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      // small wait for any client-side hydration/animations
      await page.waitForTimeout(600);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log('Saved', outPath);
    } catch (err) {
      console.error('Failed to capture', url, err.message);
    }
  }

  await browser.close();
  console.log('Done. Screenshots in', outDir);
})();
