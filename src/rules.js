const Table = require('./table');
const Pile = require('./pile');

const Rules = {};

const VALUES = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const NUMBERS = ['A', '2', '3', '4', '5', '6', '7', '9', 'T'];
const ROYALS = ['8', 'J', 'K', 'Q'];
const WINNING_POINTS = 21;

const isNumber = (card) => NUMBERS.includes((card || '').split('')[0]);
const isRoyal = (card) => ROYALS.includes((card || '').split('')[0]);
const isCard = (card) => isNumber(card) || isRoyal(card);
const isStock = (value) => (value || '').startsWith('S');
const isDiscard = (value) => (value || '').startsWith('D');
const isAce = (card) => (card || '').startsWith('A');
const isTwo = (card) => (card || '').startsWith('2');
const isThree = (card) => (card || '').startsWith('3');
const isFour = (card) => (card || '').startsWith('4');
const isFive = (card) => (card || '').startsWith('5');
const isSix = (card) => (card || '').startsWith('6');
const isSeven = (card) => (card || '').startsWith('7');
const isEight = (card) => (card || '').startsWith('8');
const isNine = (card) => (card || '').startsWith('9');
const isTen = (card) => (card || '').startsWith('T');
const isJack = (card) => (card || '').startsWith('J');
const isQueen = (card) => (card || '').startsWith('Q');
const isKing = (card) => (card || '').startsWith('K');

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
      const filter = table[opponent].played.find(isQueen) ? isQueen : isRoyal;
      results = results.concat(table[opponent].played.filter(filter));
    }

    // Return any card in play to the top of the stock.
    if (isFour(card)) {
      const filter = table[opponent].played.find(isQueen) ? isQueen : isRoyal;
      results = results.concat(table[opponent].played.filter(filter));
    }
  }

  if (isRoyal(card)) {
    // You can play a royal card for a boost.
    results.push(`P${player}`);
  }

  return results;
};

Rules.chain = (table, card) => {
  const player = Table.player(table, card);
  const opponent = Table.opponent(player);

  if (!player || !opponent) {
    return [];
  }

  // S - Draw the top card from the stock.
  if (isStock(card)) {
    return [[`${card}-H${player}`]];
  }

  // A - Discard any non-point card in play.
  if (isAce(card)) {
    return table[opponent].played.filter(isRoyal).map((c) => [`${card}-D${player}`, `${c}-D${opponent}`]);
  }

  // 2 - Discard all point cards in play.
  if (isTwo(card)) {
    return [[`${card}-D${player}`]];
  }

  // 3 - Discard all non-point cards in play.
  if (isThree(card)) {
    return [[`${card}-D${player}`]];
  }

  // 4 - Return any card in play to the top of the stock.
  if (isFour(card)) {
    return table[opponent].played.map((c) => [`${card}-D${player}`, `${c}-S${opponent}`]);
  }

  // 5 - Choose 2 of your opponent's cards that they must discard. If they have
  // more than 5 cards after this, they must discard down to 5 cards.
  if (isFive(card)) {
    const cards = table[opponent].hand;

    if (cards.length <= 0) {
      return [[`${card}-D${player}`]];
    }

    if (cards.length <= 1) {
      return [[`${card}-D${player}`, `${cards[0]}-D${opponent}`]];
    }

    const result = [];
    for (let i = 0; i < cards.length; i += 1) {
      for (let j = 0; j < cards.length; j += 1) {
        if (i !== j) {
          result.push([`${card}-D${player}`, `${cards[i]}-D${opponent}`, `${cards[j]}-D${opponent}`]);
        }
      }
    }
    return result;
  }

  // 6 - Draw 2 cards. Return 1 card to the top of the stock. Use the other card
  // immediately.
  if (isSix(card)) {
    const card1 = table.stock[0];
    const card2 = table.stock[1];
    if (!card1 && !card2) {
      const move = [`${card}-D${player}`];
      return [move];
    }
    if (card1 && !card2) {
      const move = [`${card}-D${player}`, `S${player}-H${player}`];
      const result = [];
      const copy = Table.play(table, move);
      Rules.chain(copy, card1).forEach((r) => {
        result.push(move.concat(r));
      });
      return result;
    }
    if (card1 && card2) {
      const move = [`${card}-D${player}`, `S${player}-H${player}`, `S${player}-H${player}`];
      const result = [];
      const m1 = move.concat(`${card1}-S${player}`);
      const copy1 = Table.play(table, m1);
      Rules.chain(copy1, card2).forEach((r) => {
        result.push(m1.concat(r));
      });
      const m2 = move.concat(`${card2}-S${player}`);
      const copy2 = Table.play(table, m2);
      Rules.chain(copy2, card1).forEach((r) => {
        result.push(m2.concat(r));
      });
      return result;
    }
  }

  // 7 - Add one card from the discard to your hand.
  if (isSeven(card) && table.discard.length > 0) {
    return table.discard.map((c) => [`${card}-D${player}`, `${c}-H${player}`]);
  }

  // 8 - Your opponent must play with their hand exposed.
  if (isEight(card)) {
    return [[`${card}-P${player}`]];
  }

  // 9 - Draw 3 cards. Return 1 card to the top of the stock. Add the other 2
  // cards to your hand.
  if (isNine(card)) {
    const card1 = table.stock[0];
    const card2 = table.stock[1];
    const card3 = table.stock[2];
    if (card1 && card2 && card3) {
      return [card1, card2, card3].map((c) => [
        `${card}-D${player}`,
        `S${player}-H${player}`,
        `S${player}-H${player}`,
        `S${player}-H${player}`,
        `${c}-S${player}`,
      ]);
    }
    if (card1 && card2) {
      return [[
        `${card}-D${player}`,
        `S${player}-H${player}`,
        `S${player}-H${player}`,
      ]];
    }
  }

  // T - Add any card from your opponent's hand to your hand.
  if (isTen(card)) {
    return table[opponent].hand.map((c) => [`${card}-D${player}`, `${c}-H${player}`]);
  }

  // J - Transfer control of an opponent's card in play.
  if (isJack(card)) {
    return table[opponent].played.map((c) => [`${card}-D${player}`, `${c}-P${player}`]);
  }

  // Q - All your cards in play are protected from effects that target single
  // cards. Queens do not protect themselves or other Queens.
  if (isQueen(card)) {
    return [[`${card}-P${player}`]];
  }

  // K - Reduce the number of ponts needed to win by 7.
  if (isKing(card)) {
    return [[`${card}-P${player}`]];
  }

  return [];
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

  // Return any card in play to the top of the stock.
  if (isFour(start) && isCard(end)) {
    moves = [
      `${end}-S`,
      `${start}-D`,
    ];
  }

  // Choose 2 of your opponent's cards that they must discard. If they have more
  // than 5 cards after this, they must discard down to 5 cards.
  // if (isFive(start))

  // Draw 2 cards. Return 1 card to the top of the stock. Use the other card
  // immidiately.
  // if (isSix(start))

  // Add any card from the discard to your hand.
  // if (isSeven(start))

  // Draw 3 cards. Return 1 card to the top of the stock. Add the other 2 cards
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
