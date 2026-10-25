/**
 * Chess Puzzle Generator page: shows one puzzle at a time and lets the
 * user solve it by tapping squares. A Web Worker searches for puzzles in
 * the background and keeps up to BUFFER_SIZE more ready.
 */
import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/esm/chess.js';
import { squareName } from './generator.js';

const NAMES = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };
const BUFFER_SIZE = 3;

// Piece images: the "bold" set from Chess Coach, scaled down to 160 px.
const pieceSrc = (color, type) => `./images/${color}${NAMES[type]}.png`;
// Load all twelve up front so a new puzzle never waits on an image.
for (const color of 'wb') for (const type in NAMES) new Image().src = pieceSrc(color, type);

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
    setFeedback('Drag a piece, or tap it and then its target square.', '');
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
            if (!finished && isOwn(name)) sq.classList.add('movable');
            sq.setAttribute('aria-label', piece
                ? `${name}, ${piece.color === 'w' ? 'white' : 'black'} ${NAMES[piece.type]}`
                : name);
            if (piece) {
                const img = document.createElement('img');
                img.className = 'piece';
                img.src = pieceSrc(piece.color, piece.type);
                img.alt = '';
                img.draggable = false;
                sq.appendChild(img);
            }
            if (row === 7) sq.insertAdjacentHTML('beforeend', `<span class="coord file">${'abcdefgh'[file]}</span>`);
            if (col === 0) sq.insertAdjacentHTML('beforeend', `<span class="coord rank">${rank + 1}</span>`);
            frag.appendChild(sq);
        }
    }
    els.board.replaceChildren(frag);
    els.board.classList.toggle('finished', finished);
}

function isOwn(name) {
    const piece = chess.get(name);
    return !!piece && piece.color === chess.turn();
}

/** Tap/click/keyboard: select a piece, or move the selected piece here. */
function onSquare(name) {
    if (!puzzle || finished) return;
    if (isOwn(name)) {
        selected = selected === name ? null : name;
        renderBoard();
    } else if (selected) {
        tryMove(selected, name);
    }
}

function tryMove(from, to) {
    selected = null;
    const candidates = chess.moves({ square: from, verbose: true }).filter(m => m.to === to);
    if (!candidates.length) {
        renderBoard();
        return;
    }
    // For a promotion, prefer a piece that mates, then the queen.
    const move = candidates.find(m => puzzle.mates.includes(m.san))
        || candidates.find(m => !m.promotion || m.promotion === 'q');
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

// ---- Pointer input: tap-to-move and drag-and-drop ---------------------------

// Pixels a pointer must travel before a press becomes a drag.
const DRAG_THRESHOLD = 6;
let press = null;

function squareAt(x, y) {
    const el = document.elementFromPoint(x, y);
    const sq = el && el.closest('.sq');
    return sq && els.board.contains(sq) ? sq : null;
}

function startDrag(e) {
    const sq = els.board.querySelector(`[data-square="${press.from}"]`);
    const img = sq.querySelector('.piece');
    const size = sq.getBoundingClientRect().width;
    press.ghost = img.cloneNode();
    press.ghost.className = 'drag-ghost';
    press.ghost.style.width = press.ghost.style.height = `${size}px`;
    document.body.appendChild(press.ghost);
    sq.classList.add('drag-origin');
    moveGhost(e);
}

function moveGhost(e) {
    press.ghost.style.left = `${e.clientX}px`;
    press.ghost.style.top = `${e.clientY}px`;
    const over = squareAt(e.clientX, e.clientY);
    if (over !== press.over) {
        press.over?.classList.remove('drag-over');
        over?.classList.add('drag-over');
        press.over = over;
    }
}

function endPress() {
    press?.ghost?.remove();
    press = null;
}

els.board.addEventListener('pointerdown', e => {
    if (!puzzle || finished || e.button !== 0) return;
    const sq = e.target.closest('.sq');
    if (!sq) return;
    const name = sq.dataset.square;
    e.preventDefault();
    els.board.setPointerCapture(e.pointerId);
    press = { id: e.pointerId, x: e.clientX, y: e.clientY, name, from: null, wasSelected: false };
    if (isOwn(name)) {
        // Select at once so the legal targets show while dragging.
        press.from = name;
        press.wasSelected = selected === name;
        selected = name;
        renderBoard();
    }
});

els.board.addEventListener('pointermove', e => {
    if (!press || e.pointerId !== press.id || !press.from) return;
    if (!press.ghost) {
        if (Math.hypot(e.clientX - press.x, e.clientY - press.y) < DRAG_THRESHOLD) return;
        startDrag(e);
    }
    moveGhost(e);
});

els.board.addEventListener('pointerup', e => {
    if (!press || e.pointerId !== press.id) return;
    const { name, from, ghost, wasSelected } = press;
    endPress();
    if (ghost) {
        // Drop: move if released on another square, else keep the selection.
        const target = squareAt(e.clientX, e.clientY);
        if (target && target.dataset.square !== from) tryMove(from, target.dataset.square);
        else renderBoard();
    } else if (from) {
        // Tap on an own piece: it was selected on press; a second tap deselects.
        if (wasSelected) {
            selected = null;
            renderBoard();
        }
    } else {
        onSquare(name);
    }
});

els.board.addEventListener('pointercancel', () => {
    endPress();
    if (puzzle) renderBoard();
});

// Keyboard activation of a square (Enter/Space) arrives as a click with
// detail 0; pointer clicks are already handled above.
els.board.addEventListener('click', e => {
    const sq = e.target.closest('.sq');
    if (sq && e.detail === 0) onSquare(sq.dataset.square);
});

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
