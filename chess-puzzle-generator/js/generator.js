/**
 * Random mate-in-one puzzle generator, a browser port of generate.py.
 *
 * Each side gets its king plus a random selection of its other 15 standard
 * pieces, placed on random squares. Each position is tested with white to
 * move and with black to move; a side's version is kept when the position
 * is valid and that side has a mate in one (searched exactly one move deep).
 *
 * The Chess class (chess.js) is passed in so this module has no network
 * dependency of its own.
 */

// The 15 pieces besides the king that each side may receive.
const OTHER_PIECES = ['q', 'r', 'r', 'b', 'b', 'n', 'n', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'];
export const SIDES = { white: ['w'], black: ['b'], both: ['w', 'b'] };

/** Small seedable PRNG returning floats in [0, 1). */
export function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function randInt(rng, lo, hi) {
    return lo + Math.floor(rng() * (hi - lo + 1));
}

function sample(rng, items, k) {
    const pool = items.slice();
    for (let i = 0; i < k; i++) {
        const j = randInt(rng, i, pool.length - 1);
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, k);
}

/** Return the king plus a random number (0 to 15) of the other pieces. */
function randomArmy(rng) {
    const extra = randInt(rng, 0, OTHER_PIECES.length);
    return ['k', ...sample(rng, OTHER_PIECES, extra)];
}

/**
 * Place two random armies on random squares. Returns 64 entries indexed by
 * rank * 8 + file (a1 = 0), each null or { type, color }.
 * Pawns never go on the first or last rank.
 */
function randomPlacement(rng, minPieces, maxPieces) {
    let armies;
    do {
        armies = { w: randomArmy(rng), b: randomArmy(rng) };
    } while (!(minPieces <= armies.w.length + armies.b.length && armies.w.length + armies.b.length <= maxPieces));

    // Place pawns first so they always find a square on ranks 2 to 7.
    const order = ['w', 'b'].flatMap(color => armies[color].map(type => ({ type, color })));
    order.sort((a, b) => (a.type !== 'p') - (b.type !== 'p'));

    const squares = new Array(64).fill(null);
    for (const piece of order) {
        const allowed = [];
        for (let sq = 0; sq < 64; sq++) {
            const rank = sq >> 3;
            if (!squares[sq] && (piece.type !== 'p' || (rank !== 0 && rank !== 7))) allowed.push(sq);
        }
        squares[allowed[randInt(rng, 0, allowed.length - 1)]] = piece;
    }
    return squares;
}

export function squareName(sq) {
    return 'abcdefgh'[sq & 7] + ((sq >> 3) + 1);
}

function placementFen(squares, turn) {
    const rows = [];
    for (let rank = 7; rank >= 0; rank--) {
        let row = '';
        let empty = 0;
        for (let file = 0; file < 8; file++) {
            const piece = squares[rank * 8 + file];
            if (!piece) {
                empty++;
                continue;
            }
            if (empty) row += empty;
            empty = 0;
            row += piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
        }
        if (empty) row += empty;
        rows.push(row);
    }
    return `${rows.join('/')} ${turn} - - 0 1`;
}

/** True when square c lies on the line through a and b (which must be aligned). */
function onLine(a, b, c) {
    const [fa, ra, fb, rb, fc, rc] = [a & 7, a >> 3, b & 7, b >> 3, c & 7, c >> 3];
    if (ra === rb) return rc === ra;
    if (fa === fb) return fc === fa;
    if (fa - ra === fb - rb) return fc - rc === fa - ra;
    if (fa + ra === fb + rb) return fc + rc === fa + ra;
    return false;
}

/**
 * Validity as python-chess's Board.is_valid() judges these positions: the
 * side not to move must not be in check, and the side to move must not face
 * more than two checkers, nor two checkers on one line through its king.
 */
function isValid(chess, squares) {
    const turn = chess.turn();
    const them = turn === 'w' ? 'b' : 'w';
    const kingSq = color => squares.findIndex(p => p && p.type === 'k' && p.color === color);

    if (chess.isAttacked(squareName(kingSq(them)), turn)) return false;

    const ourKing = kingSq(turn);
    const checkers = chess.attackers(squareName(ourKing), them)
        .map(name => 'abcdefgh'.indexOf(name[0]) + (Number(name[1]) - 1) * 8);
    if (checkers.length > 2) return false;
    if (checkers.length === 2 && onLine(checkers[0], checkers[1], ourKing)) return false;
    return true;
}

/** Return the SAN of every mating move for the side to move, one move deep. */
function matesInOne(chess) {
    const result = [];
    for (const move of chess.moves({ verbose: true })) {
        chess.move({ from: move.from, to: move.to, promotion: move.promotion });
        if (chess.isCheckmate()) result.push(move.san);
        chess.undo();
    }
    return result;
}

/**
 * Yield once per random position tried: the puzzle found in it, or null.
 * A position can produce up to two puzzles when side is "both", so the
 * yielded value is an array (possibly empty).
 */
export function* attempts(Chess, { unique = false, side = 'both', seed, minPieces = 2, maxPieces = 32 } = {}) {
    const rng = seed === undefined ? Math.random : mulberry32(seed);
    while (true) {
        const squares = randomPlacement(rng, minPieces, maxPieces);
        const found = [];
        for (const turn of SIDES[side]) {
            const fen = placementFen(squares, turn);
            const chess = new Chess(fen, { skipValidation: true });
            if (!isValid(chess, squares)) continue;
            const mates = matesInOne(chess);
            if (!mates.length || (unique && mates.length !== 1)) continue;
            found.push({ fen, turn, squares, mates });
        }
        yield found;
    }
}
