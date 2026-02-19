"use client";

import { useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/lib/language';

type CellType =
    | 'empty' | 'water' | 'plant' | 'tree' | 'fruit' | 'flower' | 'mushroom'
    | 'insect' | 'fish' | 'bird' | 'herbivore' | 'carnivore' | 'human';

interface Cell {
    type: CellType;
    energy: number;
    age: number;
}

const GRID_SIZE = 50;
const TICK_MS = 180;

const CELL_COLORS: Record<CellType, string> = {
    empty: 'transparent',
    water: '#3b82f6',
    plant: '#22c55e',
    tree: '#15803d',
    fruit: '#f97316',
    flower: '#ec4899',
    mushroom: '#a855f7',
    insect: '#a3e635',
    fish: '#06b6d4',
    bird: '#38bdf8',
    herbivore: '#facc15',
    carnivore: '#ef4444',
    human: '#f59e0b',
};

const CELL_EMOJI: Record<CellType, string> = {
    empty: '',
    water: '💧',
    plant: '🌿',
    tree: '🌳',
    fruit: '🍎',
    flower: '🌸',
    mushroom: '🍄',
    insect: '🐛',
    fish: '🐟',
    bird: '🐦',
    herbivore: '🐰',
    carnivore: '🦊',
    human: '🧑',
};

const INITIAL_ENERGY: Record<CellType, number> = {
    empty: 0, water: 0, plant: 5, tree: 20, fruit: 4, flower: 4, mushroom: 3,
    insect: 6, fish: 8, bird: 10, herbivore: 8, carnivore: 10, human: 15,
};

function createEmptyGrid(): Cell[][] {
    return Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => ({ type: 'empty' as CellType, energy: 0, age: 0 }))
    );
}

