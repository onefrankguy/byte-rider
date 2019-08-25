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

  $('#Sx').removeClass('playable').removeClass('picked');
  $('#Dx').removeClass('playable').removeClass('picked');

  $('#Hy').removeClass('playable').removeClass('picked')
    .html(renderPile(table.y.hand, visible.includes('y')));
  $('#Py').removeClass('playable').removeClass('picked')
    .html(renderPile(table.y.played, true));
  $('#Px').removeClass('playable').removeClass('picked')
    .html(renderPile(table.x.played, true));
  $('#Hx').removeClass('playable').removeClass('picked')
    .html(renderPile(table.x.hand, visible.includes('x')));

  if (picked) {
    $(`#${picked}`).addClass('picked');
    Rules.playable(table, picked).forEach((c) => $(`#${c}`).addClass('playable'));
  } else {
    Rules.pickable(table, 'x').forEach((c) => $(`#${c}`).addClass('playable'));
  }
};

Renderer.invalidate = (table, picked) => {
  requestAnimationFrame(() => Renderer.render(table, picked));
};

module.exports = Renderer;
