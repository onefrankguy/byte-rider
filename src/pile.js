const Pile = {};

const DELIMITER = ':';

Pile.unwrap = (pile) => (pile || []).map((s) => s.split(DELIMITER));

Pile.includes = (pile, card) => (pile || []).find((c) => c.indexOf(card) > -1) !== undefined;

Pile.remove = (pile, card) => (pile || []).reduce((acc, s) => {
  let found = false;
  const stack = s.split(DELIMITER).filter((c) => {
    if (c === card) {
      found = true;
    }

    return !found;
  }).join(DELIMITER);

  return s !== card && stack ? acc.concat(stack) : acc;
}, []);

Pile.add = (pile, card, location) => {
  let added = false;

  let result = (pile || []).reduce((acc, s) => {
    if (card && s.indexOf(location) > -1) {
      added = true;
      return acc.concat(s.split(DELIMITER).concat(card).join(DELIMITER));
    }

    return acc.concat(s);
  }, []);

  if (card && !added) {
    result = result.concat(card);
  }

  return result;
};

module.exports = Pile;
