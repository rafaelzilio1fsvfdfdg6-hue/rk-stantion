import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const TILE_SIZE = 20; // in pixels

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GridRunnerGame: React.FC = () => {
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 15 });
    const [direction, setDirection] = useState<Direction>('RIGHT');
    const [speed, setSpeed] = useState<number | null>(200);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    
    const directionRef = useRef(direction);
    directionRef.current = direction;

    const createFood = () => {
        let newFoodPosition;
        do {
            newFoodPosition = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
        } while (snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
        setFood(newFoodPosition);
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const keyMap: { [key: string]: Direction } = {
            ArrowUp: 'UP', w: 'UP',
            ArrowDown: 'DOWN', s: 'DOWN',
            ArrowLeft: 'LEFT', a: 'LEFT',
            ArrowRight: 'RIGHT', d: 'RIGHT',
        };
        const newDirection = keyMap[e.key];
        if (newDirection) {
            e.preventDefault();
            const currentDir = directionRef.current;
            if (
                (newDirection === 'UP' && currentDir !== 'DOWN') ||
                (newDirection === 'DOWN' && currentDir !== 'UP') ||
                (newDirection === 'LEFT' && currentDir !== 'RIGHT') ||
                (newDirection === 'RIGHT' && currentDir !== 'LEFT')
            ) {
                setDirection(newDirection);
            }
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const runGame = () => {
        if (isGameOver) return;

        setSnake(prevSnake => {
            const newSnake = [...prevSnake];
            const head = { ...newSnake[0] };

            switch (direction) {
                case 'UP': head.y -= 1; break;
                case 'DOWN': head.y += 1; break;
                case 'LEFT': head.x -= 1; break;
                case 'RIGHT': head.x += 1; break;
            }
            
            // Wall collision
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                setIsGameOver(true);
                return prevSnake;
            }
            // Self collision
            for (let i = 1; i < newSnake.length; i++) {
                if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
                    setIsGameOver(true);
                    return prevSnake;
                }
            }
            
            newSnake.unshift(head);

            // Food collision
            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                createFood();
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    };
    
    useEffect(() => {
        if (!isGameOver) {
            const gameInterval = setInterval(runGame, speed ?? 1000);
            return () => clearInterval(gameInterval);
        }
    }, [snake, isGameOver, speed]);
    
    const resetGame = () => {
        setIsGameOver(false);
        setSnake([{ x: 10, y: 10 }]);
        setFood({ x: 15, y: 15 });
        setDirection('RIGHT');
        setScore(0);
    };

    return (
        <div className="h-full flex flex-col justify-center items-center bg-black/90 text-cyan-300 font-sans p-4">
             <div className="w-full flex justify-between items-center px-4 mb-4 max-w-[400px]">
                <h2 className="text-xl font-orbitron text-[var(--accent-color)]">GRID-RUNNER</h2>
                <div className="text-lg font-bold text-white">Score: {score}</div>
             </div>
            <div
                className="bg-black/80 border-2 border-[var(--accent-color)] shadow-[0_0_20px_rgba(var(--accent-color-rgb),0.5)] relative"
                style={{ width: GRID_SIZE * TILE_SIZE, height: GRID_SIZE * TILE_SIZE }}
            >
                {snake.map((segment, index) => (
                    <div
                        key={index}
                        className="absolute bg-cyan-400"
                        style={{
                            left: segment.x * TILE_SIZE,
                            top: segment.y * TILE_SIZE,
                            width: TILE_SIZE,
                            height: TILE_SIZE,
                            boxShadow: '0 0 10px #00f0ff',
                            opacity: 1 - (index / (snake.length + 5))
                        }}
                    />
                ))}
                <div
                    className="absolute bg-red-500 rounded-full"
                    style={{
                        left: food.x * TILE_SIZE,
                        top: food.y * TILE_SIZE,
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        boxShadow: '0 0 10px #ff0000',
                    }}
                />
                 {isGameOver && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col justify-center items-center text-center animate-scale-in">
                        <h3 className="text-4xl font-orbitron text-red-500">GAME OVER</h3>
                        <p className="text-white mt-2">Seu score final: {score}</p>
                        <button onClick={resetGame} className="mt-4 px-6 py-2 bg-[var(--accent-color)] text-black font-bold rounded-md hover:brightness-110">
                            Jogar Novamente
                        </button>
                    </div>
                )}
            </div>
             <p className="text-xs text-gray-500 mt-4">Use as setas ou WASD para mover.</p>
        </div>
    );
};

export default GridRunnerGame;
