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
