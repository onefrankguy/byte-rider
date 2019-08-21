const Utils = require('./utils');
const Pile = require('./pile');

const Table = {};

const SUITS = ['C', 'D', 'H', 'S'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];

const isCard = (value) => !!VALUES.find((v) => (value || '').startsWith(v));
const isStock = (value) => (value || '').startsWith('S');
const isHand = (value) => (value || '').startsWith('H');
const isTable = (value) => (value || '').startsWith('P');
const isDiscard = (value) => (value || '').startsWith('D');

Table.player = (table, value) => {
  if (!table || !value) {
    return '';
  }

  if (Pile.includes(table.x.hand, value) || Pile.includes(table.x.played, value)) {
    return 'x';
  }

  if (Pile.includes(table.y.hand, value) || Pile.includes(table.y.played, value)) {
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

const discardCard = (table, player, card) => {
  const copy = Utils.clone(table);

  if (copy[player]) {
    if (Pile.includes(copy[player].hand, card)) {
      copy[player].hand = Pile.remove(copy[player].hand, card);
      copy.discard.unshift(card);
    }

    if (Pile.includes(copy[player].played, card)) {
      copy[player].played = Pile.remove(copy[player].played, card);
      copy.discard.unshift(card);
    }
  }

  return copy;
};

const undiscardCard = (table, player, card) => {
  const copy = Utils.clone(table);

  if (copy[player] && Pile.includes(copy.discard, card)) {
    copy.discard = Pile.remove(copy.discard, card);
    copy[player].hand = Pile.add(copy[player].hand, card);
  }

  return copy;
};

const stackCard = (table, card1, card2) => {
  const copy = Utils.clone(table);
  const player1 = Table.player(copy, card1);

  if (copy[player1] && Pile.includes(copy[player1].hand, card1)) {
    const player2 = Table.player(copy, card2);

    if (copy[player2] && Pile.includes(copy[player2].played, card2)) {
      copy[player1].hand = Pile.remove(copy[player1].hand, card1);
      copy[player2].played = Pile.add(copy[player2].played, card1, card2);
    }
  }

  return copy;
};

const playMove = (table, move) => {
  const copy = Utils.clone(table);
  const [start, end] = (move || '').split('-');

  if (isStock(start) && isHand(end)) {
    return drawCard(copy, Table.player(copy, end));
  }

  if (isCard(start) && isTable(end)) {
    return playCard(copy, Table.player(copy, end), start);
  }

  if (isCard(start) && isStock(end)) {
    return undrawCard(copy, Table.player(copy, start), start);
  }

  if (isCard(start) && isDiscard(end)) {
    return discardCard(copy, Table.player(copy, start), start);
  }

  if (isCard(start) && isHand(end)) {
    return undiscardCard(copy, Table.player(copy, end), start);
  }

  if (isCard(start) && isCard(end)) {
    return stackCard(copy, start, end);
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
