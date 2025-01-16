export type TetrominoShape = (number | null)[][];
export declare const TETROMINOS: Record<string, TetrominoShape>;
export declare const getRandomTetromino: () => {
    shape: TetrominoShape;
    type: string;
};
