const Board = require('./board');

const Rules = {};

const VALUES = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const NUMBERS = ['A', '2', '3', '4', '5', '6', '7', '9', 'T'];
const ROYALS = ['8', 'J', 'K', 'Q'];
const WINNING_POINTS = 21;

const isNumber = (card) => NUMBERS.includes(card.split('')[0]);

const isRoyal = (card) => ROYALS.includes(card.split('')[0]);

const isStock = (value) => (value || '').startsWith('S');
const isTwo = (card) => card.split('')[0] === '2';
const isThree = (card) => card.split('')[0] === '3';
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

Rules.playable = (board, card) => {
  const player = Board.player(board, card);
  const opponent = Board.opponent(player);

  // You can't play without an opponent.
  if (!player || !opponent) {
    return [];
  }

  // You can take a card if the stock's not empty.
  if (isStock(card) && board.stock.length > 0) {
    return [`H${player}`];
  }

  // You can play cards from your hand.
  if (!board[`${player}Hand`].includes(card)) {
    return [];
  }

  const results = [];

  if (isNumber(card)) {
    // You can play a number card for points.
    results.push(`T${player}`);

    // You can discard a number card for an effect.
    results.push(`D${player}`);

    // You play a number card on your opponent's equal or lower value card.
    results.concat(getScuttleable(board[`${opponent}Table`], card));
  }

  if (isRoyal(card)) {
    // You can play a royal card for a boost.
    results.push(`T${player}`);
  }

  return results;
};

Rules.moves = (board, player) => {
  const result = [];

  Rules.pickable(board, player).forEach((start) => {
    Rules.playable(board, start).forEach((end) => {
      result.push(`${start}-${end}`);
    });
  });

  return result;
};

Rules.discard = (board, card) => {
  let copy = Board.clone(board);

  if (isJack(card)) {
    copy = Board.transfer(copy, card);
  }

  return Board.discard(copy, card);
};

Rules.play = (board, move) => {
  const [start, end] = move.split('-');
  const player = Board.player(board, start);

  if (start === `S${player}` && end === `H${player}`) {
    return Board.draw(board, player);
  }

  if (end === `D${player}`) {
    let copy = Rules.discard(board, start);

    // Discard all point cards in play.
    if (isTwo(start)) {
      ['xTable', 'yTable'].forEach((place) => {
        copy[place].forEach((card) => {
          if (isNumber(card)) {
            copy = Rules.discard(copy, card);
          }
        });
      });
    }

    // Discard all non-point cards in play.
    if (isThree(start)) {
      ['xTable', 'yTable'].forEach((place) => {
        copy[place].forEach((card) => {
          if (isRoyal(card)) {
            copy = Rules.discard(copy, card);
          }
        });
      });
    }

    return copy;
  }

  if (end === `T${player}`) {
    return Board.play(board, start);
  }

  return Board.clone(board);
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
