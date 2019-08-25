/* global test, expect */
const Table = require('../src/table');
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
  table.x.allowed = [['Sx-Hx']];
  const playable = Rules.playable(table, 'x', 'Sx');

  expect(playable).toEqual(['Hx']);
});

test('Rules#moves shows allowed moves', () => {
  const table = Table.create();
  table.x.hand = ['KH', '3S', '6D'];
  table.x.played = ['TC', '4C'];
  table.y.played = ['TH', 'JS'];

  const moves = Rules.moves(table, 'x');

  expect(moves).toEqual([
    'KH-Px',
    '3S-Dx',
    '3S-Px',
    '6D-Dx',
    '6D-Px',
    'Sx-Hx',
  ]);
});

test('Rules#play(A) discards a non-point card', () => {
  const oldTable = Table.create();
  oldTable.x.hand = ['AC'];
  oldTable.x.played = ['JC'];
  oldTable.y.played = ['KS'];
  oldTable.stock = [];

  const newTable = Rules.play(oldTable, 'x', ['AC-Dx', 'KS-Dy']);

  expect(newTable.x.hand).toStrictEqual([]);
  expect(newTable.x.played).toStrictEqual(['JC']);
  expect(newTable.y.played).toStrictEqual([]);
  expect(newTable.discard).toStrictEqual(['KS', 'AC']);
});

test('Rules#play(2) discards all point cards', () => {
  const oldTable = Table.create();
  oldTable.x.hand = ['2C'];
  oldTable.x.played = ['TH'];
  oldTable.y.played = ['KS', 'AD', 'JC'];
  oldTable.stock = [];

  const newTable = Rules.play(oldTable, 'x', ['2C-Dx']);

  expect(newTable.x.hand).toStrictEqual([]);
  expect(newTable.x.played).toStrictEqual([]);
  expect(newTable.y.played).toStrictEqual(['KS', 'JC']);
  expect(newTable.discard).toStrictEqual(['AD', 'TH', '2C']);
});

test('Rules#play(3) discards all non-point cards', () => {
  const oldTable = Table.create();
  oldTable.x.hand = ['3C'];
  oldTable.x.played = ['TH'];
  oldTable.y.played = ['KS', 'AD', 'JC'];
  oldTable.stock = [];

  const newTable = Rules.play(oldTable, 'x', ['3C-Dx']);

  expect(newTable.x.hand).toEqual([]);
  expect(newTable.x.played).toEqual(['TH']);
  expect(newTable.y.played).toEqual(['AD']);
  expect(newTable.discard).toEqual(['JC', 'KS', '3C']);
});

test('Rules#play(4) returns any card to the stock', () => {
  const oldTable = Table.create();
  oldTable.x.hand = ['4C'];
  oldTable.y.played = ['KS'];
  oldTable.stock = ['AC'];

  const newTable = Rules.play(oldTable, 'x', ['4C-Dx', 'KS-Sy']);

  expect(newTable.x.hand).toEqual([]);
  expect(newTable.y.played).toEqual([]);
  expect(newTable.discard).toEqual(['4C']);
  expect(newTable.stock).toEqual(['KS', 'AC']);
});

test('Rules#play(number) scuttles', () => {
  const oldTable = Table.create();
  oldTable.x.hand = ['4C'];
  oldTable.y.played = ['4H'];
  oldTable.stock = [];

  const newTable = Rules.play(oldTable, 'x', ['4C-4H']);

  expect(newTable.x.hand).toEqual([]);
  expect(newTable.y.played).toEqual([]);
  expect(newTable.discard).toEqual(['4H', '4C']);
});

test('Rules#chain(S) draws the top card', () => {
  const table = Table.create();

  const moves = Rules.chain(table, 'x', 'Sx');

  expect(moves).toStrictEqual([
    ['Sx-Hx'],
  ]);
});

test('Rules#chain(A) discards any non-point card in play', () => {
  const table = Table.create();
  table.x.hand = ['AC'];
  table.y.played = ['KC', '2C', '8C'];

  const moves = Rules.chain(table, 'x', 'AC');

  expect(moves).toStrictEqual([
    ['AC-Dx', 'KC-Dy'],
    ['AC-Dx', '8C-Dy'],
    ['AC-Px'],
  ]);
});

