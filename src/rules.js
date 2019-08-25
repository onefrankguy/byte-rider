const Table = require('./table');
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

const fixDS = (value) => (value || '')
  .replace(/Dx/g, 'D')
  .replace(/Dy/g, 'D')
  .replace(/Sx/g, 'S')
  .replace(/Sy/g, 'S');

const isEqual = (value1, value2) => fixDS(value1) === fixDS(value2);

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

  return isKing(value) ? 7 : 0;
};

const canScuttle = (card) => (c) => isNumber(card) && isNumber(c) && getPoints(c) <= getPoints(card);

Rules.pickable = (table, player) => {
  const result = new Set();

  if (table && table[player]) {
    table[player].allowed.forEach((chain) => {
      const [start] = (chain[0] || '').split('-');
      if (start) {
        result.add(start);
      }
    });

    if (result.size <= 0) {
      // You can play your own cards.
      table[player].hand.forEach((card) => result.add(card));

      // You can take a card from the stock unless it's empty.
      if (table.stock.length > 0) {
        result.add(`S${player}`);
      }
    }
  }

  return [...result];
};

Rules.playable = (table, player, card) => {
  const result = new Set();

  if (table && table[player]) {
    let allowed = table[player].allowed.slice();
    if (allowed.length <= 0) {
      allowed = Rules.chain(table, player, card);
    }

    allowed.forEach((chain) => {
      const [start, end] = (chain[0] || '').split('-');
      if (isEqual(start, card) && end) {
        result.add(end);
      }
    });
  }

  return [...result];
};

Rules.chain = (table, player, card) => {
  const opponent = Table.opponent(player);

  if (!table || !player || !opponent || !card) {
    return [];
  }

  // S - Draw the top card from the stock.
  if (isStock(card)) {
    return [[`${card}-H${player}`]];
  }

  const points = [[`${card}-P${player}`]];

  const scuttle = table[opponent].played.filter(canScuttle(card))
    .map((c) => [`${card}-${c}`]);

  // A - Discard any non-point card in play.
  if (isAce(card)) {
    return table[opponent].played
      .filter(isRoyal).map((c) => [`${card}-D${player}`, `${c}-D${opponent}`])
      .concat(points)
      .concat(scuttle);
  }

  // 2 - Discard all point cards in play.
  if (isTwo(card)) {
    const result = points.concat(scuttle);
    if (table[opponent].played.find(isNumber)) {
      result.unshift([`${card}-D${player}`]);
    }
    return result;
  }

  // 3 - Discard all non-point cards in play.
  if (isThree(card)) {
    const result = points.concat(scuttle);
    if (table[opponent].played.find(isRoyal)) {
      result.unshift([`${card}-D${player}`]);
    }
    return result;
  }

  // 4 - Return any card in play to the top of the stock.
  if (isFour(card)) {
    return table[opponent].played
      .map((c) => [`${card}-D${player}`, `${c}-S${opponent}`])
      .concat(points)
      .concat(scuttle);
  }

  // 5 - Choose 2 of your opponent's cards that they must discard. If they have
  // more than 5 cards after this, they must discard down to 5 cards.
  if (isFive(card)) {
    const cards = table[opponent].hand;

    if (cards.length <= 0) {
      return points.concat(scuttle);
    }

    if (cards.length <= 1) {
      return [[`${card}-D${player}`, `${cards[0]}-D${opponent}`]]
        .concat(points)
        .concat(scuttle);
    }

    const result = [];
    for (let i = 0; i < cards.length; i += 1) {
      for (let j = 0; j < cards.length; j += 1) {
        if (i !== j) {
          result.push([`${card}-D${player}`, `${cards[i]}-D${opponent}`, `${cards[j]}-D${opponent}`]);
        }
      }
    }
    return result.concat(points).concat(scuttle);
  }

  // 6 - Draw 2 cards. Return 1 card to the top of the stock. Use the other card
  // immediately.
  if (isSix(card)) {
    const card1 = table.stock[0];
    const card2 = table.stock[1];
    if (!card1 && !card2) {
      return points.concat(scuttle);
    }
    if (card1 && !card2) {
      const move = [`${card}-D${player}`, `S${player}-H${player}`];
      const result = [];
      const copy = Table.play(table, move);
      Rules.chain(copy, player, card1).forEach((r) => {
        result.push(move.concat(r));
      });
      return result.concat(points).concat(scuttle);
    }
    if (card1 && card2) {
      const move = [`${card}-D${player}`, `S${player}-H${player}`, `S${player}-H${player}`];
      const result = [];
      const m1 = move.concat(`${card1}-S${player}`);
      const copy1 = Table.play(table, m1);
      Rules.chain(copy1, player, card2).forEach((r) => {
        result.push(m1.concat(r));
      });
      const m2 = move.concat(`${card2}-S${player}`);
      const copy2 = Table.play(table, m2);
      Rules.chain(copy2, player, card1).forEach((r) => {
        result.push(m2.concat(r));
      });
      return result.concat(points).concat(scuttle);
    }
  }

  // 7 - Add one card from the discard to your hand.
  if (isSeven(card)) {
    return table.discard
      .map((c) => [`${card}-D${player}`, `${c}-H${player}`])
      .concat(points)
      .concat(scuttle);
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
      ]).concat(points).concat(scuttle);
    }
    if (card1 && card2) {
      return [[
        `${card}-D${player}`,
        `S${player}-H${player}`,
        `S${player}-H${player}`,
      ]].concat(points).concat(scuttle);
    }
    return points.concat(scuttle);
  }

  // T - Add any card from your opponent's hand to your hand.
  if (isTen(card)) {
    return table[opponent].hand
      .map((c) => [`${card}-D${player}`, `${c}-H${player}`])
      .concat(points)
      .concat(scuttle);
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
  const result = new Set();

  if (table && table[player]) {
    table[player].allowed.forEach((chain) => {
      if (chain[0]) {
        result.add(chain[0]);
      }
    });
  }

  if (result.size <= 0) {
    Rules.pickable(table, player).forEach((start) => {
      Rules.chain(table, player, start).forEach((chain) => {
        if (chain[0]) {
          result.add(chain[0]);
        }
      });
    });
  }

  return [...result];
};

Rules.allowed = (table, player, move) => Rules.moves(table, player).find((m) => isEqual(m, move));

Rules.play = (table, player, moves) => {
  const [move] = (moves || []);
  if (!table || !player || !move) {
    return table;
  }

  let copy = Utils.clone(table);
  let allowed = [];

  if (copy && copy[player]) {
    const [start, end] = move.split('-');

    if (copy[player].allowed.length <= 0) {
      copy[player].allowed = Rules.chain(copy, player, start);
    }

    copy[player].allowed = copy[player].allowed
      .filter((c) => isEqual(c[0], move))
      .map((c) => c.slice(1))
      .filter((c) => c.length > 0);

    allowed = moves.slice(1);
    let play = [move];

    // 2 - Discard all point cards in play.
    if (isTwo(start) && isDiscard(end)) {
      ['x', 'y'].forEach((p) => {
        play = play.concat(copy[p].played.filter(isNumber)
          .map((c) => `${c}-D${p}`));
      });
    }

    // 3 - Discard all non-point cards in play.
    if (isThree(start) && isDiscard(end)) {
      ['x', 'y'].forEach((p) => {
        play = play.concat(copy[p].played.filter(isRoyal)
          .map((c) => `${c}-D${p}`));
      });
    }

    copy = Table.play(copy, play);
  }

  return Rules.play(copy, player, allowed);
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
