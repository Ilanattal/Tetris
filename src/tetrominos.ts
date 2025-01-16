export type TetrominoShape = (number | null)[][];

export const TETROMINOS: Record<string, TetrominoShape> = {
  I: [
    [null, null, null, null],
    [1, 1, 1, 1],
  ],
  T: [
    [null, 1, null],
    [1, 1, 1],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  L: [
    [1, null],
    [1, null],
    [1, 1],
  ],
  Z: [
    [1, 1, null],
    [null, 1, 1],
  ],
};

export const getRandomTetromino = (): { shape: TetrominoShape; type: string } => {
  const tetrominoKeys = Object.keys(TETROMINOS);
  const randomType = tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];
  return { shape: TETROMINOS[randomType], type: randomType };
};