test('Rules#chain(A) plays for points', () => {
  const table = Table.create();
  table.x.hand = ['AC'];
  table.y.played = ['2C'];

  const moves = Rules.chain(table, 'x', 'AC');

  expect(moves).toStrictEqual([
    ['AC-Px'],
  ]);
});

test('Rules#chain(A) scuttles', () => {
  const table = Table.create();
  table.x.hand = ['AC'];
  table.y.played = ['AH'];

  const moves = Rules.chain(table, 'x', 'AC');

  expect(moves).toStrictEqual([
    ['AC-Px'],
    ['AC-AH'],
  ]);
});

test('Rules#chain(2) discards all point cards in play', () => {
  const table = Table.create();
  table.x.hand = ['2C'];
  table.x.played = ['9C'];
  table.y.played = ['TC'];

  const moves = Rules.chain(table, 'x', '2C');

  expect(moves).toStrictEqual([
    ['2C-Dx'],
    ['2C-Px'],
  ]);
});

test('Rules#chain(2) plays for points', () => {
  const table = Table.create();
  table.x.hand = ['2C'];
  table.x.played = ['9C'];
  table.y.played = ['KC'];

  const moves = Rules.chain(table, 'x', '2C');

  expect(moves).toStrictEqual([
    ['2C-Px'],
  ]);
});

test('Rules#chain(2) scuttles', () => {
  const table = Table.create();
  table.x.hand = ['2C'];
  table.y.played = ['2H'];

  const moves = Rules.chain(table, 'x', '2C');

  expect(moves).toStrictEqual([
    ['2C-Dx'],
    ['2C-Px'],
    ['2C-2H'],
  ]);
});

test('Rules#chain(3) discards all non-point card in play', () => {
  const table = Table.create();
  table.x.hand = ['3C'];
  table.x.played = ['KC'];
  table.y.played = ['QC'];

  const moves = Rules.chain(table, 'x', '3C');

  expect(moves).toStrictEqual([
    ['3C-Dx'],
    ['3C-Px'],
  ]);
});

test('Rules#chain(3) plays for points', () => {
  const table = Table.create();
  table.x.hand = ['3C'];
  table.x.played = ['KC'];
  table.y.played = [];

  const moves = Rules.chain(table, 'x', '3C');

  expect(moves).toStrictEqual([
    ['3C-Px'],
  ]);
});

test('Rules#chain(3) scuttles', () => {
  const table = Table.create();
  table.x.hand = ['3C'];
  table.x.played = [];
  table.y.played = ['3H'];

  const moves = Rules.chain(table, 'x', '3C');

  expect(moves).toStrictEqual([
    ['3C-Px'],
    ['3C-3H'],
  ]);
});

test('Rules#chain(4) returns any card in play to the top of the stock', () => {
  const table = Table.create();
  table.x.hand = ['4C'];
  table.y.played = ['KC', 'QC'];

  const moves = Rules.chain(table, 'x', '4C');

  expect(moves).toStrictEqual([
    ['4C-Dx', 'KC-Sy'],
    ['4C-Dx', 'QC-Sy'],
    ['4C-Px'],
  ]);
});

test('Rules#chain(4) plays for points', () => {
  const table = Table.create();
  table.x.hand = ['4C'];
  table.y.played = [];

  const moves = Rules.chain(table, 'x', '4C');

  expect(moves).toStrictEqual([
    ['4C-Px'],
  ]);
});

test('Rules#chain(4) scuttles', () => {
  const table = Table.create();
  table.x.hand = ['4C'];
  table.y.played = ['4H'];

  const moves = Rules.chain(table, 'x', '4C');

  expect(moves).toStrictEqual([
    ['4C-Dx', '4H-Sy'],
    ['4C-Px'],
    ['4C-4H'],
  ]);
});

test('Rules#chain(5) chooses 2 of your opponent\'s cards that they must discard', () => {
  const table = Table.create();
  table.x.hand = ['5C'];
  table.y.hand = ['KC', 'QC', 'JC'];

  const moves = Rules.chain(table, 'x', '5C');

  expect(moves).toStrictEqual([
    ['5C-Dx', 'KC-Dy', 'QC-Dy'],
    ['5C-Dx', 'KC-Dy', 'JC-Dy'],
    ['5C-Dx', 'QC-Dy', 'KC-Dy'],
    ['5C-Dx', 'QC-Dy', 'JC-Dy'],
    ['5C-Dx', 'JC-Dy', 'KC-Dy'],
    ['5C-Dx', 'JC-Dy', 'QC-Dy'],
    ['5C-Px'],
  ]);
});

