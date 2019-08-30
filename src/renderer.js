const jQuery = require('./jquery');
const Rules = require('./rules');

const renderValue = (value) => (value ? `${value}<sup>&boxbox;</sup>` : '');

const renderIcon = (card) => {
  const info = Rules.info(card);
  const [value] = (card || '').split('');
  let html = '';
  if (value) {
    html += `<div class="icon i${value}">`;
    if (info.value) {
      html += `<div class="value">${renderValue(info.value)}</div>`;
    }
    html += '</div>';
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

const renderPile = (pile, visible, jacked, padding = 10) => {
  let html = pile.map((c) => renderCard(c, visible, jacked)).join('');

  let blanks = padding - pile.length;
  while (blanks > 0) {
    html += '<div class="card invisible"></div>';
    blanks -= 1;
  }

  return html;
};

const $ = (id) => {
  if (id === 'Dx' || id === 'Dy' || id === 'Sx' || id === 'Sy') {
    return jQuery('#S');
  }
  return jQuery(`#${id}`);
};

const renderDiscard = (pile) => pile.slice(0, 5).reverse().map((c) => renderCard(c, true, {})).join('');

const renderInfo = (picked) => {
  const info = Rules.info(picked);
  let html = '<p>';

  if (info.name) {
    html += `<strong>${info.name}</strong>`;
  }

  if (info.value) {
    html += ' &mdash; ';
    html += renderValue(info.value);
  }

  if (info.type) {
    html += ' &mdash; ';
    html += `<em>${info.type}</em>`;
  }

  html += '</p>';

  if (info.effect) {
    html += `<p>${info.effect}</p>`;
  }

  return html;
};

const Renderer = {};

Renderer.render = (table, picked, touched) => {
  const visible = Rules.visible(table, 'x');

  $('S').removeClass('playable').removeClass('picked');
  $('discard').html(renderDiscard(table.discard));

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

  if (visible.includes('y') || !table.y.hand.includes(touched)) {
    $('info').html(renderInfo(touched));
  } else {
    $('info').html('');
  }
};

Renderer.invalidate = (table, picked, touched) => {
  requestAnimationFrame(() => Renderer.render(table, picked, touched));
};

module.exports = Renderer;
