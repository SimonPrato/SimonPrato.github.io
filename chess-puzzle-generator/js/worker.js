/**
 * Background puzzle search. Runs off the main thread so the page stays
 * responsive, and only works while the page has asked for more puzzles:
 * once the buffer is full it sits idle until a puzzle is consumed.
 *
 * Messages in:
 *   { type: 'start', id, options, want }  restart with new options
 *   { type: 'more', id, n }               n more puzzles wanted
 * Messages out:
 *   { type: 'puzzle', id, puzzle }
 */
import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/esm/chess.js';
import { attempts } from './generator.js';

// Search in short slices so incoming messages are handled promptly.
const SLICE_MS = 50;

let id = 0;
let iter = null;
let wanted = 0;
let scheduled = false;

function schedule() {
    if (!scheduled && wanted > 0) {
        scheduled = true;
        setTimeout(step, 0);
    }
}

function step() {
    scheduled = false;
    const deadline = performance.now() + SLICE_MS;
    while (wanted > 0 && performance.now() < deadline) {
        for (const puzzle of iter.next().value) {
            if (wanted <= 0) break;
            wanted--;
            postMessage({ type: 'puzzle', id, puzzle });
        }
    }
    schedule();
}

onmessage = ({ data }) => {
    if (data.type === 'start') {
        id = data.id;
        iter = attempts(Chess, data.options);
        wanted = data.want;
    } else if (data.type === 'more' && data.id === id) {
        wanted += data.n;
    }
    schedule();
};
