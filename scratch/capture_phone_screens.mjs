import puppeteer from 'puppeteer-core';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Standard modern Android phone resolution (9:16 aspect ratio - 1080x1920)
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Phone Screenshot 1: Cockpit Dashboard & Telemetry
  console.log('Capturing Phone 1: Cockpit Overview...');
  await page.screenshot({ path: 'public/phone-screen-1-cockpit.png' });

  // 2. Phone Screenshot 2: Aircraft Hangar Database
  console.log('Capturing Phone 2: Aircraft Database...');
  const acButton = await page.$('button.nav-item:nth-child(2)');
  if (acButton) await acButton.click();
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'public/phone-screen-2-hangar.png' });

  // 3. Phone Screenshot 3: Motors & Components Database
  console.log('Capturing Phone 3: Motors Database...');
  const motorButton = await page.$('button.nav-item:nth-child(3)');
  if (motorButton) await motorButton.click();
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'public/phone-screen-3-motors.png' });

  // 4. Phone Screenshot 4: Airplane Calculator
  console.log('Capturing Phone 4: Airplane Calculator...');
  const calcButton = await page.$('button.nav-item:nth-child(7)');
  if (calcButton) await calcButton.click();
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'public/phone-screen-4-calculator.png' });

  // 5. Phone Screenshot 5: Safety Pre-Check & Validator
  console.log('Capturing Phone 5: Validator Checks...');
  const valButton = await page.$('button.nav-item:nth-child(9)');
  if (valButton) await valButton.click();
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'public/phone-screen-5-validator.png' });

  await browser.close();
  console.log('All 5 phone screenshots captured at 1080x1920!');
})();
