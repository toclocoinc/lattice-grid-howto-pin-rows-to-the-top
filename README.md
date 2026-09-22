# How to pin rows to the top of a data grid

Pins a "Team average" row above twelve sales reps: `pinnedTopRows` takes an array of your own
objects and renders them through the ordinary column pipeline, so a currency column still formats
as currency, but the row sits outside the scrolling body and outside the row set. Scroll the reps
underneath it or sort them by revenue and the pinned row does not move and its figure does not
change, because it was never counted, sorted, filtered or selected in the first place.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-pin-rows-to-the-top/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/pin-rows-to-the-top/

## The full source

Two files: `index.html` loads the grid and declares the mount point, `demo.js` configures and creates it. Copy both as they are below and it runs.

### index.html

```html
<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>How to pin rows to the top of a data grid</title>
    <meta
      name="description"
      content="Keep a summary row in view above twelve sales reps while the rest scroll past underneath. Sort the table and the pinned row stays exactly where it was, because it was never part of the data. Built with Lattice Grid loaded by script tag, no install and no build."
    />
    <link rel="icon" href="data:," />
    <!--
      The grid's stylesheet, from jsDelivr. The address names the exact
      release, 1.68.2, and carries the hash of the file it expects, so the
      page can never quietly pick up a different build than the one it was
      checked against.
    -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.css"
      integrity="sha384-mcpd7S8C5nz58bZDAXdYH6rzezEhfN7B4u2SlW426dSe20GnkxTu4TygyOILnCth"
      crossorigin="anonymous"
    />
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #f4f6f9; color: #131a24; }
      header { padding: 1.5rem 1.5rem 0.5rem; max-width: 960px; margin: 0 auto; }
      header p { color: #4a5568; }
      header a { color: #2d6bff; }
      main { max-width: 960px; margin: 0 auto; padding: 0 1.5rem 2.5rem; }
      #toolbar { margin: 0 0 0.75rem; }
      #sort { font: inherit; padding: 0.4rem 0.75rem; border: 1px solid #ccd3dc; border-radius: 4px; background: #fff; cursor: pointer; }
      #grid { height: 260px; }
      #stat { font-size: 0.9rem; color: #4a5568; margin: 0.75rem 0 0; }
    </style>
  </head>
  <body>
    <header>
      <h1>How to pin rows to the top of a data grid</h1>
      <p>
        Twelve sales reps sit below a "Team average" row pinned above them. The grid only shows a
        few rows at a time, so scroll the body and the average stays put. Sort by revenue and the
        reps reorder underneath it, but the average row does not move and its figure does not
        change, because a pinned row is not part of the data. Read the
        <a href="https://www.latticegrid.dev/docs/how-to/pin-rows-to-the-top/">full how-to</a>
        on latticegrid.dev.
      </p>
    </header>
    <main>
      <div id="toolbar">
        <button id="sort" type="button">Sort by revenue</button>
      </div>
      <div id="grid"></div>
      <p id="stat"></p>
    </main>

    <!--
      The library, as a classic script tag. No npm install, no bundler, no
      type="module": the file runs as it arrives and leaves the LatticeGrid
      global behind.
    -->
    <script
      src="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.js"
      integrity="sha384-vCzLyFYn0T0lz/vkdH4x0JpJZkOazZgI2LiGui7lm5uerdZd0Z46G9hr3Aq1FFPS"
      crossorigin="anonymous"
    ></script>
    <script src="./demo.js"></script>
  </body>
</html>
```

### demo.js

