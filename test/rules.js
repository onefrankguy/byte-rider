/* global test, expect */
const Table = require('../src/table');
const Board = require('../src/board');
const Rules = require('../src/rules');

test('Rules#pickable allows players to draw or play cards', () => {
  let table = Table.create();
  table = Table.play(table, [
    'Sx-Hx',
    'Sx-Hx',
  ]);

  expect(Rules.pickable(table, 'x')).toStrictEqual(['AC', '2C', 'Sx']);
});

test('Rules#pickable prevents drawing if the stock is empty', () => {
  let table = Table.create();
  table = Table.play(table, [
    'Sx-Hx',
    'Sx-Hx',
  ]);
  table.stock = [];

  expect(Rules.pickable(table, 'x')).toStrictEqual(['AC', '2C']);
});

test('Rules#pickable handles invalid players and tables', () => {
  let table = Table.create();
  table = Table.play(table, [
    'Sx-Hx',
    'Sx-Hx',
  ]);

  expect(Rules.pickable(table, undefined)).toStrictEqual([]);
  expect(Rules.pickable(undefined, 'x')).toStrictEqual([]);
});

test('Rules#playable allows players to draw cards', () => {
  const table = Table.create();
  const playable = Rules.playable(table, 'Sx');

  expect(playable).toEqual(['Hx']);
});

test('Rules#moves shows allowed moves', () => {
  const table = Table.create();
  table.x.hand = ['KH', '3S', '6D'];
  table.x.played = ['TC', '4C'];
  table.y.played = ['TH:JS'];

  const moves = Rules.moves(table, 'x');

  expect(moves).toEqual([
    'KH-Px',
    '3S-Px',
    '3S-Dx',
    '6D-Px',
    '6D-Dx',
    'Sx-Hx',
  ]);
});

test('Rules#play(2) discards all point cards', () => {
  const oldBoard = Board.create();
  oldBoard.xHand = ['2C'];
  oldBoard.xTable = ['TH'];
  oldBoard.yTable = ['KS', 'AD', 'JC'];
  oldBoard.yCovers = { JC: 'AD' };

  const newBoard = Rules.play(oldBoard, '2C-Dx');

  expect(newBoard.xHand).toEqual([]);
  expect(newBoard.xTable).toEqual([]);
  expect(newBoard.yTable).toEqual(['KS']);
  expect(newBoard.discard).toEqual(['2C', 'TH', 'JC', 'AD']);
});

test('Rules#play(3) discards all non-point cards', () => {
  const oldBoard = Board.create();
  oldBoard.xHand = ['3C'];
  oldBoard.xTable = ['TH'];
  oldBoard.yTable = ['KS', 'AD', 'JC'];
  oldBoard.yCovers = { JC: 'AD' };

  const newBoard = Rules.play(oldBoard, '3C-Dx');

  expect(newBoard.xHand).toEqual([]);
  expect(newBoard.xTable).toEqual(['TH', 'AD']);
  expect(newBoard.yTable).toEqual([]);
  expect(newBoard.discard).toEqual(['3C', 'KS', 'JC']);
});

test('Rules#winner shows the player if they win', () => {
  const table = Table.create();
  table.x.played = ['TC', 'TD', 'AH'];

  expect(Rules.winner(table)).toEqual('x');
});

test('Rules#winner shows nothing if no one wins', () => {
  const table = Table.create();
  table.x.played = ['TC', 'TS'];
  table.y.played = ['TH', 'TD'];

  expect(Rules.winner(table)).toEqual('');
});

test('Rules#winner accounts for kings when scoring', () => {
  const table = Table.create();
  table.y.played = ['TC', 'TD', 'KH'];

  expect(Rules.winner(table)).toEqual('y');
});
