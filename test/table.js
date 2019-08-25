/* global test, expect */
const Table = require('../src/table');

test('Table#create creates an empty table', () => {
  const table = Table.create();

  expect(table.stock.length).toBe(52);
  expect(table.discard).toStrictEqual([]);
  expect(table.jacked).toStrictEqual({});
  expect(table.x.hand).toStrictEqual([]);
  expect(table.x.played).toStrictEqual([]);
  expect(table.x.allowed).toStrictEqual([]);
  expect(table.y.hand).toStrictEqual([]);
  expect(table.y.played).toStrictEqual([]);
  expect(table.y.allowed).toStrictEqual([]);
});

test('Table#player checks cards players are holding', () => {
  const table = Table.create();
  table.x.hand = ['AC'];
  table.y.hand = ['2C'];

  expect(Table.player(table, 'AC')).toStrictEqual('x');
  expect(Table.player(table, '2C')).toStrictEqual('y');
  expect(Table.player(table, '3C')).toStrictEqual('');
});

test('Table#player checks cards players have played', () => {
  const table = Table.create();
  table.x.played = ['AC'];
  table.y.played = ['2C'];

  expect(Table.player(table, 'AC')).toStrictEqual('x');
  expect(Table.player(table, '2C')).toStrictEqual('y');
  expect(Table.player(table, '3C')).toStrictEqual('');
});

test('Table#player checks card attributes', () => {
  const table = Table.create();

  expect(Table.player(table, 'Hx')).toStrictEqual('x');
  expect(Table.player(table, 'Hy')).toStrictEqual('y');
  expect(Table.player(table, 'Hz')).toStrictEqual('');
  expect(Table.player(table, 'H')).toStrictEqual('');
});

test('Table#player handles invalid tables and values', () => {
  const table = Table.create();

  expect(Table.player(undefined, 'Hx')).toStrictEqual('');
  expect(Table.player(table, undefined)).toStrictEqual('');
});

test('Table#opponent finds the right opponent', () => {
  expect(Table.opponent('x')).toStrictEqual('y');
  expect(Table.opponent('y')).toStrictEqual('x');
  expect(Table.opponent('z')).toStrictEqual('');
});

test('Table#opponent handles players', () => {
  expect(Table.opponent(undefined)).toStrictEqual('');
});

test('Table#play allows players to draw cards', () => {
  let table = Table.create();
  table = Table.play(table, [
    'S-Hx',
    'S-Hy',
    'S-Px',
    'S-Py',
    'S-D',
  ]);

  expect(table.stock.length).toBe(47);
  expect(table.x.hand).toStrictEqual(['AC']);
  expect(table.y.hand).toStrictEqual(['2C']);
  expect(table.x.played).toStrictEqual(['3C']);
  expect(table.y.played).toStrictEqual(['4C']);
  expect(table.discard).toStrictEqual(['5C']);
});

test('Table#play allows players to play cards from their hand', () => {
  let table = Table.create();
  table = Table.play(table, [
    'S-Hx',
    'AC-Px',
    'S-Hy',
    '2C-Py',
  ]);

  expect(table.stock.length).toBe(50);
  expect(table.x.hand).toStrictEqual([]);
  expect(table.x.played).toStrictEqual(['AC']);
  expect(table.y.hand).toStrictEqual([]);
  expect(table.y.played).toStrictEqual(['2C']);
});

test('Table#play allows players to discard cards', () => {
  let table = Table.create();
  table = Table.play(table, [
    'AC-D',
    'S-Hx',
    'S-Hy',
    '2C-Px',
    '2C-D',
    '3C-D',
  ]);

  expect(table.stock.length).toBe(49);
  expect(table.x.hand).toStrictEqual([]);
  expect(table.x.played).toStrictEqual([]);
  expect(table.y.hand).toStrictEqual([]);
  expect(table.y.played).toStrictEqual([]);
  expect(table.discard).toStrictEqual(['3C', '2C', 'AC']);
});

test('Table#play allows players to move cards from the table to the stock', () => {
  let table = Table.create();
  table = Table.play(table, [
    'S-Hx',
    'S-Hx',
    'AC-Px',
    'AC-Sx',
    '2C-Sx',
  ]);

  expect(table.stock[0]).toBe('2C');
  expect(table.stock[1]).toBe('AC');
  expect(table.x.hand).toStrictEqual([]);
  expect(table.x.played).toStrictEqual([]);
});

test('Table#play allows players move cards from the table to the discard', () => {
  let table = Table.create();
  table = Table.play(table, [
    'S-Hx',
    'S-Hx',
    'AC-Px',
    'AC-D',
    '2C-D',
  ]);

  expect(table.x.hand).toStrictEqual([]);
  expect(table.x.played).toStrictEqual([]);
  expect(table.discard).toStrictEqual(['2C', 'AC']);
});

test('Table#play allows players move cards from the discard to their hand', () => {
  let table = Table.create();
  table = Table.play(table, [
    'S-Hx',
    'S-Hx',
    'S-Hx',
    'AC-Px',
    '2C-Px',
    'AC-D',
    '3C-D',
    'AC-Hx',
  ]);

  expect(table.x.hand).toStrictEqual(['AC']);
  expect(table.x.played).toStrictEqual(['2C']);
  expect(table.discard).toStrictEqual(['3C']);
});

test('Table#play allows players to move cards across the table', () => {
  let table = Table.create();
  table = Table.play(table, [
    'S-Hy',
    'AC-Py',
    'AC-Px',
  ]);

  expect(table.x.hand).toStrictEqual([]);
  expect(table.x.played).toStrictEqual(['AC']);
  expect(table.y.hand).toStrictEqual([]);
  expect(table.y.played).toStrictEqual([]);
});
