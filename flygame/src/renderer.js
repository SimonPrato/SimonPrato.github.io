/**
 * Renderer.
 *
 * Draws a fixed 1920x1080 stage into whatever canvas size the browser hands
 * us: `fit` computes a uniform scale plus letterbox offsets, so nothing ever
 * stretches and the same pixel coordinates work everywhere.
 *
 * The canvas backing store is sized in device pixels (capped at 2x — beyond
 * that you pay 4x the fill rate for no visible gain), and resizes are batched
 * into a single rAF so dragging a window edge does not thrash allocations.
 */

import { VIEW } from './config.js';

export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {HTMLElement} [cssTarget] element that receives --pf-* variables
   */
  constructor(canvas, cssTarget = document.documentElement) {
    this.canvas = canvas;
    this.cssTarget = cssTarget;
    this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.dpr = 1;
    this.shakeX = 0;
    this.shakeY = 0;

    this._pending = false;
    const schedule = () => {
      if (this._pending) return;
      this._pending = true;
      requestAnimationFrame(() => {
        this._pending = false;
        this.resize();
      });
    };
    window.addEventListener('resize', schedule);
    if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(canvas.parentElement ?? canvas);
    this.resize();
  }

  resize() {
    const rect = (this.canvas.parentElement ?? this.canvas).getBoundingClientRect();
    const cssW = Math.max(1, Math.round(rect.width));
    const cssH = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (this.canvas.width !== Math.round(cssW * dpr) || this.canvas.height !== Math.round(cssH * dpr)) {
      this.canvas.width = Math.round(cssW * dpr);
      this.canvas.height = Math.round(cssH * dpr);
    }
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;

    this.dpr = dpr;
    this.cssW = cssW;
    this.cssH = cssH;
    this.scale = Math.min(cssW / VIEW.W, cssH / VIEW.H);
    this.offsetX = (cssW - VIEW.W * this.scale) / 2;
    this.offsetY = (cssH - VIEW.H * this.scale) / 2;

    // Let CSS position the HUD and menus exactly over the playfield.
    const s = this.cssTarget.style;
    s.setProperty('--pf-x', `${this.offsetX}px`);
    s.setProperty('--pf-y', `${this.offsetY}px`);
    s.setProperty('--pf-w', `${VIEW.W * this.scale}px`);
    s.setProperty('--pf-h', `${VIEW.H * this.scale}px`);
    s.setProperty('--pf-scale', String(this.scale));
  }

  /** Screen point (clientX/Y) -> stage coordinates. */
  toVirtual(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - this.offsetX) / this.scale,
      y: (clientY - rect.top - this.offsetY) / this.scale,
    };
  }

  /** Sets up the frame transform. Every draw after this is in stage units. */
  begin() {
    const { ctx } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = '#0b0d12';
    ctx.fillRect(0, 0, this.cssW, this.cssH);
    ctx.setTransform(
      this.scale * this.dpr,
      0,
      0,
      this.scale * this.dpr,
      (this.offsetX + this.shakeX) * this.dpr,
      (this.offsetY + this.shakeY) * this.dpr,
    );
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, VIEW.W, VIEW.H);
    ctx.clip();
  }

  end() {
    this.ctx.restore();
  }

  /**
   * @param {CanvasImageSource} image
   * @param {number} x top-left in stage units
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {{flip?: boolean, alpha?: number, rotate?: number, pivotX?: number, pivotY?: number}} [o]
   */
  sprite(image, x, y, w, h, o) {
    if (!image) return;
    const { ctx } = this;
    if (!o) {
      ctx.drawImage(image, x, y, w, h);
      return;
    }
    const { flip = false, alpha = 1, rotate = 0, pivotX = w / 2, pivotY = h / 2 } = o;
    ctx.save();
    if (alpha !== 1) ctx.globalAlpha = alpha;
    ctx.translate(x + pivotX, y + pivotY);
    if (rotate) ctx.rotate(rotate);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(image, -pivotX, -pivotY, w, h);
    ctx.restore();
  }

  /** Applies a decaying screen-shake impulse (ignored when reduced motion is on). */
  shake(amount, enabled = true) {
    if (!enabled) return;
    this._shakeMag = Math.min(26, (this._shakeMag ?? 0) + amount);
  }

  updateShake(dt) {
    const mag = this._shakeMag ?? 0;
    if (mag <= 0.05) {
      this._shakeMag = 0;
      this.shakeX = this.shakeY = 0;
      return;
    }
    this.shakeX = (Math.random() * 2 - 1) * mag;
    this.shakeY = (Math.random() * 2 - 1) * mag;
    this._shakeMag = mag * Math.exp(-9 * dt);
  }
}
