const Rules = require('./rules');
const Table = require('./table');

const AI = {};

const validHand = (table, player) => table && table[player] && table[player].hand.length <= 6;

AI.winning = (table, player) => {
  const moves = Rules.moves(table, player);

  return moves.filter((move) => {
    const [start] = move.split('-');
    const chain = Rules.chain(table, player, start).filter((c) => c[0] === move);

    return !!chain.find((c) => {
      const test = Rules.play(table, player, c);
      return Rules.winner(test) === player && validHand(test, player);
    });
  });
};

AI.blocking = (table, player) => {
  const opponent = Table.opponent(player);
  const score = Rules.score(table, opponent);
  const moves = Rules.moves(table, player);

  return moves.filter((move) => {
    const [start] = move.split('-');
    const chain = Rules.chain(table, player, start).filter((c) => c[0] === move);

    return !!chain.find((c) => {
      const test = Rules.play(table, player, c);
      return Rules.score(test, opponent) < score && validHand(test, player);
    });
  });
};

AI.playable = (table, player) => {
  const moves = Rules.moves(table, player);

  return moves.filter((move) => {
    const [start] = move.split('-');
    const chain = Rules.chain(table, player, start).filter((c) => c[0] === move);

    return !!chain.find((c) => {
      const test = Rules.play(table, player, c);
      return validHand(test, player);
    });
  });
};

AI.moves = (table, player) => {
  if (table && table[player] && table[player].allowed.length > 0) {
    return Rules.moves(table, player);
  }

  const winning = AI.winning(table, player);
  if (winning.length > 0) {
    return winning;
  }

  const opponent = Table.opponent(player);
  const score = Rules.score(table, opponent);
  if (score >= 11) {
    const blocking = AI.blocking(table, player);
    if (blocking.length > 0) {
      return blocking;
    }
  }

  return AI.playable(table, player);
};

AI.move = (table, player) => {
  const moves = AI.moves(table, player);
  const index = Math.floor(Math.random() * moves.length);
  return moves[index];
};

module.exports = AI;
