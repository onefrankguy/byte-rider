const $ = require('./jquery');
const Table = require('./table');
const Renderer = require('./renderer');
const Engine = require('./engine');

const Game = {};

let table;
let input = [];
let picked;
let touched;

const onBoard = (_, event) => {
  if (event.target && event.target.matches('.reset')) {
    event.stopPropagation();
    $(event.target).addClass('picked');
    return;
  }

  if (event.target && event.target.matches('.card')) {
    $(event.target).addClass('picked');
  }
};

const offBoard = (_, event) => {
  if (event.target && event.target.matches('.reset')) {
    event.stopPropagation();
    Game.reset();
    $(event.target).removeClass('picked');
    return;
  }

  if (event.target && (event.target.matches('.card') || event.target.matches('.pile')) && event.target.id) {
    event.stopPropagation();
    touched = event.target.id;
    input.push(touched);
    [table, picked] = Engine.tick(table, 'x', ...input);
    input = picked ? [picked] : [];
    Renderer.invalidate(table, picked, touched);
  }
};

Game.reset = () => {
  table = Table.create();
  table = Table.deal(table, 'x');
  input = [];
  picked = undefined;
  touched = undefined;
  Renderer.invalidate(table, picked, touched);
};

Game.play = () => {
  $('#board').click(onBoard, offBoard);

  Game.reset();
};

module.exports = Game;