```js
/**
 * Pin a summary row above the grid, and keep it there through a scroll and a sort.
 *
 * `pinnedTopRows` takes an array of your own objects and renders them through
 * the same column pipeline as the data (so a currency column still formats
 * as currency), but they sit outside the scrolling body and outside the row
 * set: not counted, not sorted, not filtered and not selectable. That is
 * what makes a summary line workable at all, since a total row that got
 * caught up in its own sort would tell you nothing.
 */

// Tied to toclocoinc.github.io only; has no effect anywhere else and needs
// no key at all to run this page from a local copy.
LatticeGrid.setLicence(
  'LG1.eyJ2IjoxLCJwIjoibGF0dGljZS1ncmlkIiwidCI6IlRPQ0xPQ08gSW5jIC0gcHVibGljIGRlbW9zIiwiZSI6IjIwMzAtMDEtMDEiLCJkIjpbInRvY2xvY29pbmMuZ2l0aHViLmlvIl19.9De42ua3aCGpiMB6EVRP7Tv-upUlDI-0T07rlSPzvCrsqg8t4YJi7SRnStEpAg48uzmcG7il1fR_TfwkUE7iCA'
);

const REPS = [
  { id: 'R01', rep: 'Amara Chen', region: 'EMEA', deals: 14, revenue: 128400 },
  { id: 'R02', rep: 'Ben Oduya', region: 'AMER', deals: 9, revenue: 87200 },
  { id: 'R03', rep: 'Carla Nunes', region: 'EMEA', deals: 21, revenue: 184300 },
  { id: 'R04', rep: 'Dev Patel', region: 'APAC', deals: 11, revenue: 96500 },
  { id: 'R05', rep: 'Elin Karlsson', region: 'EMEA', deals: 7, revenue: 61800 },
  { id: 'R06', rep: 'Faisal Rahman', region: 'APAC', deals: 16, revenue: 142900 },
  { id: 'R07', rep: 'Grace Kim', region: 'AMER', deals: 19, revenue: 171200 },
  { id: 'R08', rep: 'Hugo Alves', region: 'EMEA', deals: 5, revenue: 43100 },
  { id: 'R09', rep: 'Ines Moreau', region: 'AMER', deals: 13, revenue: 118700 },
  { id: 'R10', rep: 'Jonas Weber', region: 'EMEA', deals: 10, revenue: 92300 },
  { id: 'R11', rep: 'Keiko Sato', region: 'APAC', deals: 17, revenue: 156800 },
  { id: 'R12', rep: 'Liam Sullivan', region: 'AMER', deals: 8, revenue: 71400 },
];

const avgDeals = REPS.reduce((t, r) => t + r.deals, 0) / REPS.length;
const avgRevenue = REPS.reduce((t, r) => t + r.revenue, 0) / REPS.length;

const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  columnDefaults: { sort: true },
  pinnedTopRows: [
    { rep: 'Team average', region: '', deals: avgDeals, revenue: avgRevenue },
  ],
  columns: [
    { field: 'rep', title: 'Rep', layout: { flex: 1, min: 160 } },
    { field: 'region', title: 'Region', layout: { width: 90 } },
    { field: 'deals', title: 'Deals', type: 'number', format: { decimals: 1 }, layout: { width: 100 } },
    {
      field: 'revenue', title: 'Revenue', type: 'number',
      format: { style: 'currency', currency: 'USD', decimals: 2 },
      layout: { width: 140 },
    },
  ],
  rows: REPS,
});
window.__demoGrid = grid; // read by tools/verify.mjs

let descending = true;
document.getElementById('sort').addEventListener('click', () => {
  grid.sort.set([{ col: 'revenue', dir: descending ? 'desc' : 'asc' }]);
  descending = !descending;
});

document.getElementById('stat').textContent =
  `${REPS.length} reps; the pinned row above reads the team average and does not move ` +
  'when you scroll or sort the table below it';
```

`pinnedTopRows` anchors above the body; `pinnedBottomRows` does the same below it, beneath a grand
total row if the grid shows one. Either way, `grid.setPinnedRows(rows, { edge })` replaces the
pinned rows at runtime; pass a new array rather than mutating the previous one, since array
identity is what tells the grid the rows have changed.

## Running it yourself

Open `index.html` in a browser, or serve the folder with any static file server. The grid loads
from jsDelivr by script tag, so there is no install and no build step. It runs keyless on
`localhost`; the licence key in `demo.js` is bound to `toclocoinc.github.io` and has no effect
anywhere else.

## Licence

MIT, see [LICENSE](./LICENSE). Lattice Grid itself is licensed separately per domain:
https://www.latticegrid.dev/pricing/
