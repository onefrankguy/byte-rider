const Pile = {};

const DELIMITER = ':';

Pile.includes = (pile, card) => pile.find((c) => c.indexOf(card) > -1) !== undefined;

Pile.remove = (pile, card) => pile.reduce((acc, s) => {
  const stack = s.split(DELIMITER).filter((c) => c !== card).join(DELIMITER);

  return stack ? acc.concat(stack) : acc;
}, []);

Pile.add = (pile, card, location) => {
  let added = false;

  const result = pile.reduce((acc, s) => {
    if (s.indexOf(location) > -1) {
      added = true;
      return acc.concat(s.split(DELIMITER).concat(card).join(DELIMITER));
    }

    return acc.concat(s);
  }, []);

  return added ? result : result.concat(card);
};

module.exports = Pile;
