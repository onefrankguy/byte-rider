const Table = require('./table');
const Utils = require('./utils');
const Rules = require('./rules');
const AI = require('./ai');

const Engine = {};

Engine.tick = (table, player, start, end) => {
  if (Rules.winner(table)) {
    return [Utils.clone(table), undefined];
  }

  let move = `${start}-${end}`;
  if (Rules.moves(table, player).includes(move)) {
    let next = Table.play(table, [move]);

    if (Rules.winner(next) !== player) {
      move = AI.move(next, Table.opponent(player));
      next = Table.play(next, [move]);
    }

    return [next, undefined];
  }

  const pickable = Rules.pickable(table, player);
  const picked = [end, start].filter((value) => pickable.includes(value));
  return [Utils.clone(table), ...picked];
};

module.exports = Engine;
