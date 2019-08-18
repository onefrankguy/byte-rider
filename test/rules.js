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

test('Rules#moves shows allowed moves', () => {
  const board = Board.create();
  board.xHand = ['KH', '3S', '6D'];
  board.xTable = ['TC', '4C'];
  board.yTable = ['TH', 'JS'];
  board.yCovers = { JS: 'TH' };

  const moves = Rules.moves(board, 'x');

  expect(moves).toEqual([
    'KH-Tx',
    '3S-Tx',
    '3S-Dx',
    '6D-Tx',
    '6D-Dx',
    'Sx-Hx',
  ]);
});

test('Rules#winner shows the player if they win', () => {
  const board = Board.create();
  board.xTable = ['TC', 'TD', 'AH'];

  expect(Rules.winner(board)).toEqual('x');
});

test('Rules#winner shows nothing if no one wins', () => {
  const board = Board.create();
  board.xTable = ['TC', 'TS'];
  board.yTable = ['TH', 'TD'];

  expect(Rules.winner(board)).toEqual('');
});

test('Rules#winner accounts for kings when scoring', () => {
  const board = Board.create();
  board.yTable = ['TC', 'TD', 'KH'];

  expect(Rules.winner(board)).toEqual('y');
});
