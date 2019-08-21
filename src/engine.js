const Table = require('./table');
const Utils = require('./utils');
const Rules = require('./rules');

const Engine = {};

Engine.tick = (table, player, start, end) => {
  if (Rules.winner(table)) {
    return [Utils.clone(table), undefined];
  }

  const move = `${start}-${end}`;
  console.log(`${player}: ${move}`);

  if (start && end) {
    const next = Table.play(table, [move]);
    return [next, undefined];
  }

  const pickable = Rules.pickable(table, player);
  const picked = [end, start].filter((value) => pickable.includes(value));
  return [Utils.clone(table), ...picked];
};

module.exports = Engine;
