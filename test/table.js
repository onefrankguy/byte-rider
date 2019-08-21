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
    'S-Hx',
    'S-Hy',
  ]);

  expect(table.stock.length).toBe(50);
  expect(table.x.hand).toStrictEqual(['AC']);
  expect(table.y.hand).toStrictEqual(['2C']);
});

test('Table#play allows players to play cards from their hand', () => {
  let table = Table.create();
  table = Table.play(table, [
    'S-Hx',
    'AC-Px',
    'S-Hy',
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
    'S-Hx',
    'S-Hx',
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
    'S-Hx',
    'S-Hx',
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
    '2C-Hx',
  ]);

  expect(table.x.hand).toStrictEqual(['AC']);
  expect(table.x.played).toStrictEqual(['2C']);
  expect(table.discard).toStrictEqual(['3C']);
});

test('Table#play allows players stack cards', () => {
  let table = Table.create();
  table = Table.play(table, [
    'S-Hx',
    'S-Hx',
    'S-Hx',
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
