const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  
  console.log("Clicking Security & Access...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const secBtn = buttons.find(b => b.textContent.includes('SECURITY & ACCESS'));
    if (secBtn) secBtn.click();
    else console.log("Button not found");
  });

  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
