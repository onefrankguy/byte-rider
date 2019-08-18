/* global test, expect */
const Pile = require('../src/pile');

test('Pile#includes returns true when the card is in the pile', () => {
  expect(Pile.includes(['AC', 'AD', 'AS', 'AH'], 'AS')).toBe(true);
});

test('Pile#includes returns true when the card is stacked in the pile', () => {
  expect(Pile.includes(['AC', 'AD:AS', 'AH'], 'AS')).toBe(true);
  expect(Pile.includes(['AC', 'AS:AD', 'AH'], 'AS')).toBe(true);
});

test('Pile#includes returns false when the card is not in the pile', () => {
  expect(Pile.includes(['AC', 'AD', 'AH'], 'AS')).toBe(false);
});

test('Pile#remove removes a card from the pile', () => {
  expect(Pile.remove(['AC', 'AD', 'AS', 'AH'], 'AD')).toStrictEqual(['AC', 'AS', 'AH']);
});

test('Pile#remove removes a stacked card from the pile', () => {
  expect(Pile.remove(['AC', 'AD:AS:AH'], 'AS')).toStrictEqual(['AC', 'AD:AH']);
});

test('Pile#add adds cards to piles', () => {
  expect(Pile.add(['AC', 'AD:AH'], 'AS')).toStrictEqual(['AC', 'AD:AH', 'AS']);
});

test('Pile#add stacks cards in piles', () => {
  expect(Pile.add(['AC', 'AD:AH'], 'AS', 'AD')).toStrictEqual(['AC', 'AD:AH:AS']);
  expect(Pile.add(['AC', 'AD:AH'], 'AS', 'AH')).toStrictEqual(['AC', 'AD:AH:AS']);
});
