/**
 * Input.
 *
 * One place that turns keyboard, mouse, wheel and touch into a small set of
 * game actions. Held state is polled by the simulation; "pressed" state is
 * edge-triggered and cleared at the end of every frame, so a tap is never
 * missed and never applied twice.
 *
 * Listeners are attached exactly once. The original re-registered a `wheel`
 * handler inside the per-frame update, which added a listener roughly 60 times
 * a second for as long as you played.
 */

const KEYS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  jump: ['ArrowUp', 'KeyW', 'Space'],
  fire: ['KeyJ'],
};

export class Input {
  constructor() {
    this.left = false;
    this.right = false;
    this.jumpHeld = false;
    this.jumpPressed = false;
    this.fireHeld = false;
    this.firePressed = false;
    /** Aim point in virtual stage coordinates. */
    this.aim = { x: 960, y: 500 };
    /** True while the player is aiming with a real pointer (not touch). */
    this.hasPointer = false;
    /** -1 / +1 steps requested this frame via wheel or Q/E. */
    this.weaponStep = 0;
    /** 1-based weapon slot requested this frame, or 0. */
    this.weaponSlot = 0;

    this._down = new Set();
    this._detach = [];
    this._pointerFiring = false;
    this._touchFiring = false;
    this._touch = { left: false, right: false, jump: false };
  }

  /**
   * @param {HTMLElement} surface element that owns pointer input
   * @param {{ toVirtual(x: number, y: number): {x: number, y: number} }} renderer
   */
  attach(surface, renderer) {
    const on = (target, type, fn, opts) => {
      target.addEventListener(type, fn, opts);
      this._detach.push(() => target.removeEventListener(type, fn, opts));
    };

    on(window, 'keydown', (e) => {
      // Never swallow keys aimed at a focused button, link or slider.
      const t = e.target;
      if (t instanceof HTMLElement && t.closest('input, select, textarea')) return;
      if (e.repeat) {
        if (this._isGameKey(e.code)) e.preventDefault();
        return;
      }
      if (!this._isGameKey(e.code)) return;
      // Space on a focused button should click it, not jump.
      if (e.code === 'Space' && t instanceof HTMLElement && t.closest('button')) return;
      e.preventDefault();
      this._down.add(e.code);
      this._sync();
      if (KEYS.jump.includes(e.code)) this.jumpPressed = true;
      if (KEYS.fire.includes(e.code)) this.firePressed = true;
      if (e.code === 'KeyQ') this.weaponStep -= 1;
      if (e.code === 'KeyE') this.weaponStep += 1;
      if (e.code >= 'Digit1' && e.code <= 'Digit9') this.weaponSlot = Number(e.code.slice(5));
    });

    on(window, 'keyup', (e) => {
      this._down.delete(e.code);
      this._sync();
    });

    // Losing focus must release every key, or the player runs off on their own.
    on(window, 'blur', () => this.releaseAll());

    on(surface, 'pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      this.hasPointer = true;
      this.aim = renderer.toVirtual(e.clientX, e.clientY);
    });

    on(surface, 'pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      if (e.button !== 0) return;
      this.hasPointer = true;
      this.aim = renderer.toVirtual(e.clientX, e.clientY);
      this._pointerFiring = true;
      this.firePressed = true;
      this._sync();
    });

    on(window, 'pointerup', (e) => {
      if (e.pointerType === 'touch') return;
      if (e.button === 0) this._pointerFiring = false;
      this._sync();
    });

    on(surface, 'contextmenu', (e) => e.preventDefault());

    on(
      surface,
      'wheel',
      (e) => {
        e.preventDefault();
        this.weaponStep += Math.sign(e.deltaY);
      },
      { passive: false },
    );

    return this;
  }

  /**
   * Wires the on-screen touch pad. Each button holds its action for as long as
   * the finger is down, and pointer capture keeps it working when the finger
   * slides off the button.
   * @param {HTMLElement} pad
   */
  attachTouchPad(pad) {
    for (const btn of pad.querySelectorAll('[data-action]')) {
      const action = btn.dataset.action;
      const press = (e) => {
        e.preventDefault();
        btn.setPointerCapture?.(e.pointerId);
        btn.classList.add('is-active');
        this._setAction(action, true);
      };
      const release = () => {
        btn.classList.remove('is-active');
        this._setAction(action, false);
      };
      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('lostpointercapture', release);
    }
    return this;
  }

  _setAction(action, down) {
    switch (action) {
      case 'left':
      case 'right':
      case 'jump':
        this._touch[action] = down;
        if (down && action === 'jump') this.jumpPressed = true;
        break;
      case 'fire':
        this._touchFiring = down;
        if (down) this.firePressed = true;
        break;
      case 'swap':
        if (down) this.weaponStep += 1;
        return;
    }
    this._sync();
  }

  _isGameKey(code) {
    return (
      KEYS.left.includes(code) ||
      KEYS.right.includes(code) ||
      KEYS.jump.includes(code) ||
      KEYS.fire.includes(code) ||
      code === 'KeyQ' ||
      code === 'KeyE' ||
      (code.startsWith('Digit') && code.length === 6)
    );
  }

  _sync() {
    this.left = this._touch.left || KEYS.left.some((k) => this._down.has(k));
    this.right = this._touch.right || KEYS.right.some((k) => this._down.has(k));
    this.jumpHeld = this._touch.jump || KEYS.jump.some((k) => this._down.has(k));
    this.fireHeld =
      this._touchFiring || this._pointerFiring || KEYS.fire.some((k) => this._down.has(k));
  }

  releaseAll() {
    this._down.clear();
    this._touch.left = this._touch.right = this._touch.jump = false;
    this._pointerFiring = this._touchFiring = false;
    this._sync();
  }

  /** Clears edge-triggered state. Call once per simulated frame. */
  endFrame() {
    this.jumpPressed = false;
    this.firePressed = false;
    this.weaponStep = 0;
    this.weaponSlot = 0;
  }

  destroy() {
    for (const off of this._detach) off();
    this._detach.length = 0;
  }
}
