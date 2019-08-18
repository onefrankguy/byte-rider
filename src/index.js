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

table = Table.play(table, [
  '2C-Px',
  '4C-Px',
  '8C-Px',
]);

table = Table.play(table, [
  'AC-Py',
  '3C-Py',
  '5C-AC',
  'JC-Py',
]);

Renderer.render(table);
