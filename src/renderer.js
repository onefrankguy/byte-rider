const $ = require('./jquery');
const Pile = require('./pile');
const Rules = require('./rules');

const renderStack = (stack, visible) => {
  let html = '';

  html += '<div class="stack">';
  stack.forEach((card) => {
    html += `<div id="${card}" class="card">`;
    if (visible) {
      html += card;
    }
    html += '</div>';
  });
  html += '</div>';

  return html;
};

const renderPile = (pile, visible) => Pile.unwrap(pile)
  .map((stack) => renderStack(stack, visible)).join('');

const Renderer = {};

Renderer.render = (table, picked) => {
  const visible = Rules.visible(table, 'x');

  $('#Hy').html(renderPile(table.y.hand, visible.includes('y')));
  $('#Py').html(renderPile(table.y.played, true));
  $('#Px').html(renderPile(table.x.played, true));
  $('#Hx').html(renderPile(table.x.hand, visible.includes('x')));
  $('#Sx').removeClass('picked');
  $('#Dx').removeClass('picked');
  $(`#${picked}`).addClass('picked');
};

Renderer.invalidate = (table, picked) => {
  requestAnimationFrame(() => Renderer.render(table, picked));
};

module.exports = Renderer;
