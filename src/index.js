require('./game.scss');

const Table = require('./table');
const Renderer = require('./renderer');

let table = Table.create();
table = Table.play(table, [
  'Sy-Hy', 'Sx-Hx',
  'Sy-Hy', 'Sx-Hx',
  'Sy-Hy', 'Sx-Hx',
  'Sy-Hy', 'Sx-Hx',
  'Sy-Hy', 'Sx-Hx',
  'Sy-Hy',
]);

Renderer.render(table);
