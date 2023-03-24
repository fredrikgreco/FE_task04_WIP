// @ts-check
const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/index.html');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/School and Back/);
});

// test('writeable_field', async ({ page }) => {
//   await page.goto('http://127.0.0.1:5500/index.html');


//   await page.fill('#stop-input', 'Sexdrega');

//   await page.click('#updateButton');

//   const ulist = page.locator('ul > li');

//   await expect(ulist).toExist();

// });

test('test2', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/');

  await page.fill('#stop-input', 'Sexdrega');

  await page.click('#updateButton');

  await page.waitForSelector('ul');

  const listOneText = await page.$eval('#listOne', el => el.textContent.trim());
  expect(listOneText).toBe('Sexdrega%');

  ;
});

test('testButton', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/');

  await page.fill('#stop-input', 'Sexdrega');

  await page.click('#addFavButton');

  await page.waitForSelector('div');

  const listOneText = await page.$eval('#buttonContainer', el => el.textContent.trim());
  expect(listOneText).toBe('SexdregaX');

  ;
});