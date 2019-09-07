/* global test, expect */
const Table = require('../src/table');
const AI = require('../src/ai');

test('AI#winning shows winning play moves', () => {
  const table = Table.create();
  // X can play a King to win
  table.x.hand = ['KH', '3S', '6D'];
  table.x.played = ['TC', '4C'];
  table.y.played = ['TH', 'JS'];

  const moves = AI.winning(table, 'x');

  expect(moves).toEqual(['KH-Px']);
});

test('AI#winning shows winning transfer moves', () => {
  const table = Table.create();
  // X can play a Jack or Ace to win
  table.x.hand = ['JH', 'AC'];
  table.x.played = ['KH', 'KS'];
  table.y.played = ['KD'];
  table.stacked = { KD: ['JC'] };

  const moves = AI.winning(table, 'x');

  expect(moves).toEqual([
    'JH-KD',
    'AC-Dx',
  ]);
});

test('AI#blocking shows blocking discard(number) moves', () => {
  const table = Table.create();
  // X can discard a 2 or 4 to block
  table.x.hand = ['2C', '3C', '4C', '8C'];
  table.y.played = ['5H'];

  const moves = AI.blocking(table, 'x');

  expect(moves).toStrictEqual([
    '2C-Dx',
    '4C-Dx',
  ]);
});

test('AI#blocking shows blocking discard(royal) moves', () => {
  const table = Table.create();
  // X can discard an A, 3, or 4 to block
  table.x.hand = ['AC', '3C', '4C', '8C'];
  table.y.played = ['KH'];

  const moves = AI.blocking(table, 'x');

  expect(moves).toStrictEqual([
    'AC-Dx',
    '3C-Dx',
    '4C-Dx',
  ]);
});

test('AI#blocking shows blocking transfer moves', () => {
  const table = Table.create();
  // X can discard an A, 3, or 4 to block
  table.x.hand = ['AC', '3C', '4C', '8C'];
  table.y.played = ['7H'];
  table.stacked = { '7H': ['JH'] };

  const moves = AI.blocking(table, 'x');

  expect(moves).toStrictEqual([
    'AC-Dx',
    '3C-Dx',
    '4C-Dx',
  ]);
});

test('AI#blocking shows blocking scuttle moves', () => {
  const table = Table.create();
  // X can scuttle 3 or 4 to block
  table.x.hand = ['AC', '3C', '4C', '8C'];
  table.y.played = ['2H'];

  const moves = AI.blocking(table, 'x');

  expect(moves).toStrictEqual([
    '3C-2H',
    '4C-Dx',
    '4C-2H',
  ]);
});

test('AI#playable limits hand size', () => {
  const table = Table.create();
  table.x.hand = ['AC', '2C', '3C', '4C', '5C', '6C'];
  table.stock = ['7C'];

  const moves = AI.playable(table, 'x');

  expect(moves).toStrictEqual([
    'AC-Px',
    '2C-Px',
    '3C-Px',
    '4C-Px',
    '5C-Px',
    '6C-Dx',
    '6C-Px',
  ]);
});
