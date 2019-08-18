/* global test, expect */
const Table = require('../src/table');

test('Table#create creates an empty table', () => {
  const table = Table.create();

  expect(table.stock.length).toBe(52);
  expect(table.discard).toStrictEqual([]);
  expect(table.x.hand).toStrictEqual([]);
  expect(table.x.played).toStrictEqual([]);
  expect(table.y.hand).toStrictEqual([]);
  expect(table.y.played).toStrictEqual([]);
});

test('Table#play allows players to draw cards', () => {
  let table = Table.create();
  table = Table.play(table, [
    'Sx-Hx',
    'Sy-Hy',
  ]);

  expect(table.stock.length).toBe(50);
  expect(table.x.hand).toStrictEqual(['AC']);
  expect(table.y.hand).toStrictEqual(['2C']);
});

test('Table#play allows players to play cards from their hand', () => {
  let table = Table.create();
  table = Table.play(table, [
    'Sx-Hx',
    'AC-Px',
    'Sy-Hy',
    '2C-Py',
    'AD-Py',
  ]);

  expect(table.stock.length).toBe(50);
  expect(table.x.hand).toStrictEqual([]);
  expect(table.x.played).toStrictEqual(['AC']);
  expect(table.y.hand).toStrictEqual([]);
  expect(table.y.played).toStrictEqual(['2C']);
});

test('Table#play allows players to discard cards from their hand', () => {
  let table = Table.create();
  table = Table.play(table, [
    'Sx-Hx',
    'Sx-Hx',
    'AC-Px',
    'AC-Sx',
    '2C-Sx',
  ]);

  expect(table.stock[0]).toBe('AC');
  expect(table.x.hand).toStrictEqual(['2C']);
  expect(table.x.played).toStrictEqual([]);
});

test('Table#play allows players to move cards from the table to the stock', () => {
  let table = Table.create();
  table = Table.play(table, [
    'Sx-Hx',
    'Sx-Hx',
    'AC-Px',
    'AC-Sx',
    '2C-Sx',
  ]);

  expect(table.stock[0]).toBe('AC');
  expect(table.x.hand).toStrictEqual(['2C']);
  expect(table.x.played).toStrictEqual([]);
});

test('Table#play allows players move cards from the table to the discard', () => {
  let table = Table.create();
  table = Table.play(table, [
    'Sx-Hx',
    'Sx-Hx',
    'AC-Px',
    'AC-Dx',
    '2C-Dx',
  ]);

  expect(table.x.hand).toStrictEqual([]);
  expect(table.x.played).toStrictEqual([]);
  expect(table.discard).toStrictEqual(['2C', 'AC']);
});

test('Table#play allows players move cards from the discard to their hand', () => {
  let table = Table.create();
  table = Table.play(table, [
    'Sx-Hx',
    'Sx-Hx',
    'Sx-Hx',
    'AC-Px',
    '2C-Px',
    'AC-Dx',
    '3C-Dx',
    'AC-Hx',
    '2C-Hx',
  ]);

  expect(table.x.hand).toStrictEqual(['AC']);
  expect(table.x.played).toStrictEqual(['2C']);
  expect(table.discard).toStrictEqual(['3C']);
});

test('Table#play allows players stack cards', () => {
  let table = Table.create();
  table = Table.play(table, [
    'Sx-Hx',
    'Sx-Hx',
    'Sx-Hx',
    'AC-Px',
    '2C-AC',
    'Sy-Hy',
    '4C-Py',
    '3C-4C',
  ]);

  expect(table.x.hand).toStrictEqual([]);
  expect(table.x.played).toStrictEqual(['AC:2C']);
  expect(table.y.hand).toStrictEqual([]);
  expect(table.y.played).toStrictEqual(['4C:3C']);
});
