import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const data = JSON.parse(await fs.readFile('lib/service-area-data.json', 'utf8'));
const audit = JSON.parse(await fs.readFile('assets/service-area-research/coverage-audit.json', 'utf8'));
assert.equal(audit.places.length, 536);
assert.equal(data.places.length, 189);
assert.equal(audit.maxDriveSeconds, 3600);
assert.ok(audit.places.filter(p => p.included).every(p => p.seconds <= 3600));
assert.equal(new Set(data.places.map(p => p.id)).size, data.places.length);
assert.equal(new Set(data.places.map(p => p.name)).size, data.places.length);
assert.equal(new Set(data.places.map(p => p.slug)).size, data.places.length);
for (const name of ['Bethesda', 'Frederick', 'Columbia', 'Annapolis', 'Bowie', 'Silver Spring']) assert.ok(data.places.some(p => p.name === name));
for (const name of ['Ocean City', 'Salisbury', 'Cumberland', 'Cambridge', 'Elkton', 'Easton', 'Hancock', 'Smith Island']) assert.ok(!data.places.some(p => p.name === name));

await fs.mkdir('artifacts/service-areas', { recursive: true });
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  for (const width of [1440, 768, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:3000/service-areas', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.area-letter li').count(), 189);
    assert.equal(await page.locator('.area-letter li a').count(), 189);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.getByLabel('Search your town or community').fill('Frederick');
    assert.ok(await page.locator('.area-letter').getByRole('link', { name: 'Frederick' }).isVisible());
    await page.getByLabel('Search your town or community').fill('Woodlawn');
    assert.equal(await page.locator('.area-letter li').count(), 2);
    await page.getByLabel('Search your town or community').fill('Ocean City');
    assert.equal(await page.locator('.area-letter li').count(), 0);
    assert.ok(await page.getByRole('heading', { name: 'No matching community in the directory.' }).isVisible());
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    assert.equal(await page.locator('.area-letter li').count(), 189);
    await page.locator('.area-letter summary').first().press('Enter');
    assert.ok(await page.locator('.area-letter').first().getAttribute('open') !== null);
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(scan.violations, []);
    await page.screenshot({ path: `artifacts/service-areas/${width}.png`, fullPage: true });
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`${width}px: directory, search, exclusions, keyboard, accessibility and overflow passed`);
  }
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/service-areas');
  assert.equal(await page.locator('.area-letter li').count(), 189);
  await page.locator('.area-letter summary').first().click();
  assert.ok(await page.locator('.area-letter').first().locator('li').first().isVisible());
  assert.equal(await page.locator('.area-search-controls').isVisible(), false);
  console.log('No JavaScript: all communities in initial HTML and native browsing works');
  for (const slug of ['bethesda-md', 'frederick-md', 'chevy-chase-town-md', 'woodlawn-baltimore-county-md']) {
    await page.goto(`http://localhost:3000/service-areas/${slug}`);
    assert.ok(await page.locator('h1').textContent());
    assert.ok(await page.locator('link[rel="canonical"]').getAttribute('href'));
    assert.ok(await page.locator('form').count());
    assert.ok(await page.getByRole('heading', { name: 'Nearby Maryland communities' }).count());
  }
  const sitemap = await page.request.get('http://localhost:3000/sitemap.xml');
  const sitemapText = await sitemap.text();
  assert.equal((sitemapText.match(/<loc>[^<]*\/service-areas\/[^<]+<\/loc>/g) || []).length, 189);
  console.log('Representative local pages and 189 sitemap URLs passed');
  await context.close();
} finally { await browser.close(); }
