/**
 * The smallest browser environment the game modules need in order to run under
 * plain Node — no dependencies, no headless browser.
 *
 * The 2D context is a recorder rather than a no-op: it throws when asked to
 * draw an image that does not exist, which is exactly the class of bug the old
 * "declare 55 <img> tags and hope" approach used to produce silently.
 */

const noop = () => {};

class StubImage {
  constructor() {
    this._src = '';
    this.complete = false;
    this.naturalWidth = 75;
    this.naturalHeight = 75;
  }

  set src(value) {
    this._src = value;
    // Resolve on a later turn so callers can attach handlers first.
    queueMicrotask(() => {
      this.complete = true;
      this.onload?.();
    });
  }

  get src() {
    return this._src;
  }

  decode() {
    return Promise.resolve();
  }
}

export class RecordingContext {
  constructor() {
    this.calls = Object.create(null);
    this.drawn = 0;
    this._depth = 0;
  }

  _tally(name) {
    this.calls[name] = (this.calls[name] ?? 0) + 1;
  }

  drawImage(image, ...rest) {
    if (!image) throw new TypeError(`drawImage() called with ${image}`);
    if (!(image instanceof StubImage)) throw new TypeError('drawImage() called with a non-image');
    if (rest.some((n) => !Number.isFinite(n))) {
      throw new TypeError(`drawImage() called with a non-finite coordinate: ${rest.join(', ')}`);
    }
    this.drawn += 1;
    this._tally('drawImage');
  }

  save() {
    this._depth += 1;
    this._tally('save');
  }

  restore() {
    this._depth -= 1;
    if (this._depth < 0) throw new Error('ctx.restore() without a matching save()');
    this._tally('restore');
  }

  setTransform(...args) {
    if (args.some((n) => !Number.isFinite(n))) throw new TypeError('setTransform() got NaN');
    this._tally('setTransform');
  }

  translate(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError('translate() got NaN');
    this._tally('translate');
  }

  rotate(a) {
    if (!Number.isFinite(a)) throw new TypeError('rotate() got NaN');
    this._tally('rotate');
  }

  scale = noop;
  beginPath = noop;
  rect = noop;
  clip = noop;
  fillRect = noop;
  fillText = noop;
  strokeText = noop;
  measureText = () => ({ width: 0 });
  createLinearGradient = () => ({ addColorStop: noop });
}

class StubCanvas {
  constructor(width = 1280, height = 720) {
    this.width = width;
    this.height = height;
    this.style = {};
    this.ctx = new RecordingContext();
    this.parentElement = null;
    this._rect = { left: 0, top: 0, width, height };
  }

  getContext() {
    return this.ctx;
  }

  getBoundingClientRect() {
    return this._rect;
  }

  addEventListener = noop;
  removeEventListener = noop;
}

/** Installs the globals the game modules expect. Idempotent. */
export function installDom({ width = 1280, height = 720, dpr = 1 } = {}) {
  const canvas = new StubCanvas(width, height);

  globalThis.Image = StubImage;
  globalThis.Audio = class {
    play() {
      return Promise.resolve();
    }
    pause() {}
    load() {}
    removeAttribute() {}
  };
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  globalThis.requestAnimationFrame = (fn) => setTimeout(() => fn(Date.now()), 0);
  globalThis.cancelAnimationFrame = clearTimeout;
  globalThis.window = {
    addEventListener: noop,
    removeEventListener: noop,
    devicePixelRatio: dpr,
    matchMedia: () => ({ matches: false, addEventListener: noop }),
  };
  globalThis.document = {
    documentElement: { style: { setProperty: noop } },
    getElementById: () => canvas,
    addEventListener: noop,
  };

  return canvas;
}
