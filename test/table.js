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
