const Pile = {};

Pile.includes = (pile, card) => pile.find((c) => c.indexOf(card) > -1) !== undefined;

module.exports = Pile;