function getNeighbors(grid: Cell[][], r: number, c: number): { cell: Cell; r: number; c: number }[] {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    const result: { cell: Cell; r: number; c: number }[] = [];
    for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            result.push({ cell: grid[nr][nc], r: nr, c: nc });
        }
    }
    return result;
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function simulateStep(grid: Cell[][]): Cell[][] {
    const next: Cell[][] = grid.map(row => row.map(cell => ({ ...cell, age: cell.age + 1 })));

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = grid[r][c];
            const neighbors = getNeighbors(grid, r, c);
            const emptyN = neighbors.filter(n => n.cell.type === 'empty');
            const waterNearby = neighbors.some(n => n.cell.type === 'water');

            switch (cell.type) {
                case 'plant': {
                    if (waterNearby && Math.random() < 0.12) {
                        if (emptyN.length > 0) {
                            const t = pick(emptyN);
                            next[t.r][t.c] = { type: 'plant', energy: 5, age: 0 };
                        }
                    }
                    // Mature plants become trees
                    if (cell.age > 15 && waterNearby && Math.random() < 0.04) {
                        next[r][c] = { type: 'tree', energy: 20, age: 0 };
                    }
                    // Plants can sprout flowers near other plants
                    if (Math.random() < 0.03) {
                        const plantN = neighbors.filter(n => n.cell.type === 'plant');
                        if (plantN.length >= 2 && emptyN.length > 0) {
                            const t = pick(emptyN);
                            next[t.r][t.c] = { type: 'flower', energy: 4, age: 0 };
                        }
                    }
                    if (!waterNearby && Math.random() < 0.05) {
                        next[r][c] = { type: 'empty', energy: 0, age: 0 };
                    }
                    break;
                }

                case 'tree': {
                    // Trees drop fruit
                    if (cell.age > 5 && Math.random() < 0.08) {
                        if (emptyN.length > 0) {
                            const t = pick(emptyN);
                            next[t.r][t.c] = { type: 'fruit', energy: 4, age: 0 };
                        }
                    }
                    // Trees spread plants nearby
                    if (Math.random() < 0.06 && emptyN.length > 0) {
                        const t = pick(emptyN);
                        next[t.r][t.c] = { type: 'plant', energy: 5, age: 0 };
                    }
                    // Trees die without water eventually
                    if (!waterNearby && Math.random() < 0.02) {
                        next[r][c] = { type: 'empty', energy: 0, age: 0 };
                    }
                    // Old trees die and become mushrooms
                    if (cell.age > 60 && Math.random() < 0.05) {
                        next[r][c] = { type: 'mushroom', energy: 3, age: 0 };
                    }
                    break;
                }

                case 'fruit': {
                    // Fruit rots after a while, becomes mushroom
                    if (cell.age > 12 && Math.random() < 0.15) {
                        next[r][c] = { type: 'mushroom', energy: 3, age: 0 };
                    }
                    // Fruit on ground can sprout a plant
                    if (cell.age > 8 && waterNearby && Math.random() < 0.05) {
                        next[r][c] = { type: 'plant', energy: 5, age: 0 };
                    }
                    break;
                }

                case 'flower': {
                    // Flowers attract insects
                    if (Math.random() < 0.04 && emptyN.length > 0) {
                        const insectN = neighbors.filter(n => n.cell.type === 'insect');
                        if (insectN.length === 0 && Math.random() < 0.06) {
                            const t = pick(emptyN);
                            next[t.r][t.c] = { type: 'insect', energy: 6, age: 0 };
                        }
                    }
                    // Flowers wilt without water
                    if (!waterNearby && Math.random() < 0.08) {
                        next[r][c] = { type: 'empty', energy: 0, age: 0 };
                    }
                    // Flowers spread near water
                    if (waterNearby && Math.random() < 0.05 && emptyN.length > 0) {
                        const t = pick(emptyN);
                        next[t.r][t.c] = { type: 'flower', energy: 4, age: 0 };
                    }
                    break;
                }

                case 'mushroom': {
                    // Mushrooms spread slowly in dark/moist areas
                    if (waterNearby && Math.random() < 0.06 && emptyN.length > 0) {
                        const t = pick(emptyN);
                        next[t.r][t.c] = { type: 'mushroom', energy: 3, age: 0 };
                    }
                    // Mushrooms decompose
                    if (cell.age > 20 && Math.random() < 0.1) {
                        next[r][c] = { type: 'empty', energy: 0, age: 0 };
                    }
                    break;
                }

                case 'insect': {
                    const flowerN = neighbors.filter(n => n.cell.type === 'flower');
                    const plantNI = neighbors.filter(n => n.cell.type === 'plant');

                    // Eat flowers/plants for energy
                    if (flowerN.length > 0 && Math.random() < 0.3) {
                        const food = pick(flowerN);
                        next[r][c].energy = Math.min(cell.energy + 2, 12);
                        // Pollinate: flower stays but insect gains energy
                        if (Math.random() < 0.5) {
                            // Sometimes consume the flower
                            next[food.r][food.c] = { type: 'empty', energy: 0, age: 0 };
                        }
                    } else if (plantNI.length > 0 && Math.random() < 0.2) {
                        const food = pick(plantNI);
                        next[food.r][food.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 2, 12);
                    }

                    // Reproduce
                    if (next[r][c].energy > 8 && emptyN.length > 0 && Math.random() < 0.15) {
                        const t = pick(emptyN);
                        next[t.r][t.c] = { type: 'insect', energy: 4, age: 0 };
                        next[r][c].energy -= 4;
                    }

                    // Move
                    if (emptyN.length > 0 && Math.random() < 0.4) {
                        const t = pick(emptyN);
                        next[t.r][t.c] = { ...next[r][c], energy: cell.energy - 1 };
                        next[r][c] = { type: 'empty', energy: 0, age: 0 };
                    }

                    if (next[r][c].type === 'insect') {
                        next[r][c].energy -= 1;
                        if (next[r][c].energy <= 0) next[r][c] = { type: 'empty', energy: 0, age: 0 };
                    }
                    break;
                }

                case 'fish': {
                    const waterN = neighbors.filter(n => n.cell.type === 'water');
                    const insectNF = neighbors.filter(n => n.cell.type === 'insect');
                    const plantNF = neighbors.filter(n => n.cell.type === 'plant');

                    // Fish eat insects that fall in water
                    if (insectNF.length > 0 && Math.random() < 0.3) {
                        const prey = pick(insectNF);
                        next[prey.r][prey.c] = { type: 'water', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 3, 15);
                    }
                    // Fish eat plants near water
                    if (plantNF.length > 0 && Math.random() < 0.1) {
                        const food = pick(plantNF);
                        next[food.r][food.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 2, 15);
                    }

                    // Fish reproduce in water
                    if (next[r][c].energy > 10 && waterN.length > 0 && Math.random() < 0.1) {
                        const t = pick(waterN);
                        next[t.r][t.c] = { type: 'fish', energy: 5, age: 0 };
                        next[r][c].energy -= 5;
                    }

                    // Fish move through water
                    if (waterN.length > 0 && Math.random() < 0.35) {
                        const t = pick(waterN);
                        next[t.r][t.c] = { ...next[r][c], energy: cell.energy - 1 };
                        next[r][c] = { type: 'water', energy: 0, age: 0 };
                    }

                    if (next[r][c].type === 'fish') {
                        // Fish need water to survive
                        if (waterN.length === 0 && Math.random() < 0.3) {
                            next[r][c] = { type: 'empty', energy: 0, age: 0 };
                        } else {
                            next[r][c].energy -= 1;
                            if (next[r][c].energy <= 0) next[r][c] = { type: 'water', energy: 0, age: 0 };
                        }
                    }
                    break;
                }

                case 'bird': {
                    const insectNB = neighbors.filter(n => n.cell.type === 'insect');
                    const fishNB = neighbors.filter(n => n.cell.type === 'fish');
                    const fruitNB = neighbors.filter(n => n.cell.type === 'fruit');

                    // Birds eat insects
                    if (insectNB.length > 0 && Math.random() < 0.4) {
                        const prey = pick(insectNB);
                        next[prey.r][prey.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 3, 18);
                    }
                    // Birds catch fish
                    if (fishNB.length > 0 && Math.random() < 0.2) {
                        const prey = pick(fishNB);
                        next[prey.r][prey.c] = { type: 'water', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 4, 18);
                    }
                    // Birds eat fruit
                    if (fruitNB.length > 0 && Math.random() < 0.25) {
                        const food = pick(fruitNB);
                        next[food.r][food.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 2, 18);
                    }

                    // Birds reproduce
                    if (next[r][c].energy > 12 && emptyN.length > 0 && Math.random() < 0.1) {
                        const t = pick(emptyN);
                        next[t.r][t.c] = { type: 'bird', energy: 5, age: 0 };
                        next[r][c].energy -= 5;
                    }

                    // Birds fly (move farther)
                    if (emptyN.length > 0 && Math.random() < 0.5) {
                        const t = pick(emptyN);
                        next[t.r][t.c] = { ...next[r][c], energy: cell.energy - 1 };
                        next[r][c] = { type: 'empty', energy: 0, age: 0 };
                    }

                    // Birds spread seeds (drop plants)
                    if (Math.random() < 0.03 && emptyN.length > 0) {
                        const t = pick(emptyN);
                        next[t.r][t.c] = { type: 'plant', energy: 5, age: 0 };
                    }

                    if (next[r][c].type === 'bird') {
                        next[r][c].energy -= 1;
                        if (next[r][c].energy <= 0) next[r][c] = { type: 'empty', energy: 0, age: 0 };
                    }
                    break;
                }

                case 'herbivore': {
                    const plantN = neighbors.filter(n => n.cell.type === 'plant');
                    const fruitN = neighbors.filter(n => n.cell.type === 'fruit');
                    const mushroomN = neighbors.filter(n => n.cell.type === 'mushroom');

                    // Eat plants, fruit, or mushrooms
                    if (plantN.length > 0) {
                        const food = pick(plantN);
                        next[food.r][food.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 3, 15);
                    } else if (fruitN.length > 0) {
                        const food = pick(fruitN);
                        next[food.r][food.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 4, 15);
                    } else if (mushroomN.length > 0 && Math.random() < 0.3) {
                        const food = pick(mushroomN);
                        next[food.r][food.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 2, 15);
                    }

                    // Reproduce
                    if (next[r][c].energy > 10 && emptyN.length > 0 && Math.random() < 0.18) {
                        const spot = pick(emptyN);
                        next[spot.r][spot.c] = { type: 'herbivore', energy: 5, age: 0 };
                        next[r][c].energy -= 5;
                    }

                    // Move
                    if (emptyN.length > 0 && Math.random() < 0.3) {
                        const spot = pick(emptyN);
                        next[spot.r][spot.c] = { ...next[r][c], energy: cell.energy - 1 };
                        next[r][c] = { type: 'empty', energy: 0, age: 0 };
                    }

                    if (next[r][c].type === 'herbivore') {
                        next[r][c].energy -= 1;
                        if (next[r][c].energy <= 0) {
                            next[r][c] = { type: 'mushroom', energy: 3, age: 0 };
                        }
                    }
                    break;
                }

                case 'carnivore': {
                    const herbN = neighbors.filter(n => n.cell.type === 'herbivore');
                    const insectNC = neighbors.filter(n => n.cell.type === 'insect');
                    const birdNC = neighbors.filter(n => n.cell.type === 'bird');

                    // Hunt herbivores
                    if (herbN.length > 0) {
                        const prey = pick(herbN);
                        next[prey.r][prey.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 5, 20);
                    }
                    // Catch birds
                    else if (birdNC.length > 0 && Math.random() < 0.15) {
                        const prey = pick(birdNC);
                        next[prey.r][prey.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 4, 20);
                    }
                    // Eat insects
                    else if (insectNC.length > 0 && Math.random() < 0.2) {
                        const prey = pick(insectNC);
                        next[prey.r][prey.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 2, 20);
                    }

                    // Reproduce
                    if (next[r][c].energy > 12 && emptyN.length > 0 && Math.random() < 0.1) {
                        const spot = pick(emptyN);
                        next[spot.r][spot.c] = { type: 'carnivore', energy: 6, age: 0 };
                        next[r][c].energy -= 6;
                    }

                    // Move
                    if (emptyN.length > 0 && Math.random() < 0.25) {
                        const spot = pick(emptyN);
                        next[spot.r][spot.c] = { ...next[r][c], energy: cell.energy - 1 };
                        next[r][c] = { type: 'empty', energy: 0, age: 0 };
                    }

                    if (next[r][c].type === 'carnivore') {
                        next[r][c].energy -= 1;
                        if (next[r][c].energy <= 0) {
                            next[r][c] = { type: 'mushroom', energy: 3, age: 0 };
                        }
                    }
                    break;
                }

                case 'human': {
                    const herbNH = neighbors.filter(n => n.cell.type === 'herbivore');
                    const carnNH = neighbors.filter(n => n.cell.type === 'carnivore');
                    const fishNH = neighbors.filter(n => n.cell.type === 'fish');
                    const fruitNH = neighbors.filter(n => n.cell.type === 'fruit');
                    const plantNH = neighbors.filter(n => n.cell.type === 'plant');
                    const treeNH = neighbors.filter(n => n.cell.type === 'tree');
                    const mushroomNH = neighbors.filter(n => n.cell.type === 'mushroom');

                    // Humans are omnivores - eat almost anything
                    if (fruitNH.length > 0) {
                        const food = pick(fruitNH);
                        next[food.r][food.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 3, 25);
                    } else if (fishNH.length > 0 && Math.random() < 0.3) {
                        const prey = pick(fishNH);
                        next[prey.r][prey.c] = { type: 'water', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 4, 25);
                    } else if (herbNH.length > 0 && Math.random() < 0.25) {
                        const prey = pick(herbNH);
                        next[prey.r][prey.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 5, 25);
                    } else if (mushroomNH.length > 0 && Math.random() < 0.3) {
                        const food = pick(mushroomNH);
                        next[food.r][food.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 2, 25);
                    } else if (plantNH.length > 0 && Math.random() < 0.2) {
                        const food = pick(plantNH);
                        next[food.r][food.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 2, 25);
                    }

                    // Humans plant trees (farming)
                    if (treeNH.length === 0 && emptyN.length > 0 && Math.random() < 0.03) {
                        const t = pick(emptyN);
                        next[t.r][t.c] = { type: 'plant', energy: 5, age: 0 };
                    }

                    // Humans can hunt carnivores (self-defense)
                    if (carnNH.length > 0 && Math.random() < 0.2) {
                        const prey = pick(carnNH);
                        next[prey.r][prey.c] = { type: 'empty', energy: 0, age: 0 };
                        next[r][c].energy = Math.min(cell.energy + 4, 25);
                    }

                    // Reproduce slowly
                    if (next[r][c].energy > 18 && emptyN.length > 0 && Math.random() < 0.06) {
                        const spot = pick(emptyN);
                        next[spot.r][spot.c] = { type: 'human', energy: 8, age: 0 };
                        next[r][c].energy -= 8;
                    }

                    // Move
                    if (emptyN.length > 0 && Math.random() < 0.3) {
                        const spot = pick(emptyN);
                        next[spot.r][spot.c] = { ...next[r][c], energy: cell.energy - 1 };
                        next[r][c] = { type: 'empty', energy: 0, age: 0 };
                    }

                    if (next[r][c].type === 'human') {
                        next[r][c].energy -= 1;
                        if (next[r][c].energy <= 0) {
                            next[r][c] = { type: 'mushroom', energy: 3, age: 0 };
                        }
                    }
                    break;
                }

                case 'water': {
                    // Water spreads very slowly
                    if (Math.random() < 0.01 && emptyN.length > 0) {
                        const t = pick(emptyN);
                        next[t.r][t.c] = { type: 'water', energy: 0, age: 0 };
                    }
                    break;
                }
            }
        }
    }
    return next;
}

