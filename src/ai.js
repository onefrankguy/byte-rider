const Rules = require('./rules');

const AI = {};

AI.winning = (table, player) => {
  const moves = Rules.moves(table, player);

  return moves.filter((move) => {
    const test = Rules.play(table, player, [move]);

    return Rules.winner(test) === player;
  });
};

AI.moves = (table, player) => {
  const winning = AI.winning(table, player);
  if (winning.length > 0) {
    return winning;
  }

  return Rules.moves(table, player);
};

AI.move = (table, player) => {
  const moves = AI.moves(table, player);
  const index = Math.floor(Math.random() * moves.length);
  return moves[index];
};

module.exports = AI;
