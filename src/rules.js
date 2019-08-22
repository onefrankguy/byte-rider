const Board = require('./board');
const Table = require('./table');
const Pile = require('./pile');
const Utils = require('./utils');

const Rules = {};

const VALUES = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const NUMBERS = ['A', '2', '3', '4', '5', '6', '7', '9', 'T'];
const ROYALS = ['8', 'J', 'K', 'Q'];
const WINNING_POINTS = 21;

const isNumber = (card) => NUMBERS.includes((card || '').split('')[0]);
const isRoyal = (card) => ROYALS.includes((card || '').split('')[0]);
const isStock = (value) => (value || '').startsWith('S');
const isDiscard = (value) => (value || '').startsWith('D');
const isTwo = (card) => (card || '').startsWith('2');
const isThree = (card) => (card || '').startsWith('3');
const isJack = (card) => card.split('')[0] === 'J';

const getPointCards = (cards) => cards.filter((c) => isNumber(c));

const getPoints = (card) => {
  const [value] = card.split('');
  const index = VALUES.indexOf(value);

  return index > -1 ? index : 0;
};

const getScore = (card) => {
  const [value] = card.split('');

  if (NUMBERS.includes(value)) {
    return VALUES.indexOf(value);
  }

  return value === 'K' ? 7 : 0;
};

const getScuttleable = (cards, card) => isNumber(card)
  && getPointCards(cards).filter((c) => getPoints(c) < getPoints(card));

Rules.pickable = (table, player) => {
  if (!table || !table[player]) {
    return [];
  }

  // You can play your own cards.
  const result = table[player].hand.slice();

  // You can take a card from the stock unless it's empty.
  if (table.stock.length > 0) {
    result.push(`S${player}`);
  }

  return result;
};

Rules.playable = (table, card) => {
  const player = Table.player(table, card);
  const opponent = Table.opponent(player);

  // You can't play without an opponent.
  if (!player || !opponent) {
    return [];
  }

  // You can take a card if the stock's not empty.
  if (isStock(card) && table.stock.length > 0) {
    return [`H${player}`];
  }

  // You can only play cards from your hand.
  if (!Pile.includes(table[player].hand, card)) {
    return [];
  }

  const results = [];

  if (isNumber(card)) {
    // You can play a number card for points.
    results.push(`P${player}`);

    // You can discard a number card for an effect.
    results.push(`D${player}`);

    // You play a number card on your opponent's equal or lower value card.
    results.concat(getScuttleable(table[player].played, card));
  }

  if (isRoyal(card)) {
    // You can play a royal card for a boost.
    results.push(`P${player}`);
  }

  return results;
};

Rules.moves = (table, player) => {
  const result = [];

  Rules.pickable(table, player).forEach((start) => {
    Rules.playable(table, start).forEach((end) => {
      result.push(`${start}-${end}`);
    });
  });

  return result;
};

Rules.play = (table, move) => {
  const [start, end] = (move || '').split('-');

  if (!table || !start || !end) {
    return table;
  }

  let moves = [];

  if (isDiscard(end)) {
    moves.push(move);

    // Discard all point cards in play.
    if (isTwo(start)) {
      ['x', 'y'].forEach((player) => {
        moves = moves.concat(table[player].played.filter(isNumber)
          .map((card) => `${card}-D`));
      });
    }

    // Discard all non-point cards in play.
    if (isThree(start)) {
      ['x', 'y'].forEach((player) => {
        moves = moves.concat(table[player].played.filter(isRoyal)
          .map((card) => `${card}-D`));
      });
    }
  }

  return Table.play(table, moves);
};

Rules.score = (table, player) => {
  if (!table || !table[player]) {
    return 0;
  }

  return table[player].played.map(getScore).reduce((acc, value) => (acc + value), 0);
};

Rules.winner = (table) => {
  if (Rules.score(table, 'x') >= WINNING_POINTS) {
    return 'x';
  }

  if (Rules.score(table, 'y') >= WINNING_POINTS) {
    return 'y';
  }

  return '';
};

module.exports = Rules;
