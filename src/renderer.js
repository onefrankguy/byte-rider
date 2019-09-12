const jQuery = require('./jquery');
const Rules = require('./rules');
const Utils = require('./utils');
const Table = require('./table');

const renderValue = (value) => (value >= 0 ? `${value}<sup>&boxbox;</sup>` : '');
const renderJacked = (value) => (value > 0 ? `${value}<sup class="iJ">${value}</sup>` : '');
const isJack = (card) => (card || '').startsWith('J');
const isStock = (value) => ['Dx', 'Dy', 'Sx', 'Sy'].includes(value);

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

const renderCard = (card, visible, stacked, owner) => {
  const jacks = (stacked[card] || []).filter(isJack).length;
  let html = `<div id="${card}" class="card ${owner}">`;
  if (visible) {
    html += renderIcon(card, jacks);
  }
  html += '</div>';
  return html;
};

const renderPile = (pile, visible, stacked, padding, id) => {
  const owner = (id || '').split('')[1];
  let html = pile.slice(-padding).map((c) => renderCard(c, visible, stacked, owner)).join('');

  let blanks = 0;
  while (blanks < padding - pile.length) {
    html += `<div id="${id}${blanks}" class="card ${owner} invisible"></div>`;
    blanks += 1;
  }

  return html;
};

const animationId = (table, id) => {
  if (isStock(id)) {
    return 'S';
  }

  if (id === 'Hy' && table.y.hand.length >= 6) {
    return 'Hy';
  }

  if (id === 'Px' || id === 'Py' || id === 'Hx' || id === 'Hy') {
    return `${id}0`;
  }

  const stacked = Object.keys(table.stacked).find((key) => table.stacked[key].includes(id));
  if (stacked) {
    return stacked;
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

const renderCardInfo = (picked) => {
  const info = Rules.info(picked);
  let html = '<p>';

  if (info.name) {
    const [value] = picked.split('');
    html += `<span class="icon i${value}"></span>`;
    html += `<strong>${info.name}</strong>`;
  }

  html += '</p>';

  if (info.play) {
    const value = info.play.replace('{value}', renderValue(info.value));
    html += `<p><span class="inline iPlay" title="Play"></span> ${value}</p>`;
  }

  if (info.effect) {
    html += `<p><span class="inline iBurn" title="Discard"></span> ${info.effect}</p>`;
  }

  return html;
};

const renderStory = (table, player) => {
  let html = '';

  const cards = Utils.dedupe(table[player].hand.map((c) => Rules.info(c).name))
    .slice(0, 2)
    .map((c) => `<strong>${c}</strong>`)
    .join(', ');

  html += '<p>';
  html += `You need ${renderValue(21)} points to win.`;
  html += ' You&rsquo;ve got ';
  html += cards;
  html += ' and a handful of other cards.';
  html += ' Pick one. Play one.';
  html += ' It&rsquo;s time to ride.';
  html += '</p>';

  return html;
};

const renderWinner = (table, player, winner) => {
  let html = '';

  html += '<p class="ninetyfive fg">Byte Rider</p>';
  html += '<p>';
  html += player === winner ? ' You win' : ' The AI wins';
  html += ` with ${renderValue(Rules.score(table, winner))} points.`;
  html += ' Will you ride again?';
  html += '</p>';

  return html;
};

const renderInfo = (table, player, touched) => {
  const opponent = Table.opponent(player);
  if (!table || !player || !opponent) {
    return '';
  }

  if (touched === 'story') {
    return renderStory(table, player);
  }

  const winner = Rules.winner(table);
  if (winner) {
    return renderWinner(table, player, winner);
  }

  if (Rules.visible(table, player).includes(opponent) || !table[opponent].hand.includes(touched)) {
    return renderCardInfo(touched);
  }

  return '';
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

  $('S')
    .removeClass('hidden')
    .removeClass('x')
    .removeClass('iDraw')
    .removeClass('iBurn');

  $('reset').addClass('hidden');
};

Renderer.render = (table, picked, touched) => {
  Renderer.clear(table);

  const visible = Rules.visible(table, 'x');

  $('discard').html(renderDiscard(table.discard));

  $('Hy').html(renderPile(table.y.hand, visible.includes('y'), table.stacked, 6, 'Hy'));
  $('Py').html(renderPile(table.y.played, true, table.stacked, 10, 'Py'));
  $('Px').html(renderPile(table.x.played, true, table.stacked, 10, 'Px'));
  $('Hx').html(renderPile(table.x.hand, visible.includes('x'), table.stacked, 10, 'Hx'));

  if (picked !== 'animate') {
    const pickable = Rules.pickable(table, 'x');
    if (pickable.filter(isStock).length > 0) {
      $('S').addClass('x').addClass('iDraw');
    }

    if (table.x.allowed.length > 0) {
      pickable.forEach((c) => $(c).addClass('pickable'));
    }

    if (picked) {
      const playable = Rules.playable(table, 'x', picked);
      if (playable.filter(isStock).length > 0) {
        $('S').addClass('iBurn');
      }
      playable.forEach((c) => $(c).addClass('playable'));
      $(picked).addClass('picked');
    }

    const winner = Rules.winner(table);
    if (winner) {
      $('S').addClass('hidden');
      $('reset').removeClass('hidden');
    }
  }

  if (touched === 'story') {
    $('logo').removeClass('faded');
  } else {
    $('logo').addClass('faded');
  }

  $('info').html(renderInfo(table, 'x', touched));
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
  $('card').html(renderCard(card, visible, oldCopy.stacked, owner));
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
