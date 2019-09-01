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

test('Rules#play(A) discards a jacked card', () => {
  const oldTable = Table.create();
  oldTable.x.hand = ['AC'];
  oldTable.x.played = [];
  oldTable.y.played = ['4H'];
  oldTable.stock = [];
  oldTable.jacked = { '4H': ['JH'] };

  const newTable = Rules.play(oldTable, 'x', ['AC-Dx', '4H-Dy']);

  expect(newTable.x.hand).toStrictEqual([]);
  expect(newTable.x.played).toStrictEqual(['4H']);
  expect(newTable.y.played).toStrictEqual([]);
  expect(newTable.discard).toStrictEqual(['JH', 'AC']);
  expect(newTable.jacked).toStrictEqual({ '4H': [] });
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

test('Rules#play(2) discards jacks', () => {
  const oldTable = Table.create();
  oldTable.x.hand = ['2C'];
  oldTable.x.played = ['4H'];
  oldTable.stock = [];
  oldTable.jacked = { '4H': ['JH', 'JS'] };

  const newTable = Rules.play(oldTable, 'x', ['2C-Dx']);

  expect(newTable.x.hand).toStrictEqual([]);
  expect(newTable.x.played).toStrictEqual([]);
  expect(newTable.discard).toStrictEqual(['4H', 'JH', 'JS', '2C']);
  expect(newTable.jacked).toStrictEqual({ '4H': [] });
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

test('Rules#play(3) discards jacks', () => {
  const oldTable = Table.create();
  oldTable.x.hand = ['3C'];
  oldTable.x.played = ['4H'];
  oldTable.y.played = ['4S', '8S'];
  oldTable.stock = [];
  oldTable.jacked = {
    '4H': ['JH'],
    '4S': ['JC', 'JD'],
    '8S': ['JS'],
  };

  const newTable = Rules.play(oldTable, 'x', ['3C-Dx']);

  expect(newTable.x.hand).toEqual([]);
  expect(newTable.x.played).toEqual([]);
  expect(newTable.y.played).toEqual(['4H', '4S']);
  expect(newTable.discard).toEqual(['8S', 'JS', 'JC', 'JD', 'JH', '3C']);
  expect(newTable.jacked).toStrictEqual({
    '4H': [],
    '4S': [],
    '8S': [],
  });
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

test('Rules#play(4) returns jacks to the stock', () => {
  const oldTable = Table.create();
  oldTable.x.hand = ['4C'];
  oldTable.y.played = ['4H'];
  oldTable.stock = ['AC'];
  oldTable.jacked = { '4H': ['JS'] };

  const newTable = Rules.play(oldTable, 'x', ['4C-Dx', '4H-Sy']);

  expect(newTable.x.hand).toEqual([]);
  expect(newTable.x.played).toEqual(['4H']);
  expect(newTable.y.played).toEqual([]);
  expect(newTable.discard).toEqual(['4C']);
  expect(newTable.stock).toEqual(['JS', 'AC']);
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

test('Rules#play(number) scuttles and clears jacks', () => {
  const oldTable = Table.create();
  oldTable.x.hand = ['4C'];
  oldTable.y.played = ['4H'];
  oldTable.stock = [];
  oldTable.jacked = { '4H': ['JH', 'JS'] };

  const newTable = Rules.play(oldTable, 'x', ['4C-4H']);

  expect(newTable.x.hand).toEqual([]);
  expect(newTable.y.played).toEqual([]);
  expect(newTable.discard).toEqual(['4H', 'JH', 'JS', '4C']);
  expect(newTable.jacked).toStrictEqual({ '4H': [] });
});

test('Rules#play(J) jacks cards in play', () => {
  const oldTable = Table.create();
  oldTable.x.hand = ['JC'];
  oldTable.y.played = ['4H'];
  oldTable.stock = [];

  const newTable = Rules.play(oldTable, 'x', ['JC-Dx', '4H-Px']);

  expect(newTable.x.hand).toStrictEqual([]);
  expect(newTable.x.played).toStrictEqual(['4H']);
  expect(newTable.y.played).toStrictEqual([]);
  expect(newTable.discard).toStrictEqual([]);
  expect(newTable.jacked).toStrictEqual({ '4H': ['JC'] });
});

test('Rules#play(J) double jacks cards in play', () => {
  const oldTable = Table.create();
  oldTable.x.played = ['4H'];
  oldTable.y.hand = ['JS'];
  oldTable.stock = [];
  oldTable.jacked = { '4H': ['JC'] };

  const newTable = Rules.play(oldTable, 'y', ['JS-Dy', '4H-Py']);

  expect(newTable.x.played).toStrictEqual([]);
  expect(newTable.y.hand).toStrictEqual([]);
  expect(newTable.y.played).toStrictEqual(['4H']);
  expect(newTable.discard).toStrictEqual([]);
  expect(newTable.jacked).toStrictEqual({ '4H': ['JC', 'JS'] });
});

test('Rules#play shuffles the discard back into the stock', () => {
  const oldTable = Table.create();
  oldTable.stock = [];
  oldTable.discard = ['AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H'];
  oldTable.debug = true;

  const newTable = Rules.play(oldTable, 'x', ['Sx-Hx']);
  const newStock = ['5H', '6H', '7H', '8H'].filter((c) => !newTable.x.hand.includes(c));

  expect(newTable.stock.length).toEqual(newStock.length);
  expect(newTable.stock).toEqual(expect.arrayContaining(newStock));
  expect(newTable.discard).toStrictEqual(['AH', '2H', '3H', '4H']);
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

test('Rules#chain(A) discards any jacked card in play', () => {
  const table = Table.create();
  table.x.hand = ['AC'];
  table.y.played = ['KC', '2C', '8C'];
  table.jacked = {
    '2C': ['JH'],
    '8C': ['JD'],
  };

  const moves = Rules.chain(table, 'x', 'AC');

  expect(moves).toStrictEqual([
    ['AC-Dx', 'KC-Dy'],
    ['AC-Dx', '2C-Dy'],
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

test('Rules#chain(3) discards all jacks in play', () => {
  const table = Table.create();
  table.x.hand = ['3C'];
  table.y.played = ['4H'];
  table.jacked = { '4H': ['JH'] };

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
  table.y.played = ['KC', 'TH'];

  const moves = Rules.chain(table, 'x', '4C');

  expect(moves).toStrictEqual([
    ['4C-Dx', 'KC-Sy'],
    ['4C-Dx', 'TH-Sy'],
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

test('Rules#chain(7) chooses 1 card from the top 3 in the discard', () => {
  const table = Table.create();
  table.x.hand = ['7C'];
  table.discard = ['AC', 'KC', 'QC', 'JC', 'TC', '9C'];

  const moves = Rules.chain(table, 'x', '7C');

  expect(moves).toStrictEqual([
    ['7C-Dx', 'AC-Hx'],
    ['7C-Dx', 'KC-Hx'],
    ['7C-Dx', 'QC-Hx'],
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

test('Rules#chain(Q) protects your cards in play', () => {
  const table = Table.create();
  table.x.hand = ['QC'];

  const moves = Rules.chain(table, 'x', 'QC');

  expect(moves).toStrictEqual([
    ['QC-Px'],
  ]);
});

test('Rules#chain(Q) protects your cards in play from A', () => {
  const table = Table.create();
  table.x.played = ['QC', 'QH', '8C'];
  table.y.hand = ['AC'];

  const moves = Rules.chain(table, 'y', 'AC');

  expect(moves).toStrictEqual([
    ['AC-Dy', 'QC-Dx'],
    ['AC-Dy', 'QH-Dx'],
    ['AC-Py'],
  ]);
});

test('Rules#chain(Q) protects your cards in play from 4', () => {
  const table = Table.create();
  table.x.played = ['QC', 'QH', '8C'];
  table.y.hand = ['4C'];

  const moves = Rules.chain(table, 'y', '4C');

  expect(moves).toStrictEqual([
    ['4C-Dy', 'QC-Sx'],
    ['4C-Dy', 'QH-Sx'],
    ['4C-Py'],
  ]);
});

test('Rules#chain(Q) protects your cards in play from J', () => {
  const table = Table.create();
  table.x.played = ['QC', 'QH', '8C'];
  table.y.hand = ['JC'];

  const moves = Rules.chain(table, 'y', 'JC');

  expect(moves).toStrictEqual([
    ['JC-Dy', 'QC-Py'],
    ['JC-Dy', 'QH-Py'],
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

test('Rules#resolve converts unnamed pile to named stock', () => {
  let table = Table.create();
  let move = Rules.resolve(table, 'x', 'S', 'Hx');

  expect(move).toStrictEqual('Sx-Hx');

  table.x.hand = ['4C'];
  table.y.played = ['KS'];
  table.stock = ['AC'];

  table = Rules.play(table, 'x', ['4C-Dx']);
  move = Rules.resolve(table, 'x', 'KS', 'S');

  expect(move).toStrictEqual('KS-Sy');
});

test('Rules#resolve converts unnamed pile to named discard', () => {
  let table = Table.create();
  table.y.played = ['KH'];
  table.stock = ['AC'];

  let move = Rules.resolve(table, 'x', 'S', 'Hx');

  table = Rules.play(table, 'x', [move]);
  move = Rules.resolve(table, 'x', 'AC', 'S');

  expect(move).toStrictEqual('AC-Dx');

  table = Rules.play(table, 'x', [move]);
  move = Rules.resolve(table, 'x', 'KH', 'S');

  expect(move).toStrictEqual('KH-Dy');
});

test('Rules#resolve handles invalid values', () => {
  const table = Table.create();

  expect(Rules.resolve(undefined, 'x', 'S', 'Hx')).toStrictEqual('S-Hx');
  expect(Rules.resolve(table, undefined, 'S', 'Hx')).toStrictEqual('S-Hx');
  expect(Rules.resolve(table, 'x', undefined, 'Hx')).toStrictEqual('undefined-Hx');
  expect(Rules.resolve(table, 'x', 'S', undefined)).toStrictEqual('Sx-undefined');
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
