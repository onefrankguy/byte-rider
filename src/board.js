const Board = {};

Board.create = () => {
  const suits = ['C', 'H', 'S', 'D'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

  const stock = [];

  suits.forEach((suit) => values.forEach((value) => stock.push(`${value}${suit}`)));

  return {
    discard: [],
    stock,
    xHand: [],
    yHand: [],
    xPlayed: [],
    yPlayed: [],
  };
};

const clone = (board) => JSON.parse(JSON.stringify(board || Board.create()));

Board.player = (board, card) => {
  const suit = card.split('')[1];

  if (board.xHand.includes(card) || suit === 'x') {
    return 'x';
  }

  if (board.yHand.includes(card) || suit === 'y') {
    return 'y';
  }

  return '';
};

Board.opponent = (player) => (player === 'x' ? 'y' : 'x');

Board.draw = (board, aPlayer) => {
  const copy = clone(board);
  const player = (aPlayer || '').toLowerCase();

  if (player === 'x' || player === 'y') {
    const card = copy.stock.shift();

    if (card) {
      copy[`${player}Hand`].push(card);
    }
  }

  return copy;
};

Board.discard = (board, aCard) => {
  const copy = clone(board);
  const card = (aCard || '').toUpperCase();

  if (copy.xHand.includes(card)) {
    copy.xHand = copy.xHand.filter((c) => c !== card);
    copy.discard.push(card);
  }

  if (copy.yHand.includes(card)) {
    copy.yHand = copy.yHand.filter((c) => c !== card);
    copy.discard.push(card);
  }

  return copy;
};

Board.play = (board, aCard) => {
  const copy = clone(board);
  const card = (aCard || '').toUpperCase();

  if (copy.xHand.includes(card)) {
    copy.xHand = copy.xHand.filter((c) => c !== card);
    copy.xPlayed.push(card);
  }

  if (copy.yHand.includes(card)) {
    copy.yHand = copy.yHand.filter((c) => c !== card);
    copy.yPlayed.push(card);
  }

  return copy;
};

Board.scuttle = (board, aCard, bCard) => {
  const copy = clone(board);
  const fromCard = (aCard || '').toUpperCase();
  const toCard = (bCard || '').toUpperCase();
  const player = Board.player(copy, fromCard);
  const opponent = Board.opponent(player);

  if (!player || !opponent) {
    return copy;
  }

  if (copy[`${player}Hand`].includes(fromCard) && copy[`${opponent}Hand`].includes(toCard)) {
    copy[`${player}Hand`] = copy[`${player}Hand`].filter((c) => c !== fromCard);
    copy[`${opponent}Hand`] = copy[`${opponent}Hand`].filter((c) => c !== toCard);
    copy.discard = copy.discard.concat(toCard, fromCard);
  }

  return copy;
};

Board.jack = (board, aCard, bCard) => {
  const copy = clone(board);
  const fromCard = (aCard || '').toUpperCase();
  const toCard = (bCard || '').toUpperCase();
  const player = Board.player(copy, fromCard);
  const opponent = Board.opponent(player);

  if (!player || !opponent) {
    return copy;
  }

  if (copy[`${player}Hand`].includes(fromCard) && copy[`${opponent}Played`].includes(toCard)) {
    copy[`${player}Hand`] = copy[`${player}Hand`].filter((c) => c !== fromCard);
    copy[`${opponent}Played`] = copy[`${opponent}Played`].filter((c) => c !== toCard);
    copy[`${player}Played`].push(`${toCard}-${fromCard}`);
  }

  return copy;
};

module.exports = Board;
