# How to pin rows to the top of a data grid

Pins a "Team average" row above twelve sales reps: `pinnedTopRows` takes an array of your own
objects and renders them through the ordinary column pipeline, so a currency column still formats
as currency, but the row sits outside the scrolling body and outside the row set. Scroll the reps
underneath it or sort them by revenue and the pinned row does not move and its figure does not
change, because it was never counted, sorted, filtered or selected in the first place.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-pin-rows-to-the-top/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/pin-rows-to-the-top/

## The snippet

```js
const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  pinnedTopRows: [
    { rep: 'Team average', region: '', deals: avgDeals, revenue: avgRevenue },
  ],
  columns: [
    { field: 'rep', title: 'Rep' },
    { field: 'region', title: 'Region' },
    { field: 'deals', title: 'Deals', type: 'number' },
    { field: 'revenue', title: 'Revenue', type: 'number', format: { style: 'currency', currency: 'USD' } },
  ],
  rows, // twelve reps
});
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
