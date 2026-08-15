/**
 * Persisted settings and high score.
 * Everything degrades to defaults when localStorage is unavailable
 * (private windows, file:// in some browsers, storage disabled).
 */

const KEY = 'flygame.v3';

const DEFAULTS = {
  highScore: 0,
  volume: 0.7,
  muted: false,
  track: 0,
  screenShake: true,
  seenHelp: false,
};

function read() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

let state = read();

export const settings = {
  get(key) {
    return state[key];
  },
  set(key, value) {
    state[key] = value;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* Non-fatal: the session just will not be remembered. */
    }
  },
  /** @returns {boolean} true when the score is a new personal best. */
  submitScore(score) {
    if (score <= state.highScore) return false;
    this.set('highScore', score);
    return true;
  },
};
