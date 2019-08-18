const $ = require('./jquery');
const Rules = require('./rules2');
const Pile = require('./pile');

const renderStack = (stack) => {
  let html = '';

  html += '<div class="stack">';
  stack.forEach((card) => {
    html += '<div class="card">';
    html += card;
    html += '</div>';
  });
  html += '</div>';

  return html;
};

const renderPile = (pile) => Pile.unwrap(pile).map(renderStack).join('');

const Renderer = {};

Renderer.render = (table) => {
  $('#xHand').html(renderPile(table.x.hand));
  $('#yHand').html(renderPile(table.y.hand));
};

Renderer.invalidate = (table) => {
  requestAnimationFrame(() => Renderer.render(table));
};

module.exports = Renderer;
