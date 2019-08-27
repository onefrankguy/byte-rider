const Utils = require('./utils');

const Table = {};

const SUITS = ['C', 'D', 'H', 'S'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];

const isStock = (value) => (value || '').startsWith('S');
const isHand = (value) => (value || '').startsWith('H');
const isTable = (value) => (value || '').startsWith('P');
const isDiscard = (value) => (value || '').startsWith('D');

Table.player = (table, value) => {
  if (!table || !value) {
    return '';
  }

  if (table.x.hand.includes(value) || table.x.played.includes(value)) {
    return 'x';
  }

  if (table.y.hand.includes(value) || table.y.played.includes(value)) {
    return 'y';
  }

  const result = (value || '').split('')[1] || '';

  return table[result] ? result : '';
};

Table.opponent = (player) => {
  if (player === 'x') {
    return 'y';
  }

  if (player === 'y') {
    return 'x';
  }

  return '';
};

const playMove = (table, move) => {
  const copy = Utils.clone(table);
  const [start, end] = (move || '').split('-');
  const player = Table.player(copy, end);
  let card = start;

  if (isStock(start)) {
    card = copy.stock.shift();
  }

  if (isDiscard(start)) {
    card = copy.discard.shift();
  }

  ['x', 'y'].forEach((p) => {
    ['hand', 'played'].forEach((pile) => {
      copy[p][pile] = copy[p][pile].filter((c) => c !== card);
    });
  });

  ['stock', 'discard'].forEach((pile) => {
    copy[pile] = copy[pile].filter((c) => c !== card);
  });

  if (card && isStock(end)) {
    copy.stock.unshift(card);
  }

  if (card && isDiscard(end)) {
    copy.discard.unshift(card);
  }

  if (card && player && isHand(end)) {
    copy[player].hand.push(card);
  }

  if (card && player && isTable(end)) {
    copy[player].played.push(card);
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
  jacked: {},
  x: {
    hand: [],
    played: [],
    allowed: [],
  },
  y: {
    hand: [],
    played: [],
    allowed: [],
  },
});

Table.play = (table, moves) => {
  let copy = Utils.clone(table);

  (moves || []).forEach((move) => {
    copy = playMove(copy, move);
  });

  return copy;
};

Table.deal = (table, player) => {
  let copy = Utils.clone(table);
  const opponent = Table.opponent(player);

  if (player && opponent) {
    const moves = [];
    for (let i = 0; i < 5; i += 1) {
      moves.push(`S${opponent}-H${opponent}`);
      moves.push(`S${player}-H${player}`);
    }
    moves.push(`S${opponent}-H${opponent}`);
    copy.stock = Utils.shuffle(copy.stock);
    copy = Table.play(copy, moves);
  }

  return copy;
};

module.exports = Table;
