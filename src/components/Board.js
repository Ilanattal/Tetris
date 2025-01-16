import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import Block from "./Block";
import { getRandomTetromino } from "../tetrominos";
const ROWS = 20;
const COLS = 10;
const GRAVITY_LEVELS = [
    { scoreThreshold: 0, interval: 500 },
    { scoreThreshold: 1000, interval: 400 },
    { scoreThreshold: 2000, interval: 300 },
    { scoreThreshold: 3000, interval: 200 },
];
const Board = () => {
    const [grid, setGrid] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    const [isPaused, setIsPaused] = useState(false);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(() => {
        const savedBestScore = localStorage.getItem("bestScore");
        return savedBestScore ? parseInt(savedBestScore, 10) : 0;
    });
    const [activeTetromino, setActiveTetromino] = useState(getRandomTetromino());
    const [nextTetromino, setNextTetromino] = useState(getRandomTetromino());
    const [position, setPosition] = useState({
        row: 0,
        col: Math.floor((COLS - 4) / 2),
    });
    const [isGameOver, setIsGameOver] = useState(false);
    const rotateTetromino = (shape) => {
        return shape[0].map((_, colIndex) => shape.map((row) => row[colIndex]).reverse());
    };
    const resetGame = () => {
        setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(null))); // Réinitialise la grille
        setScore(0); // Réinitialise le score
        setIsPaused(false); // Débloque le jeu
        setActiveTetromino(getRandomTetromino()); // Génère une nouvelle pièce
        setNextTetromino(getRandomTetromino()); // Génère la prochaine pièce
        setPosition({
            row: 0,
            col: Math.floor((COLS - 4) / 2),
        }); // Réinitialise la position
        setIsGameOver(false); // Réinitialise l'état de fin de jeu
    };
    const isValidMove = (shape, row, col) => {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] !== null) {
                    const newRow = row + r;
                    const newCol = col + c;
                    if (newRow >= ROWS || // En dehors du bas
                        newCol < 0 || // En dehors à gauche
                        newCol >= COLS || // En dehors à droite
                        (newRow >= 0 && grid[newRow][newCol] !== null) // Collision
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    const getGravityInterval = () => {
        for (let i = GRAVITY_LEVELS.length - 1; i >= 0; i--) {
            if (score >= GRAVITY_LEVELS[i].scoreThreshold) {
                return GRAVITY_LEVELS[i].interval;
            }
        }
        return GRAVITY_LEVELS[0].interval;
    };
    // Gère la gravité des pièces
    useEffect(() => {
        if (isGameOver || isPaused)
            return;
        const interval = setInterval(() => {
            setPosition((prev) => {
                const nextRow = prev.row + 1;
                if (!isValidMove(activeTetromino.shape, nextRow, prev.col)) {
                    handleTetrominoFixation(prev);
                    return prev;
                }
                return { ...prev, row: nextRow };
            });
        }, getGravityInterval());
        return () => clearInterval(interval);
    }, [activeTetromino, grid, isGameOver, isPaused, score]);
    // Gère les touches de contrôle
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (isGameOver || isPaused)
                return;
            if (event.key === "ArrowLeft") {
                moveTetromino("left");
            }
            else if (event.key === "ArrowRight") {
                moveTetromino("right");
            }
            else if (event.key === "ArrowDown") {
                moveTetromino("down");
            }
            else if (event.key === " ") {
                rotateActiveTetromino();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isGameOver, activeTetromino, position, isPaused]);
    const moveTetromino = (direction) => {
        setPosition((prev) => {
            let newRow = prev.row;
            let newCol = prev.col;
            if (direction === "left" && isValidMove(activeTetromino.shape, newRow, newCol - 1)) {
                newCol -= 1;
            }
            else if (direction === "right" && isValidMove(activeTetromino.shape, newRow, newCol + 1)) {
                newCol += 1;
            }
            else if (direction === "down" && isValidMove(activeTetromino.shape, newRow + 1, newCol)) {
                newRow += 1;
            }
            return { row: newRow, col: newCol };
        });
    };
    const rotateActiveTetromino = () => {
        const rotatedShape = rotateTetromino(activeTetromino.shape);
        if (isValidMove(rotatedShape, position.row, position.col)) {
            setActiveTetromino((prev) => ({
                ...prev,
                shape: rotatedShape,
            }));
        }
    };
    const handleTetrominoFixation = (fixationPosition) => {
        const tempGrid = grid.map((row) => [...row]);
        activeTetromino.shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell !== null) {
                    const newRow = fixationPosition.row + rowIndex;
                    const newCol = fixationPosition.col + colIndex;
                    if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                        tempGrid[newRow][newCol] = activeTetromino.type;
                    }
                }
            });
        });
        const { grid: updatedGrid, clearedLines } = clearCompleteLines(tempGrid);
        setGrid(updatedGrid); // Met à jour la grille
        if (clearedLines > 0) {
            const scoreMap = { 1: 100, 2: 300, 3: 500, 4: 800 };
            setScore((prevScore) => {
                const newScore = prevScore + (scoreMap[clearedLines] || 0);
                if (newScore > bestScore) {
                    setBestScore(newScore);
                    localStorage.setItem("bestScore", newScore.toString());
                }
                return newScore;
            });
        }
        spawnNewTetromino(); // Fait apparaître une nouvelle pièce
    };
    const clearCompleteLines = (currentGrid) => {
        const incompleteRows = currentGrid.filter((row) => row.some((cell) => cell === null));
        const clearedLines = ROWS - incompleteRows.length;
        if (clearedLines === 0) {
            return { grid: currentGrid, clearedLines: 0 };
        }
        const emptyRows = Array.from({ length: clearedLines }, () => Array(COLS).fill(null));
        const newGrid = [...emptyRows, ...incompleteRows];
        return { grid: newGrid, clearedLines };
    };
    const spawnNewTetromino = () => {
        const newTetromino = nextTetromino;
        const initialPosition = {
            row: 0,
            col: Math.floor((COLS - newTetromino.shape[0].length) / 2),
        };
        if (!isValidMove(newTetromino.shape, initialPosition.row, initialPosition.col)) {
            setIsGameOver(true);
            return;
        }
        setActiveTetromino(newTetromino);
        setNextTetromino(getRandomTetromino());
        setPosition(initialPosition);
    };
    const getPreviewGrid = (shape) => {
        const grid = Array.from({ length: 4 }, () => Array(4).fill(null));
        const startRow = Math.floor((4 - shape.length) / 2);
        const startCol = Math.floor((4 - shape[0].length) / 2);
        shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell !== null) {
                    grid[startRow + rowIndex][startCol + colIndex] = cell;
                }
            });
        });
        return grid;
    };
    const getGridWithTetromino = () => {
        const tempGrid = grid.map((row) => [...row]);
        activeTetromino.shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell !== null) {
                    const newRow = position.row + rowIndex;
                    const newCol = position.col + colIndex;
                    if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                        tempGrid[newRow][newCol] = activeTetromino.type;
                    }
                }
            });
        });
        return tempGrid;
    };
    const getColorByType = (type) => {
        const colors = {
            I: "cyan",
            T: "purple",
            O: "yellow",
            L: "orange",
            Z: "red",
        };
        return colors[type] || "#444";
    };
    return (_jsxs("div", { className: "game-container", children: [_jsx("div", { className: "board", children: isGameOver ? (_jsx("div", { className: "game-over", children: "Game Over" })) : (getGridWithTetromino().map((row, rowIndex) => (_jsx("div", { className: "row", children: row.map((cell, colIndex) => (_jsx(Block, { color: cell }, colIndex))) }, rowIndex)))) }), _jsxs("div", { className: "sidebar", children: [_jsxs("div", { className: "next-piece", children: [_jsx("h3", { children: "Prochaine pi\u00E8ce" }), _jsx("div", { className: "preview-grid", children: getPreviewGrid(nextTetromino.shape).map((row, rowIndex) => (_jsx("div", { className: "preview-row", children: row.map((cell, colIndex) => (_jsx("div", { className: `preview-block ${cell ? "active" : ""}`, style: {
                                            backgroundColor: cell ? getColorByType(nextTetromino.type) : "transparent",
                                        } }, colIndex))) }, rowIndex))) })] }), _jsxs("div", { className: "score-container", children: ["Score : ", _jsx("span", { children: score })] }), _jsxs("div", { className: "score-container", children: ["Best Score : ", _jsx("span", { children: bestScore })] }), _jsx("div", { className: "controls", children: _jsx("button", { onClick: () => setIsPaused((prev) => !prev), children: isPaused ? "Reprendre" : "Pause" }) }), _jsx("button", { onClick: resetGame, children: "Rejouer" })] })] }));
};
export default Board;
