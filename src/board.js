const Board = {};

Board.create = () => {
  const suits = ['C', 'H', 'S', 'D'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

  const stock = [];

  suits.forEach((suit) => values.forEach((value) => stock.push(`${value}${suit}`)));

  return {
    discard: [],
    stock,
    xCovers: {},
    yCovers: {},
    xHand: [],
    yHand: [],
    xTable: [],
    yTable: [],
  };
};

Board.clone = (board) => JSON.parse(JSON.stringify(board || Board.create()));

Board.player = (board, card) => {
  const suit = card.split('')[1];

  if (board.xHand.includes(card)
    || board.xTable.includes(card)
    || suit === 'x'
  ) {
    return 'x';
  }

  if (board.yHand.includes(card)
    || board.yTable.includes(card)
    || suit === 'y'
  ) {
    return 'y';
  }

  return '';
};

Board.opponent = (player) => (player === 'x' ? 'y' : 'x');

Board.draw = (board, aPlayer) => {
  const copy = Board.clone(board);
  const player = (aPlayer || '').toLowerCase();

  if (player === 'x' || player === 'y') {
    const card = copy.stock.shift();

    if (card) {
      copy[`${player}Hand`].push(card);
    }
  }

  return copy;
};

Board.discard = (board, card) => {
  let copy = Board.clone(board);

  ['xCovers', 'yCovers'].forEach((place) => {
    Object.keys(copy[place]).forEach((key) => {
      if (key === card) {
        delete copy[place][key];
      } else if (copy[place][key] === card) {
        copy = Board.discard(board, key);
      }
    });
  });

  ['xHand', 'yHand', 'xTable', 'yTable'].forEach((place) => {
    if (copy[place].includes(card)) {
      copy[place] = copy[place].filter((c) => c !== card);
      copy.discard.push(card);
    }
  });

  /*
  if (board.debug) {
    console.log('discard:', card, '\nbefore:', { ...board, stock: [] }, '\nafter:', { ...copy, stock: [] });
  }
  */

  return copy;
};

Board.play = (board, aCard) => {
  const copy = Board.clone(board);
  const card = (aCard || '').toUpperCase();

  if (copy.xHand.includes(card)) {
    copy.xHand = copy.xHand.filter((c) => c !== card);
    copy.xTable.push(card);
  }

  if (copy.yHand.includes(card)) {
    copy.yHand = copy.yHand.filter((c) => c !== card);
    copy.yTable.push(card);
  }

  return copy;
};

Board.transfer = (board, card) => {
  let copy = Board.clone(board);

  if (copy.xTable.includes(card)) {
    copy.xTable = copy.xTable.filter((c) => c !== card);
    copy.yTable.push(card);

    if (copy.xCovers[card]) {
      copy.yCovers[card] = copy.xCovers[card];
      copy = Board.transfer(copy, copy.xCovers[card]);
    }

    return copy;
  }

  if (copy.yTable.includes(card)) {
    copy.yTable = copy.yTable.filter((c) => c !== card);
    copy.xTable.push(card);

    if (copy.yCovers[card]) {
      copy.xCovers[card] = copy.yCovers[card];
      copy = Board.transfer(copy, copy.yCovers[card]);
    }

    return copy;
  }

  return copy;
};

Board.cover = (board, aCard, bCard) => {
  const copy = Board.clone(board);

  if (copy.xHand.includes(aCard) && copy.yTable.includes(bCard)) {
    copy.xHand = copy.xHand.filter((c) => c !== aCard);
    copy.yTable.push(aCard);
    copy.yCovers[aCard] = bCard;
  }

  if (copy.yHand.includes(aCard) && copy.xTable.includes(bCard)) {
    copy.yHand = copy.yHand.filter((c) => c !== aCard);
    copy.xTable.push(aCard);
    copy.xCovers[aCard] = bCard;
  }

  return copy;
};

module.exports = Board;
