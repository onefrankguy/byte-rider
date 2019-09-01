const $ = require('./jquery');
const Table = require('./table');
const Renderer = require('./renderer');
const Engine = require('./engine');
const Utils = require('./utils');

const Game = {};

let animating = false;
let table;
let input = [];
let picked;
let touched;

const onBoard = (_, event) => {
  if (animating) {
    return;
  }

  if (event.target && event.target.matches('.reset')) {
    event.stopPropagation();
    $(event.target).addClass('picked');
    return;
  }

  if (event.target && event.target.matches('.card') && event.target.id) {
    $(event.target).addClass('picked');
    touched = event.target.id;
  }
};

const offBoard = (_, event) => {
  if (animating) {
    return;
  }

  if (event.target && event.target.matches('.reset')) {
    event.stopPropagation();
    Game.reset();
    $(event.target).removeClass('picked');
    return;
  }

  if (event.target && (event.target.matches('.card') || event.target.matches('.pile')) && event.target.id) {
    event.stopPropagation();
    input.push(event.target.id);
    const oldTable = Utils.clone(table);
    [table, picked] = Engine.tick(table, 'x', ...input);
    input = picked ? [picked] : [];
    animating = true;
    Renderer.animate(oldTable, table, picked, touched, () => {
      table.moves = [];
      animating = false;
    });
  }
};

Game.reset = () => {
  table = Table.create();
  table = Table.deal(table, 'x');
  input = [];
  picked = undefined;
  touched = undefined;
  animating = false;
  Renderer.invalidate(table, picked, touched);
};

Game.play = () => {
  $('#board').click(onBoard, offBoard);

  Game.reset();
};

module.exports = Game;
