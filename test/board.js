/* global test, expect */
const Board = require('../src/board');

test('Board#create creates an empty board', () => {
  const board = Board.create();

  expect(board.discard.length).toBe(0);
  expect(board.stock.length).toBe(52);
  expect(board.xCovers).toEqual({});
  expect(board.yCovers).toEqual({});
  expect(board.xHand.length).toBe(0);
  expect(board.yHand.length).toBe(0);
  expect(board.xTable.length).toBe(0);
  expect(board.yTable.length).toBe(0);
});

test('Board#draw puts the top card in the player\'s hand', () => {
  const oldBoard = Board.create();
  const newBoard = Board.draw(oldBoard, 'x');

  expect(newBoard.stock.length).toBe(oldBoard.stock.length - 1);
  expect(newBoard.xHand).toEqual([oldBoard.stock[0]]);
});

test('Board#discard puts the player\'s card in the discard', () => {
  const oldBoard = Board.draw(Board.create(), 'x');
  const newBoard = Board.discard(oldBoard, oldBoard.xHand[0]);

  expect(newBoard.xHand.length).toBe(0);
  expect(newBoard.discard).toEqual([oldBoard.xHand[0]]);
});

test('Board#play puts the player\'s card on the table', () => {
  const oldBoard = Board.draw(Board.create(), 'x');
  const newBoard = Board.play(oldBoard, oldBoard.xHand[0]);

  expect(newBoard.xHand.length).toBe(0);
  expect(newBoard.xTable).toEqual([oldBoard.xHand[0]]);
});

test('Board#transfer moves a card across the table', () => {
  let oldBoard = Board.create();
  oldBoard = Board.draw(oldBoard, 'x');
  oldBoard = Board.play(oldBoard, oldBoard.xHand[0]);

  const newBoard = Board.transfer(oldBoard, oldBoard.xTable[0]);

  expect(newBoard.xTable.length).toBe(0);
  expect(newBoard.yTable).toEqual([oldBoard.xTable[0]]);
});

test('Board#cover moves a card over another card', () => {
  let oldBoard = Board.create();
  oldBoard = Board.draw(oldBoard, 'x');
  oldBoard = Board.draw(oldBoard, 'y');
  oldBoard = Board.play(oldBoard, oldBoard.yHand[0]);

  const xCard = oldBoard.xHand[0];
  const yCard = oldBoard.yTable[0];

  const newBoard = Board.cover(oldBoard, xCard, yCard);
  const newCovers = {};
  newCovers[xCard] = yCard;

  expect(newBoard.xHand.length).toBe(0);
  expect(newBoard.yTable).toEqual([yCard, xCard]);
  expect(newBoard.yCovers).toEqual(newCovers);
});

test('Board#discard clears covered cards', () => {
  let oldBoard = Board.create();
  oldBoard = Board.draw(oldBoard, 'x');
  oldBoard = Board.draw(oldBoard, 'y');
  oldBoard = Board.play(oldBoard, oldBoard.yHand[0]);

  const xCard = oldBoard.xHand[0];
  const yCard = oldBoard.yTable[0];

  oldBoard = Board.cover(oldBoard, xCard, yCard);

  const newBoard = Board.discard(oldBoard, xCard);

  expect(newBoard.yTable).toEqual([yCard]);
  expect(newBoard.yCovers).toEqual({});
  expect(newBoard.discard).toEqual([xCard]);
});

test('Board#discard clears covered cards on bottom', () => {
  let oldBoard = Board.create();
  oldBoard = Board.draw(oldBoard, 'x');
  oldBoard = Board.draw(oldBoard, 'y');
  oldBoard = Board.play(oldBoard, oldBoard.yHand[0]);

  const xCard = oldBoard.xHand[0];
  const yCard = oldBoard.yTable[0];

  oldBoard = Board.cover(oldBoard, xCard, yCard);

  const newBoard = Board.discard(oldBoard, yCard);

  expect(newBoard.yTable).toEqual([]);
  expect(newBoard.yCovers).toEqual({});
  expect(newBoard.discard).toEqual([xCard, yCard]);
});

test('Board#transfer moves covered cards', () => {
  let oldBoard = Board.create();
  oldBoard = Board.draw(oldBoard, 'x');
  oldBoard = Board.draw(oldBoard, 'y');
  oldBoard = Board.play(oldBoard, oldBoard.yHand[0]);

  const xCard = oldBoard.xHand[0];
  const yCard = oldBoard.yTable[0];

  oldBoard = Board.cover(oldBoard, xCard, yCard);

  const newBoard = Board.transfer(oldBoard, xCard);
  const newCovers = {};
  newCovers[xCard] = yCard;

  expect(newBoard.xTable).toEqual([xCard, yCard]);
  expect(newBoard.xCovers).toEqual(newCovers);
});

test('Board#transfer moves double covered cards', () => {
  let oldBoard = Board.create();
  oldBoard = Board.draw(oldBoard, 'x');
  oldBoard = Board.draw(oldBoard, 'x');
  oldBoard = Board.draw(oldBoard, 'y');
  oldBoard = Board.play(oldBoard, oldBoard.yHand[0]);

  const [xCard1, xCard2] = oldBoard.xHand;
  const yCard = oldBoard.yTable[0];

  oldBoard = Board.cover(oldBoard, xCard1, yCard);
  oldBoard = Board.cover(oldBoard, xCard2, xCard1);

  const newBoard = Board.transfer(oldBoard, xCard2);
  const newCovers = {};
  newCovers[xCard1] = yCard;
  newCovers[xCard2] = xCard1;

  expect(newBoard.xTable).toEqual([xCard2, xCard1, yCard]);
  expect(newBoard.xCovers).toEqual(newCovers);
});
