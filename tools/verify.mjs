/**
 * Load the demo in a real headless browser and check that it works.
 *
 * Serves the project locally and drives it with the same minimal Chrome
 * driver the grid's own test suite uses (tools/browser.js), so this needs no
 * dependency beyond Chrome itself.
 *
 * Checks:
 *   - the library arrived and left the LatticeGrid global behind;
 *   - all 12 reps land in the grid (grid.rows.matchCount(), not a DOM count),
 *     and the pinned row sits above them, keyed by data-pinned="top";
 *   - the pinned row's Revenue and Deals cells read the average of all 12
 *     reps, computed here from the same inline data demo.js loads;
 *   - scrolling the body down moves the data rows but leaves the pinned
 *     row's screen position unchanged;
 *   - clicking "Sort by revenue" reorders the data rows (the top data row
 *     becomes the highest earner) while the pinned row's figures and
 *     position do not change, because it takes no part in the sort;
 *   - nothing logged a console error or threw while the page ran.
 *
 * Exits non-zero on any failure, so it can gate a deployment.
 *
 * Usage: node tools/verify.mjs
 */

import { startServer } from './serve.mjs';
import { Browser, available } from './browser.js';

if (!available()) {
  console.log('No headless browser on this machine; skipping verify.mjs.');
  process.exit(0);
}

// The same 12 reps demo.js loads, so every expected figure is computed here
// rather than hard-coded, and stays honest if the data ever changes.
const REPS = [
  { rep: 'Amara Chen', deals: 14, revenue: 128400 },
  { rep: 'Ben Oduya', deals: 9, revenue: 87200 },
  { rep: 'Carla Nunes', deals: 21, revenue: 184300 },
  { rep: 'Dev Patel', deals: 11, revenue: 96500 },
  { rep: 'Elin Karlsson', deals: 7, revenue: 61800 },
  { rep: 'Faisal Rahman', deals: 16, revenue: 142900 },
  { rep: 'Grace Kim', deals: 19, revenue: 171200 },
  { rep: 'Hugo Alves', deals: 5, revenue: 43100 },
  { rep: 'Ines Moreau', deals: 13, revenue: 118700 },
  { rep: 'Jonas Weber', deals: 10, revenue: 92300 },
  { rep: 'Keiko Sato', deals: 17, revenue: 156800 },
  { rep: 'Liam Sullivan', deals: 8, revenue: 71400 },
];

const avgDeals = REPS.reduce((t, r) => t + r.deals, 0) / REPS.length;
const avgRevenue = REPS.reduce((t, r) => t + r.revenue, 0) / REPS.length;
const topEarner = [...REPS].sort((a, b) => b.revenue - a.revenue)[0];

// A round-tripped display figure: strip everything but digits, '.' and '-'
// so "US$16,717.15" and "26.75" both parse the same way.
const num = (text) => Number(String(text).replace(/[^0-9.-]/g, ''));
const near = (a, b) => Math.abs(a - b) < 0.005;

const pinnedCell = (col) => `document.querySelector('.lat-row[data-pinned="top"] .lat-cell[data-col="${col}"]')?.textContent`;
const pinnedTop = `document.querySelector('.lat-row[data-pinned="top"]')?.getBoundingClientRect().top`;
const firstDataCell = (col) => `document.querySelector('.lat-row:not([data-pinned]) .lat-cell[data-col="${col}"]')?.textContent`;

const { server, port } = await startServer();
const browser = new Browser();

