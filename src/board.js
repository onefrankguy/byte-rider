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

Board.clone = (board) => JSON.parse(JSON.stringify(board));

module.exports = Board;
