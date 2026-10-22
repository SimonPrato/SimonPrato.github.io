/**
 * Chess Puzzle Generator page: shows one puzzle at a time and lets the
 * user solve it by tapping squares. A Web Worker searches for puzzles in
 * the background and keeps up to BUFFER_SIZE more ready.
 */
import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/esm/chess.js';
import { squareName } from './generator.js';

// U+FE0E keeps the glyphs from rendering as emoji on mobile.
const GLYPHS = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟︎' };
const NAMES = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };
const BUFFER_SIZE = 3;

const $ = id => document.getElementById(id);
const els = {
    side: $('side'), unique: $('unique'),
    minPieces: $('minPieces'), maxPieces: $('maxPieces'), minVal: $('minVal'), maxVal: $('maxVal'),
    board: $('board'), prompt: $('prompt'), feedback: $('feedback'), queue: $('queue'),
    next: $('next'), reveal: $('reveal'), copy: $('copy'), lichess: $('lichess'),
    solved: $('solved'),
};

const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
let runId = 0;
const buffer = [];

let puzzle = null;
let chess = null;
let selected = null;
let lastMove = null;
let finished = false;
let solvedCount = 0;

// ---- Background generation ------------------------------------------------

function readOptions() {
    return {
        side: els.side.value,
        unique: els.unique.checked,
        minPieces: Number(els.minPieces.value),
        maxPieces: Number(els.maxPieces.value),
    };
}

/** Restart the search with the current options. The shown puzzle stays. */
function restartSearch() {
    runId++;
    buffer.length = 0;
    const want = BUFFER_SIZE + (puzzle ? 0 : 1);
    worker.postMessage({ type: 'start', id: runId, options: readOptions(), want });
    updateQueue();
}

worker.onmessage = ({ data }) => {
    if (data.type !== 'puzzle' || data.id !== runId) return;
    if (!puzzle) show(data.puzzle);
    else buffer.push(data.puzzle);
    updateQueue();
};

worker.onerror = () => {
    els.queue.textContent = 'The puzzle search could not start in this browser.';
};

function nextPuzzle() {
    if (!buffer.length) return;
    show(buffer.shift());
    worker.postMessage({ type: 'more', id: runId, n: 1 });
    updateQueue();
}

function updateQueue() {
    const n = buffer.length;
    els.next.disabled = n === 0;
    els.next.textContent = n === 0 && puzzle ? 'Searching…' : 'Next puzzle';
    els.queue.textContent = !puzzle
        ? 'Searching for a puzzle…'
        : `${n} of ${BUFFER_SIZE} next puzzles ready${n < BUFFER_SIZE ? ', searching in the background' : ''}.`;
}

// ---- Puzzle display and solving --------------------------------------------

function show(p) {
    puzzle = p;
    chess = new Chess(p.fen, { skipValidation: true });
    selected = null;
    lastMove = null;
    finished = false;
    const mover = p.turn === 'w' ? 'White' : 'Black';
    els.prompt.textContent = `${mover} to move. Find the mate in one.`;
    setFeedback('Select a piece, then its target square.', '');
    els.reveal.disabled = false;
    els.copy.disabled = false;
    els.lichess.href = `https://lichess.org/analysis/standard/${p.fen.replace(/ /g, '_')}`;
    els.lichess.removeAttribute('aria-disabled');
    renderBoard();
}

function setFeedback(text, kind) {
    els.feedback.textContent = text;
    els.feedback.className = `feedback ${kind}`;
}

