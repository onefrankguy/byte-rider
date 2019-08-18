/* global test, expect */
const Utils = require('../src/utils');

test('Utils#clone copies undefined', () => {
  expect(Utils.clone(undefined)).toStrictEqual(undefined);
});

test('Utils#clone copies strings', () => {
  expect(Utils.clone('C')).toStrictEqual('C');
});

test('Utils#clone copies arrays', () => {
  expect(Utils.clone(['C', 'D', 'H', 'S'])).toStrictEqual(['C', 'D', 'H', 'S']);
});

test('Utils#clone copies objects', () => {
  expect(Utils.clone({ hand: ['AC'] })).toStrictEqual({ hand: ['AC'] });
});