test('Rules#chain(5) chooses 1 of your opponent\'s cards that they must discard', () => {
  const table = Table.create();
  table.x.hand = ['5C'];
  table.y.hand = ['KC'];

  const moves = Rules.chain(table, 'x', '5C');

  expect(moves).toStrictEqual([
    ['5C-Dx', 'KC-Dy'],
    ['5C-Px'],
  ]);
});

test('Rules#chain(5) plays for points', () => {
  const table = Table.create();
  table.x.hand = ['5C'];
  table.y.hand = [];

  const moves = Rules.chain(table, 'x', '5C');

  expect(moves).toStrictEqual([
    ['5C-Px'],
  ]);
});

test('Rules#chain(5) scuttles', () => {
  const table = Table.create();
  table.x.hand = ['5C'];
  table.y.played = ['5H'];

  const moves = Rules.chain(table, 'x', '5C');

  expect(moves).toStrictEqual([
    ['5C-Px'],
    ['5C-5H'],
  ]);
});

test('Rules#chain(6) draws 2 cards', () => {
  const table = Table.create();
  table.x.hand = ['6C'];
  table.y.hand = ['KC', 'QC'];
  table.y.played = ['JC'];
  table.stock = ['5C', '4C'];

  const moves = Rules.chain(table, 'x', '6C');

  expect(moves).toStrictEqual([
    ['6C-Dx', 'Sx-Hx', 'Sx-Hx', '5C-Sx', '4C-Dx', 'JC-Sy'],
    ['6C-Dx', 'Sx-Hx', 'Sx-Hx', '5C-Sx', '4C-Px'],
    ['6C-Dx', 'Sx-Hx', 'Sx-Hx', '4C-Sx', '5C-Dx', 'KC-Dy', 'QC-Dy'],
    ['6C-Dx', 'Sx-Hx', 'Sx-Hx', '4C-Sx', '5C-Dx', 'QC-Dy', 'KC-Dy'],
    ['6C-Dx', 'Sx-Hx', 'Sx-Hx', '4C-Sx', '5C-Px'],
    ['6C-Px'],
  ]);
});

test('Rules#chain(6) draws 1 card', () => {
  const table = Table.create();
  table.x.hand = ['6C'];
  table.y.hand = ['KC'];
  table.stock = ['5C'];

  const moves = Rules.chain(table, 'x', '6C');

  expect(moves).toStrictEqual([
    ['6C-Dx', 'Sx-Hx', '5C-Dx', 'KC-Dy'],
    ['6C-Dx', 'Sx-Hx', '5C-Px'],
    ['6C-Px'],
  ]);
});

test('Rules#chain(6) plays for points', () => {
  const table = Table.create();
  table.x.hand = ['6C'];
  table.y.hand = ['KC'];
  table.stock = [];

  const moves = Rules.chain(table, 'x', '6C');

  expect(moves).toStrictEqual([
    ['6C-Px'],
  ]);
});

test('Rules#chain(6) scuttles', () => {
  const table = Table.create();
  table.x.hand = ['6C'];
  table.y.played = ['6H'];
  table.stock = [];

  const moves = Rules.chain(table, 'x', '6C');

  expect(moves).toStrictEqual([
    ['6C-Px'],
    ['6C-6H'],
  ]);
});

test('Rules#chain(7) chooses 1 card from the discard', () => {
  const table = Table.create();
  table.x.hand = ['7C'];
  table.discard = ['AC', 'KC'];

  const moves = Rules.chain(table, 'x', '7C');

  expect(moves).toStrictEqual([
    ['7C-Dx', 'AC-Hx'],
    ['7C-Dx', 'KC-Hx'],
    ['7C-Px'],
  ]);
});

test('Rules#chain(7) plays for points', () => {
  const table = Table.create();
  table.x.hand = ['7C'];
  table.discard = [];

  const moves = Rules.chain(table, 'x', '7C');

  expect(moves).toStrictEqual([
    ['7C-Px'],
  ]);
});

