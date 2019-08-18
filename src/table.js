const Table = {};

const SUITS = ['C', 'D', 'H', 'S'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];

Table.deck = () => {
  const result = [];

  SUITS.forEach((s) => {
    VALUES.forEach((v) => {
      result.push(`${s}${v}`);
    });
  });

  return result;
};

Table.create = () => ({
  stock: Table.deck(),
  discard: [],
  x: {
    hand: [],
    played: [],
  },
  y: {
    hand: [],
    played: [],
  },
});

module.exports = Table;