type BrushCategory = 'resources' | 'flora' | 'fauna' | 'tools';

interface BrushDef {
    type: CellType;
    label: string;
    label_es: string;
    category: BrushCategory;
}

const ALL_BRUSHES: BrushDef[] = [
    { type: 'water', label: 'Water', label_es: 'Agua', category: 'resources' },
    { type: 'plant', label: 'Plant', label_es: 'Planta', category: 'flora' },
    { type: 'tree', label: 'Tree', label_es: 'Árbol', category: 'flora' },
    { type: 'fruit', label: 'Fruit', label_es: 'Fruta', category: 'flora' },
    { type: 'flower', label: 'Flower', label_es: 'Flor', category: 'flora' },
    { type: 'mushroom', label: 'Mushroom', label_es: 'Hongo', category: 'flora' },
    { type: 'insect', label: 'Insect', label_es: 'Insecto', category: 'fauna' },
    { type: 'fish', label: 'Fish', label_es: 'Pez', category: 'fauna' },
    { type: 'bird', label: 'Bird', label_es: 'Ave', category: 'fauna' },
    { type: 'herbivore', label: 'Herbivore', label_es: 'Herbívoro', category: 'fauna' },
    { type: 'carnivore', label: 'Carnivore', label_es: 'Carnívoro', category: 'fauna' },
    { type: 'human', label: 'Human', label_es: 'Humano', category: 'fauna' },
    { type: 'empty', label: 'Eraser', label_es: 'Borrador', category: 'tools' },
];

