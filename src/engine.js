const Table = require('./table');
const Utils = require('./utils');
const Rules = require('./rules');
const AI = require('./ai');

const Engine = {};

Engine.tick = (table, player, start, end) => {
  if (Rules.winner(table)) {
    return [Utils.clone(table), undefined];
  }

  let move = Rules.resolve(table, player, start, end);
  console.log('x move', move);

  if (Rules.allowed(table, player, move)) {
    let next = Rules.play(table, player, [move]);
    next = Rules.autoplay(next, player);
    console.log('x played', move);

    if (Rules.winner(next) !== player && next[player].allowed.length <= 0) {
      const opponent = Table.opponent(player);
      move = AI.move(next, opponent);
      next = Rules.play(next, opponent, [move]);
      console.log('y played', move);

      while (next[opponent].allowed.length > 0) {
        move = AI.move(next, opponent);
        next = Rules.play(next, opponent, [move]);
        console.log('y played', move);
      }
    }

    return [next, undefined];
  }

  const pickable = Rules.pickable(table, player);
  const [pick, play] = move.split('-');
  let [picked] = [play, pick].filter((value) => pickable.includes(value));

  if (start && end && start === picked) {
    picked = undefined;
  }

  return [Utils.clone(table), picked];
};

module.exports = Engine;
