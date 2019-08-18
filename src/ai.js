const Rules = require('./rules');

const AI = {};

AI.winning = (board, player) => {
  const moves = Rules.moves(board, player);

  return moves.filter((move) => {
    const test = Rules.play(board, move);

    return Rules.winner(test) === player;
  });
};

module.exports = AI;
