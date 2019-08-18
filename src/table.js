const Utils = require('./utils');
const Pile = require('./pile');

const Table = {};

const SUITS = ['C', 'D', 'H', 'S'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];

const isCard = (value) => !!VALUES.find((v) => (value || '').startsWith(v));
const isStock = (value) => (value || '').startsWith('S');
const isHand = (value) => (value || '').startsWith('H');
const isTable = (value) => (value || '').startsWith('P');

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

const playCard = (table, player, card) => {
  const copy = Utils.clone(table);

  if (copy[player] && Pile.includes(copy[player].hand, card)) {
    copy[player].hand = Pile.remove(copy[player].hand, card);
    copy[player].played = Pile.add(copy[player].played, card);
  }

  return copy;
};

const undrawCard = (table, player, card) => {
  const copy = Utils.clone(table);

  if (copy[player] && Pile.includes(copy[player].played, card)) {
    copy[player].played = Pile.remove(copy[player].played, card);
    copy.stock.unshift(card);
  }

  return copy;
};

const playMove = (table, move) => {
  const copy = Utils.clone(table);
  const [start, end] = (move || '').split('-');

  if (isStock(start) && isHand(end)) {
    return drawCard(copy, getPlayer(copy, end));
  }

  if (isCard(start) && isTable(end)) {
    return playCard(copy, getPlayer(copy, end), start);
  }

  if (isCard(start) && isStock(end)) {
    return undrawCard(copy, getPlayer(copy, end), start);
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
