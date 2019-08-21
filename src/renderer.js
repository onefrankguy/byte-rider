const $ = require('./jquery');
const Pile = require('./pile');

const renderStack = (stack) => {
  let html = '';

  html += '<div class="stack">';
  stack.forEach((card) => {
    html += `<div id="${card}" class="card">`;
    html += card;
    html += '</div>';
  });
  html += '</div>';

  return html;
};

const renderPile = (pile) => Pile.unwrap(pile).map(renderStack).join('');

const Renderer = {};

Renderer.render = (table) => {
  $('#Hy').html(renderPile(table.y.hand));
  $('#Py').html(renderPile(table.y.played));
  $('#Px').html(renderPile(table.x.played));
  $('#Hx').html(renderPile(table.x.hand));
};

Renderer.invalidate = (table) => {
  requestAnimationFrame(() => Renderer.render(table));
};

module.exports = Renderer;
