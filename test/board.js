/* global test, expect */
const Board = require('../src/board');

test('Board#create creates an empty board', () => {
  const board = Board.create();

  expect(board.discard.length).toBe(0);
  expect(board.stock.length).toBe(52);
  expect(board.xHand.length).toBe(0);
  expect(board.yHand.length).toBe(0);
  expect(board.xPlayed.length).toBe(0);
  expect(board.yPlayed.length).toBe(0);
});
