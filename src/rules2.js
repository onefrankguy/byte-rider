const Rules = {};

const ROYALS = ['8', 'J', 'Q', 'K'];
const NUMBERS = ['A', '2', '3', '4', '5', '6', '7', '9', 'T'];

Rules.isRoyal = (value) => !!ROYALS.find((v) => (value || '').startsWith(v));
Rules.isNumber = (value) => !!NUMBERS.find((v) => (value || '').startsWith(v));

module.exports = Rules;
