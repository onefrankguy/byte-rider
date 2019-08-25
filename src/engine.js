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
  console.log('x moves', Rules.moves(table, player));
  if (Rules.moves(table, player).includes(move)) {
    let next = Rules.play(table, player, [move]);
    console.log('x played', move);

    if (Rules.winner(next) !== player) {
      const opponent = Table.opponent(player);
      move = AI.move(next, opponent);
      next = Rules.play(next, opponent, [move]);
      console.log('y played', move);
    }

    return [next, undefined];
  }

  const pickable = Rules.pickable(table, player);
  const picked = [end, start].filter((value) => pickable.includes(value));
  return [Utils.clone(table), ...picked];
};

module.exports = Engine;