try {
  await browser.start();

  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__errs = [];
      addEventListener('error', (e) => window.__errs.push(String(e.message || e)));
      addEventListener('unhandledrejection', (e) => window.__errs.push('unhandledrejection: ' + String(e.reason)));
      const origError = console.error.bind(console);
      console.error = (...args) => { window.__errs.push('console.error: ' + args.map(String).join(' ')); origError(...args); };
    `,
  });

  await browser.open(`http://127.0.0.1:${port}/`);
  await new Promise((r) => setTimeout(r, 500));

  const failures = [];

  const hasGrid = await browser.evaluate(`typeof LatticeGrid !== 'undefined' && typeof LatticeGrid.createGrid === 'function'`);
  if (!hasGrid) failures.push('LatticeGrid.createGrid was not found on the page');

  const repCount = await browser.evaluate(`window.__demoGrid.rows.matchCount()`);
  if (repCount !== 12) failures.push(`expected 12 reps (grid.rows.matchCount()), grid reports ${repCount}`);

  const pinnedCount = await browser.evaluate(`document.querySelectorAll('.lat-row[data-pinned="top"]').length`);
  if (pinnedCount !== 1) failures.push(`expected exactly 1 pinned row, found ${pinnedCount}`);

  const dealsBefore = num(await browser.evaluate(pinnedCell('deals')));
  const revenueBefore = num(await browser.evaluate(pinnedCell('revenue')));
  if (!near(dealsBefore, avgDeals)) failures.push(`pinned row Deals: expected ${avgDeals.toFixed(2)}, grid shows ${dealsBefore}`);
  if (!near(revenueBefore, avgRevenue)) failures.push(`pinned row Revenue: expected ${avgRevenue.toFixed(2)}, grid shows ${revenueBefore}`);

  // Scroll the body down and confirm the pinned row's screen position holds.
  const topBeforeScroll = await browser.evaluate(pinnedTop);
  await browser.evaluate(`window.__demoGrid.scroll.to({ top: 300 })`);
  await new Promise((r) => setTimeout(r, 200));
  const scrollPos = await browser.evaluate(`window.__demoGrid.scroll.position().top`);
  const topAfterScroll = await browser.evaluate(pinnedTop);
  if (!(scrollPos > 0)) failures.push(`expected the body to have scrolled, grid.scroll.position().top reports ${scrollPos}`);
  if (topBeforeScroll !== topAfterScroll) {
    failures.push(`pinned row moved on scroll: top was ${topBeforeScroll}px, now ${topAfterScroll}px`);
  }

  // Click "Sort by revenue" the way a visitor would.
  await browser.evaluate(`document.getElementById('sort').click()`);
  await new Promise((r) => setTimeout(r, 200));

  const firstRevenue = num(await browser.evaluate(firstDataCell('revenue')));
  if (!near(firstRevenue, topEarner.revenue)) {
    failures.push(`sorted by revenue: expected the top data row to read ${topEarner.revenue} (${topEarner.rep}), grid shows ${firstRevenue}`);
  }

  const dealsAfterSort = num(await browser.evaluate(pinnedCell('deals')));
  const revenueAfterSort = num(await browser.evaluate(pinnedCell('revenue')));
  if (!near(dealsAfterSort, avgDeals)) failures.push(`pinned row Deals after sort: expected ${avgDeals.toFixed(2)}, grid shows ${dealsAfterSort}`);
  if (!near(revenueAfterSort, avgRevenue)) failures.push(`pinned row Revenue after sort: expected ${avgRevenue.toFixed(2)}, grid shows ${revenueAfterSort}`);

  const topAfterSort = await browser.evaluate(pinnedTop);
  if (topAfterSort !== topAfterScroll) failures.push(`pinned row moved on sort: top was ${topAfterScroll}px, now ${topAfterSort}px`);

  const errors = await browser.evaluate('window.__errs');
  if (errors.length) failures.push(`console/window errors: ${errors.join(' | ')}`);

  if (failures.length) {
    console.error('FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(
      'OK: 12 reps loaded, the pinned row read ' +
      `${avgRevenue.toFixed(2)} average revenue / ${avgDeals.toFixed(2)} average deals, ` +
      'held its position through a scroll and a sort, and the sorted table put ' +
      `${topEarner.rep} (${topEarner.revenue}) first. 0 console errors.`
    );
  }
} finally {
  await browser.close();
  server.close();
}
