const Board = require('./board');

const Rules = {};

const VALUES = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const NUMBERS = ['A', '2', '3', '4', '5', '6', '7', '9', 'T'];
const ROYALS = ['8', 'J', 'K', 'Q'];
const WINNING_POINTS = 21;

const isNumber = (card) => NUMBERS.includes(card.split('')[0]);

const isRoyal = (card) => ROYALS.includes(card.split('')[0]);

const isStock = (card) => card.split('')[0] === 'S';

const isThree = (card) => card.split('')[0] === '3';
const isJack = (card) => card.split('')[0] === 'J';
const isKing = (card) => card.split('')[0] === 'K';

const getPointCards = (cards) => cards.filter((c) => isNumber(c));

const getPoints = (card) => {
  const [value] = card.split('');
  const index = VALUES.indexOf(value);

  return index > -1 ? index : 0;
};

const getScore = (card) => {
  const [value] = card.split('');

  return NUMBERS.includes(value) ? VALUES.indexOf(value) : 0;
};

const getWinningPoints = (board, player) => {
  const kings = board[`${player}Table`].filter((c) => isKing(c));

  return WINNING_POINTS + (kings.length * -7);
};

const getScuttleable = (cards, card) => isNumber(card)
  && getPointCards(cards).filter((c) => getPoints(c) < getPoints(card));

// You can play your own cards or take one from the stock.
Rules.pickable = (board, player) => board[`${player}Hand`].concat(`S${player}`);

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

    // Discard all non-point cards in play.
    if (isThree(start)) {
      ['xTable', 'yTable'].forEach((place) => {
        copy[place].slice().forEach((card) => {
          if (isRoyal(card)) {
            copy = Rules.discard(board, card);
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

Rules.score = (board, player) => board[`${player}Table`]
  .map(getScore)
  .reduce((acc, value) => (acc + value), 0);

Rules.winner = (board) => {
  if (Rules.score(board, 'x') >= getWinningPoints(board, 'x')) {
    return 'x';
  }

  if (Rules.score(board, 'y') >= getWinningPoints(board, 'y')) {
    return 'y';
  }

  return '';
};

module.exports = Rules;
