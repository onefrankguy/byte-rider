const Table = require('./table');
const Pile = require('./pile');

const Rules = {};

const VALUES = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const NUMBERS = ['A', '2', '3', '4', '5', '6', '7', '9', 'T'];
const ROYALS = ['8', 'J', 'K', 'Q'];
const WINNING_POINTS = 21;

const isNumber = (card) => NUMBERS.includes((card || '').split('')[0]);
const isRoyal = (card) => ROYALS.includes((card || '').split('')[0]);
const isStock = (value) => (value || '').startsWith('S');
const isDiscard = (value) => (value || '').startsWith('D');
const isAce = (card) => (card || '').startsWith('A');
const isTwo = (card) => (card || '').startsWith('2');
const isThree = (card) => (card || '').startsWith('3');
const isEight = (card) => (card || '').startsWith('8');

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

  let results = [];

  if (isNumber(card)) {
    // You can play a number card for points.
    results.push(`P${player}`);

    // You can discard a number card for an effect.
    results.push(`D${player}`);

    // You play a number card on your opponent's equal or lower value card.
    results = results.concat(getScuttleable(table[opponent].played, card));

    // Discard any non-point card in play.
    if (isAce(card)) {
      results = results.concat(table[opponent].played.filter(isRoyal));
    }
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

  let moves = [move];

  // Discard any non-point card in play or prevent the last effect from occuring.
  if (isAce(start) && isRoyal(end)) {
    moves = [
      `${end}-D`,
      `${start}-D`,
    ];
  }

  // Return any card in play to the top of the stack.
  // if (isFour(start))

  // Choose 2 of your opponent'ss cards that they must discard. If they have more
  // than 5 cards after this, they must discard down to 5 cards.
  // if (isFive(start))

  // Draw 2 cards. Return 1 card to the top of the stock. Use the other card
  // immidiately.
  // if (isSix(start))

  // Add any card from the discard to your hand.
  // if (isSeven(start))

  // Draw 3 cards. Return 1 card to the top of the stack. Add the other 2 cards
  // to your hand.
  // if (isNine(start))

  // Add any card from your opponent's hand to your hand.
  // if (isTen(start))

  // Transfer control of an opponent's card in play.
  // if (isJack(start))

  if (isDiscard(end)) {
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

  // Your opponent must play with their hand exposed.
  // if (isEight(start))

  // All your cards in play are protected from effects that target single cards.
  // Queens are not protected by themselves or other Queens.
  // if (isQueen(start))

  // Reduce the number of points needed to win by 7.
  // if (isKing(card))

  return Table.play(table, moves);
};

Rules.visible = (table, player) => {
  const result = [];
  const opponent = Table.opponent(player);

  if (table && table[player]) {
    result.push(player);
    if (opponent && table[player].played.find(isEight)) {
      result.push(opponent);
    }
  }

  return result;
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
