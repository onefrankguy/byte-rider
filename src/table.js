const Utils = require('./utils');
const Pile = require('./pile');

const Table = {};

const SUITS = ['C', 'D', 'H', 'S'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];

const isStock = (value) => (value || '').startsWith('S');
const isHand = (value) => (value || '').startsWith('H');

const getPlayer = (table, value) => {
  if (Pile.includes(table.x.hand, value) || Pile.includes(table.x.played, value)) {
    return 'x';
  }

  if (Pile.includes(table.y.hand, value) || Pile.includes(table.y.played, value)) {
    return 'y';
  }

  return (value || '').split('')[1] || '';
};

const drawCard = (table, player) => {
  const copy = Utils.clone(table);

  if (copy[player]) {
    copy[player].hand = Pile.add(copy[player].hand, copy.stock.shift());
  }

  return copy;
};

const playMove = (table, move) => {
  const copy = Utils.clone(table);
  const [start, end] = (move || '').split('-');

  if (isStock(start) && isHand(end)) {
    return drawCard(copy, getPlayer(copy, end));
  }

  return copy;
};

Table.deck = () => {
  const result = [];

  SUITS.forEach((s) => {
    VALUES.forEach((v) => {
      result.push(`${v}${s}`);
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

Table.play = (table, moves) => {
  let copy = Utils.clone(table);

  (moves || []).forEach((move) => {
    copy = playMove(copy, move);
  });

  return copy;
};

module.exports = Table;
