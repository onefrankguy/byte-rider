const Table = require('./table');
const Utils = require('./utils');

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

const isJacked = (table) => (c) => ((table || { jacked: {} }).jacked[c] || []).length > 0;
const isRoyalOrJacked = (table) => (c) => isRoyal(c) || isJacked(table)(c);

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

      // You can take a card from the stock.
      result.add(`S${player}`);
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
    const filter = table[opponent].played.find(isQueen) ? isQueen : isRoyalOrJacked(table);
    return table[opponent].played
      .filter(filter)
      .map((c) => [`${card}-D${player}`, `${c}-D${opponent}`])
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
    if (table[opponent].played.find(isRoyalOrJacked(table))) {
      result.unshift([`${card}-D${player}`]);
    }
    return result;
  }

  // 4 - Return any card in play to the top of the stock.
  if (isFour(card)) {
    const filter = table[opponent].played.find(isQueen) ? isQueen : isCard;
    return table[opponent].played
      .filter(filter)
      .map((c) => [`${card}-D${player}`, `${c}-S${opponent}`])
      .concat(points)
      .concat(scuttle);
  }

  // 5 - Choose 2 of your opponent's cards that they must discard.
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

  // 7 - Add one card from the top 3 in the discard to your hand.
  if (isSeven(card)) {
    return table.discard.slice(0, 3)
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
    const filter = table[opponent].played.find(isQueen) ? isQueen : isCard;
    return table[opponent].played
      .filter(filter)
      .map((c) => [`${card}-D${player}`, `${c}-P${player}`]);
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
  if (!table || !table[player] || !move) {
    return table;
  }

  let copy = Utils.clone(table);
  let allowed = [];

  if (copy.stock.length <= 0) {
    copy.stock = Utils.shuffle(copy.discard.slice(4));
    copy.discard = copy.discard.slice(0, 4);
  }

  const [start, end] = move.split('-');

  if (copy[player].allowed.length <= 0) {
    copy[player].allowed = Rules.chain(copy, player, start);
  }

  copy[player].allowed = copy[player].allowed
    .filter((c) => isEqual(c[0], move))
    .map((c) => c.slice(1))
    .filter((c) => c.length > 0);

  allowed = moves.slice(1);
  let play;

  // A - Discard any non-point card in play.
  if (!play && isAce(copy.discard[0]) && isJacked(copy)(start) && isDiscard(end)) {
    const opponent = Table.opponent(player);
    const jack = copy.jacked[start].pop();
    play = [`${jack}-D${opponent}`, `${start}-P${player}`];
  }

  // 2 - Discard all point cards in play.
  if (!play && isTwo(start) && isDiscard(end)) {
    play = [move];
    if (copy[player].hand.includes(start)) {
      ['x', 'y'].forEach((p) => {
        copy[p].played.filter(isNumber).forEach((c) => {
          let jack = (copy.jacked[c] || []).pop();
          while (jack) {
            play.push(`${jack}-D${p}`);
            jack = (copy.jacked[c] || []).pop();
          }
          play.push(`${c}-D${p}`);
        });
      });
    }
  }

  // 3 - Discard all non-point cards in play.
  if (!play && isThree(start) && isDiscard(end)) {
    play = [move];
    if (copy[player].hand.includes(start)) {
      ['x', 'y'].forEach((p) => {
        copy[p].played.filter(isJacked(copy)).forEach((c) => {
          let opponent;
          let jack = copy.jacked[c].pop();
          while (jack) {
            opponent = Table.opponent(opponent || p);
            play = play.concat([`${jack}-D${p}`, `${c}-P${opponent}`]);
            jack = copy.jacked[c].pop();
          }
        });
        play = play.concat(copy[p].played.filter(isRoyal)
          .map((c) => `${c}-D${p}`));
      });
    }
  }

  // 4 - Return any card in play to the top of the stock.
  if (!play && isFour(copy.discard[0]) && isJacked(copy)(start) && isStock(end)) {
    const opponent = Table.opponent(player);
    const jack = copy.jacked[start].pop();
    play = [`${jack}-S${opponent}`, `${start}-P${player}`];
  }

  // Numbers - Play a number card on an equal or lower value number card.
  // Discard both cards.
  if (!play && canScuttle(start)(end)) {
    const opponent = Table.opponent(player);
    play = [`${start}-D${player}`];
    if (isJacked(copy)(end)) {
      let jack = copy.jacked[end].pop();
      while (jack) {
        play = play.concat(`${jack}-D${opponent}`);
        jack = copy.jacked[end].pop();
      }
    }
    play = play.concat(`${end}-D${opponent}`);
  }

  // J - Transfer control of an opponent's card in play.
  if (!play && isJack(copy.discard[0]) && end === `P${player}`) {
    const opponent = Table.opponent(player);
    if (copy[opponent].played.includes(start)) {
      const jack = copy.discard.shift();
      if (!copy.jacked[start]) {
        copy.jacked[start] = [];
      }
      copy.jacked[start].push(jack);
    }
  }

  if (!play) {
    play = [move];
  }

  copy = Table.play(copy, play);
  copy.moves = copy.moves.concat(play);

  return Rules.play(copy, player, allowed);
};

