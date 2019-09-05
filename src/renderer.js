const jQuery = require('./jquery');
const Rules = require('./rules');
const Utils = require('./utils');
const Table = require('./table');

const renderValue = (value) => (value >= 0 ? `${value}<sup>&boxbox;</sup>` : '');
const renderJacked = (value) => (value > 0 ? `${value}<sup class="iJ">${value}</sup>` : '');

const renderIcon = (card, jacks) => {
  const info = Rules.info(card);
  const [value] = (card || '').split('');
  let html = '';
  if (value) {
    html += `<div class="icon i${value}">`;
    if (info.value) {
      html += `<div class="value">${renderValue(info.value)}</div>`;
    }
    if (jacks) {
      html += `<div class="jacked">${renderJacked(jacks)}</div>`;
    }
    html += '</div>';
  }
  return html;
};

const renderCard = (card, visible, jacked, owner) => {
  const jacks = (jacked[card] || []).length;
  let html = `<div id="${card}" class="card ${owner}">`;
  if (visible) {
    html += renderIcon(card, jacks);
  }
  html += '</div>';
  return html;
};

const renderPile = (pile, visible, jacked, padding, id) => {
  const owner = (id || '').split('')[1];
  let html = pile.slice(0, padding).map((c) => renderCard(c, visible, jacked, owner)).join('');

  let blanks = 0;
  while (blanks < padding - pile.length) {
    html += `<div id="${id}${blanks}" class="card ${owner} invisible"></div>`;
    blanks += 1;
  }

  return html;
};

const animationId = (table, id) => {
  if (id === 'Dx' || id === 'Dy' || id === 'Sx' || id === 'Sy') {
    return 'S';
  }

  if (id === 'Hy' && table.y.hand.length >= 6) {
    return 'Hy';
  }

  if (id === 'Px' || id === 'Py' || id === 'Hx' || id === 'Hy') {
    return `${id}0`;
  }

  return id;
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
    const [value] = picked.split('');
    html += `<span class="icon i${value}"></span>`;
    html += `<strong>${info.name}</strong>`;
  }

  if (info.type) {
    html += ' &mdash; ';
    html += `<em>${info.type}</em>`;
  }

  html += '</p>';

  if (info.play) {
    html += `<p>&rdsh; ${info.play.replace('{value}', renderValue(info.value))}</p>`;
  }

  if (info.effect) {
    html += `<p><span class="inline iS"></span> ${info.effect}</p>`;
  }

  return html;
};

const Renderer = {};

Renderer.clear = (table) => {
  const ids = ['S', 'Hx', 'Hy', 'Px', 'Py']
    .concat(table.x.hand)
    .concat(table.x.played)
    .concat(table.y.hand)
    .concat(table.y.played);

  ids.forEach((id) => $(id)
    .removeClass('pickable')
    .removeClass('playable')
    .removeClass('picked'));
};

Renderer.render = (table, picked, touched) => {
  Renderer.clear(table);

  const visible = Rules.visible(table, 'x');

  $('discard').html(renderDiscard(table.discard));

  $('Hy').html(renderPile(table.y.hand, visible.includes('y'), table.jacked, 6, 'Hy'));
  $('Py').html(renderPile(table.y.played, true, table.jacked, 10, 'Py'));
  $('Px').html(renderPile(table.x.played, true, table.jacked, 10, 'Px'));
  $('Hx').html(renderPile(table.x.hand, visible.includes('x'), table.jacked, 10, 'Hx'));

  if (picked !== 'animate') {
    Rules.pickable(table, 'x').forEach((c) => $(c).addClass('pickable'));
    if (picked) {
      Rules.playable(table, 'x', picked).forEach((c) => $(c).addClass('playable'));
      $(picked).addClass('picked');
    }
  }

  if (visible.includes('y') || !table.y.hand.includes(touched)) {
    $('info').html(renderInfo(touched));
  } else {
    $('info').html('');
  }
};

Renderer.animate = (oldTable, newTable, picked, touched, complete) => {
  let oldCopy = Utils.clone(oldTable);
  const newCopy = Utils.clone(newTable);
  const move = newCopy.moves.shift();
  if (!move) {
    Renderer.invalidate(newCopy, picked, touched, complete);
    return;
  }

  const [start, end] = move.split('-');
  const srect = $(animationId(oldCopy, start)).offset();
  const erect = $(animationId(oldCopy, end)).offset();
  const card = start.startsWith('S') ? oldCopy.stock[0] : start;
  const visible = start !== 'Sy';
  const dx = erect.left - srect.left;
  const dy = erect.top - srect.top;
  const length = Math.sqrt((dx * dx) + (dy * dy));
  const speed = (length / srect.width) / 4;
  const owner = Table.player(oldCopy, card);

  $(card).addClass('invisible');
  $('card').html(renderCard(card, visible, oldCopy.jacked, owner));
  $('card').css('left', `${srect.left}px`);
  $('card').css('top', `${srect.top}px`);
  $('card').css('transition-duration', `${speed}s`);
  $('card').removeClass('hidden');

  requestAnimationFrame(() => {
    Renderer.clear(oldTable);

    $('card').animate('sliding', () => {
      $('card').addClass('hidden');
      oldCopy = Table.play(oldCopy, [move]);
      Renderer.invalidate(oldCopy, 'animate', touched, () => {
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
