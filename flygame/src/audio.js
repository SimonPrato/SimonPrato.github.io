/**
 * Audio.
 *
 * Sound effects go through the Web Audio API: each clip is decoded once into
 * an AudioBuffer and every play spawns a throwaway BufferSource. That gives
 * real polyphony and zero restart latency — the original reused a single
 * `Audio` element per effect, so a second explosion cut off the first, and
 * `play()` was being called on every frame an explosion was on screen.
 *
 * Music stays on HTMLAudioElement because it streams: a 1.9 MB track never has
 * to be fully downloaded before it starts, and `preload = 'none'` means the
 * three tracks you *didn't* pick are never fetched at all.
 */

import { SOUNDTRACKS } from './config.js';

const SFX = {
  coin: 'audio/coin.wav',
  shot: 'audio/shot.wav',
  reload: 'audio/reload.wav',
  enemyDeath: 'audio/enemy-death.wav',
  bombFall: 'audio/bomb-fall.wav',
  explosion: 'audio/explosion.wav',
  lose: 'audio/lose.wav',
};

/** Minimum seconds between two plays of the same clip (anti machine-gun). */
const RETRIGGER = { coin: 0.05, explosion: 0.09, enemyDeath: 0.05, bombFall: 0.25 };

class AudioManager {
  constructor() {
    /** @type {AudioContext | null} */
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    /** @type {Map<string, AudioBuffer>} */
    this.buffers = new Map();
    this.lastPlayed = new Map();
    /** @type {HTMLAudioElement | null} */
    this.musicEl = null;
    this.trackIndex = 0;
    this.musicWanted = false;
    this._volume = 0.7;
    this._muted = false;
    this._decoding = null;
  }

  get volume() {
    return this._volume;
  }

  get muted() {
    return this._muted;
  }

  /**
   * Must be called from a user gesture — browsers refuse to start an
   * AudioContext otherwise. Safe to call repeatedly.
   */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this._applyGain();
      this._decodeAll();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  async _decodeAll() {
    if (this._decoding) return this._decoding;
    this._decoding = Promise.all(
      Object.entries(SFX).map(async ([key, url]) => {
        try {
          const res = await fetch(url);
          const buf = await this.ctx.decodeAudioData(await res.arrayBuffer());
          this.buffers.set(key, buf);
        } catch {
          /* A missing sound effect must never take the game down. */
        }
      }),
    );
    return this._decoding;
  }

  /**
   * @param {keyof SFX} key
   * @param {{ volume?: number, rate?: number }} [opts]
   */
  play(key, opts = {}) {
    if (!this.ctx || this._muted) return;
    const buf = this.buffers.get(key);
    if (!buf) return;

    const now = this.ctx.currentTime;
    const gap = RETRIGGER[key] ?? 0;
    if (gap && now - (this.lastPlayed.get(key) ?? -Infinity) < gap) return;
    this.lastPlayed.set(key, now);

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = opts.rate ?? 1;
    const gain = this.ctx.createGain();
    gain.gain.value = opts.volume ?? 1;
    src.connect(gain).connect(this.sfxGain);
    src.start();
    src.onended = () => {
      gain.disconnect();
      src.disconnect();
    };
  }

  setVolume(v) {
    this._volume = Math.min(1, Math.max(0, v));
    this._applyGain();
  }

  setMuted(m) {
    this._muted = !!m;
    this._applyGain();
    if (this._muted) this.musicEl?.pause();
    else if (this.musicWanted) this._startMusic();
  }

  _applyGain() {
    const level = this._muted ? 0 : this._volume;
    if (this.masterGain) this.masterGain.gain.value = level;
    if (this.musicEl) this.musicEl.volume = level * 0.45;
  }

  /** @param {number} index index into SOUNDTRACKS */
  selectTrack(index) {
    const next = ((index % SOUNDTRACKS.length) + SOUNDTRACKS.length) % SOUNDTRACKS.length;
    if (next === this.trackIndex && this.musicEl) return;
    this.trackIndex = next;
    if (this.musicEl) {
      this.musicEl.pause();
      this.musicEl.removeAttribute('src');
      this.musicEl.load();
      this.musicEl = null;
    }
    if (this.musicWanted) this._startMusic();
  }

  playMusic() {
    this.musicWanted = true;
    if (!this._muted) this._startMusic();
  }

  stopMusic() {
    this.musicWanted = false;
    this.musicEl?.pause();
  }

  _startMusic() {
    if (!this.musicEl) {
      const el = new Audio();
      el.loop = true;
      el.preload = 'none';
      el.src = SOUNDTRACKS[this.trackIndex].src;
      this.musicEl = el;
      this._applyGain();
    }
    // Autoplay can still be refused; the menu's first click retries it.
    this.musicEl.play().catch(() => {});
  }

  /** Called when the tab is hidden so we stop burning CPU on decoding. */
  suspend() {
    this.musicEl?.pause();
    this.ctx?.suspend?.();
  }

  resume() {
    this.ctx?.resume?.();
    if (this.musicWanted && !this._muted) this.musicEl?.play().catch(() => {});
  }
}

export const audio = new AudioManager();
