const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  try {
    await page.goto('http://localhost:5173/adopt', { waitUntil: 'networkidle0' });
    console.log('Page loaded');
  } catch (err) {
    console.log('Navigation failed:', err.message);
  }
  
  await browser.close();
})();
