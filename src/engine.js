const Table = require('./table');
const Utils = require('./utils');
const Rules = require('./rules');

const Engine = {};

Engine.tick = (table, player, start, end) => {
  if (Rules.winner(table)) {
    return [Utils.clone(table), undefined];
  }

  if (start && end) {
    const move = `${start}-${end}`;
    const next = Table.play(table, [move]);

    console.log(`${player}: ${move}`);

    return [next, undefined];
  }

  const picked = [end, start].filter((value) => value);
  return [Utils.clone(table), ...picked];
};

module.exports = Engine;