Rules.resolve = (table, player, start, end) => {
  const moves = Rules.moves(table, player);
  let pick = start;
  let play = end;

  if (pick === 'S') {
    const move = moves.find((m) => {
      const c = m.split('-')[0];
      return isStock(c) || isDiscard(c);
    });
    if (move) {
      [pick] = move.split('-');
    }
  }

  if (play === 'S') {
    const move = moves.find((m) => {
      const c = m.split('-')[1];
      return isStock(c) || isDiscard(c);
    });
    if (move) {
      [play] = move.split('-').slice(1);
    }
  }

  return `${pick}-${play}`;
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

Rules.info = (card) => {
  const result = {};

  if (isAce(card)) {
    result.name = 'Automated Response';
    result.type = 'Exploit';
    result.value = 1;
    result.effect = 'Discard any non-point card in play.';
  }

  if (isTwo(card)) {
    result.name = 'Viral Infection';
    result.type = 'Exploit';
    result.value = 2;
    result.effect = 'Discard all point cards in play.';
  }

  if (isThree(card)) {
    result.name = 'Logic Bomb';
    result.type = 'Exploit';
    result.value = 3;
    result.effect = 'Discard all non-point cards in play.';
  }

  if (isFour(card)) {
    result.name = 'Stack Corruption';
    result.type = 'Patch';
    result.value = 4;
    result.effect = 'Return any card in play to the top of the stock.';
  }

  if (isFive(card)) {
    result.name = 'Code Review';
    result.type = 'Tool';
    result.value = 5;
    result.effect = 'Choose 2 of your opponent\'s cards that they must discard.';
  }

  if (isSix(card)) {
    result.name = 'Branch Prediction';
    result.type = 'Patch';
    result.value = 6;
    result.effect = 'Draw 2 cards. Return 1 card to the top of the stock. '
    + 'Use the other card immediately.';
  }

  if (isSeven(card)) {
    result.name = 'Data Recovery';
    result.type = 'Patch';
    result.value = 7;
    result.effect = 'Add any card from the top 3 in the discard to your hand.';
  }

  if (isEight(card)) {
    result.name = 'Network Monitor';
    result.type = 'Exploit';
    result.value = 0;
    result.effect = 'Your opponent must play with their hand exposed.';
  }

  if (isNine(card)) {
    result.name = 'Energy Drink';
    result.type = 'Patch';
    result.value = 9;
    result.effect = 'Draw 3 cards. Return one card to the top of the stock. '
    + 'Add the other 2 cards to your hand.';
  }

  if (isTen(card)) {
    result.name = 'Phishing Campaign';
    result.type = 'Patch';
    result.value = 10;
    result.effect = 'Add any card from your opponent\'s hand to your hand.';
  }

  if (isJack(card)) {
    result.name = 'Trojan Horse';
    result.type = 'Patch';
    result.value = 0;
    result.effect = 'Transfer control of an opponent\'s card in play.';
  }

  if (isQueen(card)) {
    result.name = 'Filtering Router';
    result.type = 'Exploit';
    result.value = 0;
    result.effect = 'All your cards in play are protected from effects that target single cards. '
    + 'Routers are not protected by themselves or other Routers.';
  }

  if (isKing(card)) {
    result.name = 'Overclocked Processor';
    result.type = 'Exploit';
    result.value = 0;
    result.effect = 'Reduce the number of points needed to win by 7.';
  }

  return result;
};

module.exports = Rules;
