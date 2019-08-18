/* global test, expect */
const Board = require('../src/board');
const AI = require('../src/ai');

test('AI#winning shows winning moves', () => {
  const board = Board.create();
  // X can play a King to win or discard a three to remove the Jack
  board.xHand = ['KH', '3S', '6D'];
  board.xTable = ['TC', '4C'];
  board.yTable = ['TH', 'JS'];
  board.yCovers = { JS: 'TH' };

  const moves = AI.winning(board, 'x');

  expect(moves).toEqual(['KH-Tx', '3S-Dx']);
});
