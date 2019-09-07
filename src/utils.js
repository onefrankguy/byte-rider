const Utils = {};

Utils.clone = (value) => (value !== undefined ? JSON.parse(JSON.stringify(value)) : undefined);

Utils.shuffle = (array) => {
  const result = array.slice();

  let m = result.length;
  let t;
  let i;

  while (m > 0) {
    i = Math.floor(Math.random() * m);
    m -= 1;
    t = result[m];
    result[m] = result[i];
    result[i] = t;
  }

  return result;
};

Utils.pick = (array = []) => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

Utils.dedupe = (array = []) => array.filter((value, i, self) => self.indexOf(value) === i);

module.exports = Utils;
