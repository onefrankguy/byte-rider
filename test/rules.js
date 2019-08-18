/* global test, expect */
const Board = require('../src/board');
const Rules = require('../src/rules');

test('Rules#pickable allows players to draw new cards', () => {
  const board = Board.create();
  const cards = Rules.pickable(board, 'x');

  expect(cards).toEqual(['Sx']);
});

test('Rules#playable allows players to draw new cards', () => {
  const board = Board.create();
  const pickable = Rules.pickable(board, 'x');
  const playable = Rules.playable(board, pickable[0]);

  expect(playable).toEqual(['Hx']);
});
