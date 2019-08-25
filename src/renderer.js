const jQuery = require('./jquery');
const Pile = require('./pile');
const Rules = require('./rules');

const renderStack = (stack, visible, jacked) => {
  let html = '';

  html += '<div class="stack">';
  stack.forEach((card) => {
    const jack = `jacked${(jacked[card] || []).length}`;
    html += `<div id="${card}" class="card ${jack}">`;
    if (visible) {
      html += card;
    }
    html += '</div>';
  });
  html += '</div>';

  return html;
};

const renderPile = (pile, visible, jacked) => Pile.unwrap(pile)
  .map((stack) => renderStack(stack, visible, jacked)).join('');

const $ = (id) => {
  if (id === 'Dy') {
    return jQuery('#Dx');
  }
  if (id === 'Sy') {
    return jQuery('#Sx');
  }
  return jQuery(`#${id}`);
};

const renderInfo = (picked) => {
  const info = Rules.info(picked);
  let html = '';

  if (info.name) {
    html += `<strong>${info.name}</strong>`;
  }

  if (info.effect) {
    html += ' &mdash; ';
    html += info.effect;
  }

  $('info').html(html);
};

const Renderer = {};

Renderer.render = (table, picked) => {
  const visible = Rules.visible(table, 'x');

  $('Sx').removeClass('playable').removeClass('picked');
  $('Dx').removeClass('playable').removeClass('picked')
    .html(table.discard[0] || 'D');

  $('Hy').removeClass('playable').removeClass('picked')
    .html(renderPile(table.y.hand, visible.includes('y'), table.jacked));
  $('Py').removeClass('playable').removeClass('picked')
    .html(renderPile(table.y.played, true, table.jacked));
  $('Px').removeClass('playable').removeClass('picked')
    .html(renderPile(table.x.played, true, table.jacked));
  $('Hx').removeClass('playable').removeClass('picked')
    .html(renderPile(table.x.hand, visible.includes('x'), table.jacked));

  if (picked) {
    $(picked).addClass('picked');
    Rules.playable(table, 'x', picked).forEach((c) => $(c).addClass('playable'));
  } else {
    Rules.pickable(table, 'x').forEach((c) => $(c).addClass('playable'));
  }

  renderInfo(picked);
};

Renderer.invalidate = (table, picked) => {
  requestAnimationFrame(() => Renderer.render(table, picked));
};

module.exports = Renderer;
