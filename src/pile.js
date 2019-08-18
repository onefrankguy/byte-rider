const Pile = {};

const DELIMITER = ':';

Pile.includes = (pile, card) => pile.find((c) => c.indexOf(card) > -1) !== undefined;

Pile.remove = (pile, card) => pile.reduce((acc, s) => {
  const stack = s.split(DELIMITER).filter((c) => c !== card).join(DELIMITER);

  return stack ? acc.concat(stack) : acc;
}, []);

Pile.add = (pile, card) => pile.concat(card);

module.exports = Pile;