test('Rules#chain(7) scuttles', () => {
  const table = Table.create();
  table.x.hand = ['7C'];
  table.y.played = ['7H'];
  table.discard = [];

  const moves = Rules.chain(table, 'x', '7C');

  expect(moves).toStrictEqual([
    ['7C-Px'],
    ['7C-7H'],
  ]);
});

test('Rules#chain(8) makes your opponent play with their hand exposed', () => {
  const table = Table.create();
  table.x.hand = ['8C'];

  const moves = Rules.chain(table, 'x', '8C');

  expect(moves).toStrictEqual([
    ['8C-Px'],
  ]);
});

test('Rules#chain(9) draws 3 cards', () => {
  const table = Table.create();
  table.x.hand = ['9C'];
  table.stock = ['AC', 'KC', 'QC'];

  const moves = Rules.chain(table, 'x', '9C');

  expect(moves).toStrictEqual([
    ['9C-Dx', 'Sx-Hx', 'Sx-Hx', 'Sx-Hx', 'AC-Sx'],
    ['9C-Dx', 'Sx-Hx', 'Sx-Hx', 'Sx-Hx', 'KC-Sx'],
    ['9C-Dx', 'Sx-Hx', 'Sx-Hx', 'Sx-Hx', 'QC-Sx'],
    ['9C-Px'],
  ]);
});

test('Rules#chain(9) draws 2 cards', () => {
  const table = Table.create();
  table.x.hand = ['9C'];
  table.stock = ['AC', 'KC'];

  const moves = Rules.chain(table, 'x', '9C');

  expect(moves).toStrictEqual([
    ['9C-Dx', 'Sx-Hx', 'Sx-Hx'],
    ['9C-Px'],
  ]);
});

test('Rules#chain(9) plays for points', () => {
  const table = Table.create();
  table.x.hand = ['9C'];
  table.stock = ['AC'];

  const moves = Rules.chain(table, 'x', '9C');

  expect(moves).toStrictEqual([
    ['9C-Px'],
  ]);
});

test('Rules#chain(9) scuttles', () => {
  const table = Table.create();
  table.x.hand = ['9C'];
  table.y.played = ['9H'];
  table.stock = ['AC'];

  const moves = Rules.chain(table, 'x', '9C');

  expect(moves).toStrictEqual([
    ['9C-Px'],
    ['9C-9H'],
  ]);
});

test('Rules#chain(T) chooses 1 card from your opponent\'s hand', () => {
  const table = Table.create();
  table.x.hand = ['TC'];
  table.y.hand = ['AC', 'KC'];

  const moves = Rules.chain(table, 'x', 'TC');

  expect(moves).toStrictEqual([
    ['TC-Dx', 'AC-Hx'],
    ['TC-Dx', 'KC-Hx'],
    ['TC-Px'],
  ]);
});

test('Rules#chain(T) plays for points', () => {
  const table = Table.create();
  table.x.hand = ['TC'];
  table.y.hand = [];

  const moves = Rules.chain(table, 'x', 'TC');

  expect(moves).toStrictEqual([
    ['TC-Px'],
  ]);
});

test('Rules#chain(T) scuttles', () => {
  const table = Table.create();
  table.x.hand = ['TC'];
  table.y.played = ['TH'];

  const moves = Rules.chain(table, 'x', 'TC');

  expect(moves).toStrictEqual([
    ['TC-Px'],
    ['TC-TH'],
  ]);
});

test('Rules#chain(J) transfers control of an opponent\'s card in play', () => {
  const table = Table.create();
  table.x.hand = ['JC'];
  table.y.played = ['AC', 'KC'];

  const moves = Rules.chain(table, 'x', 'JC');

  expect(moves).toStrictEqual([
    ['JC-Dx', 'AC-Px'],
    ['JC-Dx', 'KC-Px'],
  ]);
});

test('Rules#chain(Q) protects your cards in play from effects that target single cards', () => {
  const table = Table.create();
  table.x.hand = ['QC'];

  const moves = Rules.chain(table, 'x', 'QC');

  expect(moves).toStrictEqual([
    ['QC-Px'],
  ]);
});

test('Rules#chain(K) reduces the number of points needed to win by 7', () => {
  const table = Table.create();
  table.x.hand = ['KC'];

  const moves = Rules.chain(table, 'x', 'KC');

  expect(moves).toStrictEqual([
    ['KC-Px'],
  ]);
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