function renderBoard() {
    const flip = puzzle.turn === 'b';
    const targets = new Set(selected
        ? chess.moves({ square: selected, verbose: true }).map(m => m.to)
        : []);
    const frag = document.createDocumentFragment();
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const rank = flip ? row : 7 - row;
            const file = flip ? 7 - col : col;
            const name = squareName(rank * 8 + file);
            const piece = chess.get(name);
            const sq = document.createElement('button');
            sq.type = 'button';
            sq.className = (rank + file) % 2 === 0 ? 'sq dark' : 'sq';
            sq.dataset.square = name;
            if (name === selected) sq.classList.add('selected');
            if (lastMove && (name === lastMove.from || name === lastMove.to)) sq.classList.add('last');
            if (targets.has(name)) sq.classList.add(piece ? 'capture' : 'target');
            sq.setAttribute('aria-label', piece
                ? `${name}, ${piece.color === 'w' ? 'white' : 'black'} ${NAMES[piece.type]}`
                : name);
            if (piece) {
                const span = document.createElement('span');
                span.className = `piece ${piece.color}`;
                span.textContent = GLYPHS[piece.type];
                sq.appendChild(span);
            }
            if (row === 7) sq.insertAdjacentHTML('beforeend', `<span class="coord file">${'abcdefgh'[file]}</span>`);
            if (col === 0) sq.insertAdjacentHTML('beforeend', `<span class="coord rank">${rank + 1}</span>`);
            frag.appendChild(sq);
        }
    }
    els.board.replaceChildren(frag);
    els.board.classList.toggle('finished', finished);
}

function onSquare(name) {
    if (!puzzle || finished) return;
    const piece = chess.get(name);
    if (piece && piece.color === chess.turn()) {
        selected = selected === name ? null : name;
        renderBoard();
        return;
    }
    if (!selected) return;

    const candidates = chess.moves({ square: selected, verbose: true }).filter(m => m.to === name);
    if (!candidates.length) {
        selected = null;
        renderBoard();
        return;
    }
    // For a promotion, prefer a piece that mates, then the queen.
    const move = candidates.find(m => puzzle.mates.includes(m.san))
        || candidates.find(m => !m.promotion || m.promotion === 'q');
    selected = null;
    if (puzzle.mates.includes(move.san)) {
        chess.move(move.san);
        lastMove = move;
        finished = true;
        solvedCount++;
        els.solved.textContent = `Solved: ${solvedCount}`;
        const others = puzzle.mates.filter(san => san !== move.san);
        setFeedback(`${move.san} is checkmate!${others.length ? ` Also mate: ${others.join(', ')}.` : ''}`, 'good');
        els.reveal.disabled = true;
        els.next.focus({ preventScroll: true });
    } else {
        setFeedback(`${move.san} is not mate. Try again.`, 'bad');
    }
    renderBoard();
}

function reveal() {
    if (!puzzle || finished) return;
    const san = puzzle.mates[0];
    const move = chess.move(san);
    lastMove = move;
    finished = true;
    selected = null;
    const label = puzzle.mates.length === 1 ? 'Solution' : 'Solutions';
    setFeedback(`${label}: ${puzzle.mates.join(', ')}`, 'shown');
    els.reveal.disabled = true;
    renderBoard();
}

// ---- Options ----------------------------------------------------------------

// Keep the two piece sliders consistent: fewest <= most.
function syncPieceLimits(changed) {
    let min = Number(els.minPieces.value);
    let max = Number(els.maxPieces.value);
    if (min > max) {
        if (changed === els.minPieces) max = min;
        else min = max;
        els.minPieces.value = min;
        els.maxPieces.value = max;
    }
    els.minVal.textContent = min;
    els.maxVal.textContent = max;
}

els.minPieces.addEventListener('input', () => syncPieceLimits(els.minPieces));
els.maxPieces.addEventListener('input', () => syncPieceLimits(els.maxPieces));
// Restart once a slider is released, not on every step of the drag.
for (const el of [els.side, els.unique, els.minPieces, els.maxPieces]) {
    el.addEventListener('change', restartSearch);
}

els.board.addEventListener('click', e => {
    const sq = e.target.closest('.sq');
    if (sq) onSquare(sq.dataset.square);
});
els.next.addEventListener('click', nextPuzzle);
els.reveal.addEventListener('click', reveal);
els.copy.addEventListener('click', async () => {
    if (!puzzle) return;
    try {
        await navigator.clipboard.writeText(puzzle.fen);
        els.copy.textContent = 'Copied';
    } catch {
        els.copy.textContent = 'Copy failed';
    }
    setTimeout(() => { els.copy.textContent = 'Copy FEN'; }, 1500);
});
document.addEventListener('keydown', e => {
    if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|SELECT/.test(e.target.tagName)) nextPuzzle();
});

syncPieceLimits();
restartSearch();
