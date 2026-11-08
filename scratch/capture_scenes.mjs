import puppeteer from 'puppeteer-core';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Cockpit Overview
  console.log('Capturing Scene 1: Cockpit Overview...');
  await page.screenshot({ path: 'scratch/video_assets/scene1.png' });

  // 2. Aircraft Database
  console.log('Capturing Scene 2: Aircraft Database...');
  const acButton = await page.$('button.nav-item:nth-child(2)');
  if (acButton) await acButton.click();
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scratch/video_assets/scene2.png' });

  // 3. Motors & Components Database
  console.log('Capturing Scene 3: Motors Database...');
  const motorButton = await page.$('button.nav-item:nth-child(3)');
  if (motorButton) await motorButton.click();
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scratch/video_assets/scene3.png' });

  // 4. Airplane Calculator
  console.log('Capturing Scene 4: Airplane Calculator...');
  const calcButton = await page.$('button.nav-item:nth-child(7)');
  if (calcButton) await calcButton.click();
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scratch/video_assets/scene4.png' });

  // 5. Validator Checks
  console.log('Capturing Scene 5: Validator Checks...');
  const valButton = await page.$('button.nav-item:nth-child(9)');
  if (valButton) await valButton.click();
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scratch/video_assets/scene5.png' });

  await browser.close();
  console.log('All 5 1080p scenes captured perfectly!');
})();
