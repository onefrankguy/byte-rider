const jQuery = require('./jquery');
const Pile = require('./pile');
const Rules = require('./rules');

const renderIcon = (card) => {
  const [value] = (card || '').split('');
  let html = '';
  if (value) {
    html += `<div class="icon i${value}"></div>`;
  }
  return html;
};

const renderCard = (card, visible, jacked) => {
  const jack = `jacked${(jacked[card] || []).length}`;
  let html = `<div id="${card}" class="card ${jack}">`;
  if (visible) {
    html += renderIcon(card);
  }
  html += '</div>';
  return html;
};

const renderStack = (stack, visible, jacked) => stack.map((c) => renderCard(c, visible, jacked)).join('');

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
  $('Dx').removeClass('playable').removeClass('picked');

  if (table.discard[0]) {
    $('Dx').removeClass('trash').html(renderIcon(table.discard[0]));
  } else {
    $('Dx').addClass('trash').html('');
  }

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