const CATEGORY_LABELS: Record<BrushCategory, { en: string; es: string }> = {
    resources: { en: 'Resources', es: 'Recursos' },
    flora: { en: 'Flora', es: 'Flora' },
    fauna: { en: 'Fauna', es: 'Fauna' },
    tools: { en: 'Tools', es: 'Herram.' },
};

const COUNTABLE_TYPES: CellType[] = ['water', 'plant', 'tree', 'fruit', 'flower', 'mushroom', 'insect', 'fish', 'bird', 'herbivore', 'carnivore', 'human'];

export default function PocketEcosystemGame() {
    const { language } = useLanguage();
    const [grid, setGrid] = useState<Cell[][]>(createEmptyGrid);
    const [brush, setBrush] = useState<CellType>('plant');
    const [running, setRunning] = useState(false);
    const [generation, setGeneration] = useState(0);
    const [speed, setSpeed] = useState(1);
    const runningRef = useRef(false);
    const gridRef = useRef(grid);
    const speedRef = useRef(speed);

    gridRef.current = grid;
    speedRef.current = speed;

    const tick = useCallback(() => {
        if (!runningRef.current) return;
        setGrid(prev => {
            const next = simulateStep(prev);
            gridRef.current = next;
            return next;
        });
        setGeneration(prev => prev + 1);
        setTimeout(tick, TICK_MS / speedRef.current);
    }, []);

    const toggleRunning = () => {
        if (running) {
            runningRef.current = false;
            setRunning(false);
        } else {
            runningRef.current = true;
            setRunning(true);
            tick();
        }
    };

    const paint = (r: number, c: number) => {
        setGrid(prev => {
            const next = prev.map(row => row.map(cell => ({ ...cell })));
            next[r][c] = { type: brush, energy: INITIAL_ENERGY[brush], age: 0 };
            return next;
        });
    };

    const reset = () => {
        runningRef.current = false;
        setRunning(false);
        setGrid(createEmptyGrid());
        setGeneration(0);
    };

    const counts: Record<string, number> = {};
    for (const t of COUNTABLE_TYPES) counts[t] = 0;
    for (const row of grid) {
        for (const cell of row) {
            if (cell.type !== 'empty' && counts[cell.type] !== undefined) counts[cell.type]++;
        }
    }

    const totalOrganisms = COUNTABLE_TYPES.filter(t => t !== 'water').reduce((s, t) => s + (counts[t] || 0), 0);

    const categories: BrushCategory[] = ['resources', 'flora', 'fauna', 'tools'];

    return (
        <div className="h-full bg-gradient-to-b from-gray-950 via-emerald-950/30 to-gray-950 text-white overflow-hidden flex flex-col">
            {/* Mobile: stacked layout / Desktop: sidebar + grid */}
            <div className="flex flex-col lg:flex-row h-full">

                {/* Left Sidebar */}
                <div className="lg:w-56 xl:w-64 shrink-0 lg:h-full lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-gray-800/50 bg-gray-950/60 p-3 lg:p-4 flex flex-col gap-3">
                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-lg lg:text-xl font-black leading-tight">
                            {language === 'es' ? 'Ecosistema de Bolsillo' : 'Pocket Ecosystem'}
                        </h1>
                        <p className="text-gray-500 text-[10px] mt-0.5 hidden lg:block">
                            {language === 'es'
                                ? 'Coloca organismos y recursos.'
                                : 'Place organisms and resources.'}
                        </p>
                    </div>

                    {/* Brush Selector - Vertical categories */}
                    <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
                        {categories.map(cat => (
                            <div key={cat} className="shrink-0">
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">
                                    {language === 'es' ? CATEGORY_LABELS[cat].es : CATEGORY_LABELS[cat].en}
                                </span>
                                <div className="flex flex-row lg:flex-col gap-1">
                                    {ALL_BRUSHES.filter(b => b.category === cat).map(b => (
                                        <button
                                            key={b.type}
                                            onClick={() => setBrush(b.type)}
                                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-semibold transition-all w-full text-left ${
                                                brush === b.type
                                                    ? 'ring-2 ring-white/40 shadow-lg scale-[1.02]'
                                                    : 'opacity-50 hover:opacity-90'
                                            }`}
                                            style={{
                                                backgroundColor: b.type === 'empty' ? '#374151' : CELL_COLORS[b.type] + '33',
                                                color: b.type === 'empty' ? '#9ca3af' : CELL_COLORS[b.type],
                                            }}
                                        >
                                            <span className="text-sm">{CELL_EMOJI[b.type] || '🧹'}</span>
                                            <span className="truncate">{language === 'es' ? b.label_es : b.label}</span>
                                            {counts[b.type] > 0 && (
                                                <span className="ml-auto text-[9px] opacity-60">{counts[b.type]}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-1.5 mt-auto">
                        <div className="flex gap-1.5">
                            <button
                                onClick={toggleRunning}
                                className={`flex-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                    running
                                        ? 'bg-red-600 hover:bg-red-500 text-white'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                            >
                                {running ? (language === 'es' ? '⏸ Pausar' : '⏸ Pause') : (language === 'es' ? '▶ Iniciar' : '▶ Start')}
                            </button>
                            <button
                                onClick={() => { setGrid(simulateStep(gridRef.current)); setGeneration(g => g + 1); }}
                                className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs"
                                disabled={running}
                            >
                                {language === 'es' ? '⏭' : '⏭'}
                            </button>
                            <button
                                onClick={reset}
                                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs"
                            >
                                🗑
                            </button>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] text-gray-500">{language === 'es' ? 'Vel:' : 'Spd:'}</span>
                            {[1, 2, 4].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSpeed(s)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                        speed === s ? 'bg-emerald-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    {s}x
                                </button>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="border-t border-gray-800/50 pt-2 mt-1">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className="text-gray-500">Gen: <span className="text-white font-bold">{generation}</span></span>
                                <span className="text-gray-500">{language === 'es' ? 'Org' : 'Org'}: <span className="text-white font-bold">{totalOrganisms}</span></span>
                            </div>
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px]">
                                {COUNTABLE_TYPES.map(t => (
                                    counts[t] > 0 ? (
                                        <span key={t} style={{ color: CELL_COLORS[t] }}>
                                            {CELL_EMOJI[t]}{counts[t]}
                                        </span>
                                    ) : null
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Area */}
                <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center p-2 lg:p-4">
                    <div
                        className="inline-grid border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50"
                        style={{
                            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                            width: 'min(100%, 95vw, 700px)',
                            maxHeight: 'min(calc(100vh - 200px), 95vw, 700px)',
                            aspectRatio: '1',
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {grid.flatMap((row, r) =>
                            row.map((cell, c) => (
                                <div
                                    key={`${r}-${c}`}
                                    className="border border-gray-800/20 flex items-center justify-center cursor-pointer hover:brightness-125 transition-colors"
                                    style={{
                                        backgroundColor: cell.type === 'empty' ? 'transparent' : CELL_COLORS[cell.type] + (cell.type === 'water' ? '55' : cell.type === 'tree' ? 'aa' : '88'),
                                        aspectRatio: '1',
                                    }}
                                    onMouseDown={() => paint(r, c)}
                                    onMouseEnter={(e) => { if (e.buttons === 1) paint(r, c); }}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
