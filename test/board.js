/* global test, expect */
const Board = require('../src/board');

test('Board#create creates an empty board', () => {
  const board = Board.create();

  expect(board.discard.length).toBe(0);
  expect(board.stock.length).toBe(52);
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

test('Board#scuttle discards both player\'s cards', () => {
  let oldBoard = Board.create();
  oldBoard = Board.draw(oldBoard, 'x');
  oldBoard = Board.draw(oldBoard, 'y');

  const newBoard = Board.scuttle(oldBoard, oldBoard.xHand[0], oldBoard.yHand[0]);

  expect(newBoard.xHand.length).toBe(0);
  expect(newBoard.yHand.length).toBe(0);
  expect(newBoard.discard).toEqual([oldBoard.yHand[0], oldBoard.xHand[0]]);
});

test('Board#jack transfers a player\'s card', () => {
  let oldBoard = Board.create();
  oldBoard = Board.draw(oldBoard, 'x');
  oldBoard = Board.draw(oldBoard, 'y');
  oldBoard = Board.play(oldBoard, oldBoard.yHand[0]);

  const newBoard = Board.jack(oldBoard, oldBoard.xHand[0], oldBoard.yTable[0]);

  expect(newBoard.xHand.length).toBe(0);
  expect(newBoard.yTable.length).toBe(0);
  expect(newBoard.xTable).toEqual([`${oldBoard.yTable[0]}-${oldBoard.xHand[0]}`]);
});
