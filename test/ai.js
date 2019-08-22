/* global test, expect */
const Table = require('../src/table');
const AI = require('../src/ai');

test('AI#winning shows winning moves', () => {
  const table = Table.create();
  // X can play a King to win
  table.x.hand = ['KH', '3S', '6D'];
  table.x.played = ['TC', '4C'];
  table.y.played = ['TH', 'JS'];

  const moves = AI.winning(table, 'x');

  expect(moves).toEqual(['KH-Px']);
});
