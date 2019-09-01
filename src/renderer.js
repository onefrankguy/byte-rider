const jQuery = require('./jquery');
const Rules = require('./rules');
const Utils = require('./utils');
const Table = require('./table');

const renderValue = (value) => (value >= 0 ? `${value}<sup>&boxbox;</sup>` : '');

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

const renderPile = (pile, visible, jacked, padding) => {
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

const renderDiscard = (pile) => pile.slice(0, 4).reverse().map((c) => renderCard(c, true, {})).join('');

const renderInfo = (picked) => {
  const info = Rules.info(picked);
  let html = '<p>';

  if (info.name) {
    html += `<strong>${info.name}</strong>`;
  }

  if (info.type) {
    html += ' &mdash; ';
    html += `<em>${info.type}</em>`;
  }

  if (info.value >= 0) {
    html += ' &mdash; ';
    html += renderValue(info.value);
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
    .html(renderPile(table.y.hand, visible.includes('y'), table.jacked, 6));
  $('Py').removeClass('playable').removeClass('picked')
    .html(renderPile(table.y.played, true, table.jacked, 10));
  $('Px').removeClass('playable').removeClass('picked')
    .html(renderPile(table.x.played, true, table.jacked, 10));
  $('Hx').removeClass('playable').removeClass('picked')
    .html(renderPile(table.x.hand, visible.includes('x'), table.jacked, 10));

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

Renderer.animate = (oldTable, newTable, picked, touched, complete) => {
  const newCopy = Utils.clone(newTable);
  const move = newCopy.moves.shift();
  if (!move) {
    Renderer.invalidate(newCopy, picked, touched, complete);
    return;
  }

  const [start, end] = move.split('-');
  const srect = $(start).offset();
  const erect = $(end).offset();
  const scard = start.startsWith('S') ? oldTable.stock[0] : start;
  const visible = !scard.startsWith('S');
  const dx = erect.left - srect.left;
  const dy = erect.top - srect.top;
  const length = Math.sqrt((dx * dx) + (dy * dy));
  const speed = (length / srect.width) / 4;

  $(scard).addClass('invisible');
  $('card').html(renderCard(scard, visible, oldTable.jacked));
  $('card').css('left', `${srect.left}px`);
  $('card').css('top', `${srect.top}px`);
  $('card').css('transition-duration', `${speed}s`);
  $('card').removeClass('hidden');

  requestAnimationFrame(() => {
    $('card').animate('sliding', () => {
      $('card').addClass('hidden');
      const oldCopy = Table.play(Utils.clone(oldTable), [move]);
      Renderer.invalidate(oldCopy, picked, touched, () => {
        Renderer.animate(oldCopy, newCopy, picked, touched, complete);
      });
    });
    $('card').css('left', `${erect.left}px`);
    $('card').css('top', `${erect.top}px`);
  });
};

Renderer.invalidate = (table, picked, touched, complete) => {
  requestAnimationFrame(() => {
    Renderer.render(table, picked, touched);
    if (complete) {
      complete();
    }
  });
};

module.exports = Renderer;
