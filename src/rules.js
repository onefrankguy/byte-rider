const Rules = {};

const VALUES = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const NUMBERS = ['A', '2', '3', '4', '5', '6', '7', '9', 'T'];
const ROYALS = ['8', 'J', 'K', 'Q'];

const isNumber = (card) => NUMBERS.includes(card.split('')[0]);

const isRoyal = (card) => ROYALS.includes(card.split('')[0]);

const isStock = (card) => card.split('')[0] === 'S';

const getPointCards = (cards) => cards.filter((c) => isNumber(c));

const getPoints = (card) => {
  const [value] = card.split('');
  const index = VALUES.indexOf(value);

  return index > -1 ? index : 0;
};

const getScuttleable = (cards, card) => isNumber(card)
  && getPointCards(cards).filter((c) => getPoints(c) < getPoints(card));

const getPlayer = (board, card) => {
  const suit = card.split('')[1];

  if (board.xHand.includes(card) || suit === 'x') {
    return 'x';
  }

  if (board.yHand.includes(card) || suit === 'y') {
    return 'y';
  }

  return '';
};

const getOpponent = (player) => (player === 'x' ? 'y' : 'x');

// You can play your own cards or take one from the stock.
Rules.pickable = (board, player) => board[`${player}Hand`].concat(`S${player}`);

Rules.playable = (board, card) => {
  const player = getPlayer(board, card);
  const opponent = getOpponent(player);

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
    results.push(`B${player}`);

    // You can discard a number card for an effect.
    results.push(`D${player}`);

    // You play a number card on your opponent's equal or lower value card.
    results.concat(getScuttleable(board[`${opponent}Played`], card));
  }

  if (isRoyal(card)) {
    // You can play a royal card for a boost.
    results.push(`B${player}`);
  }

  return results;
};

module.exports = Rules;
