/**
 * DOM interface layer: HUD, menus, shop, pause and game-over panels.
 *
 * Nothing here draws to the canvas. Keeping the interface in the DOM means the
 * text stays sharp on any display, the whole game is keyboard-navigable, and
 * screen readers get real buttons instead of invisible click rectangles — the
 * original hid the soundtrack switcher and the entire shop behind hard-coded
 * pixel regions with no visual affordance at all.
 */

import { WEAPONS, SOUNDTRACKS } from './config.js';
import { State } from './game.js';

const ICONS = {
  fist: 'img/fist.png',
  shotgun: 'img/shotgun.png',
  fireAxe: 'img/fireaxe.png',
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class UI {
  /**
   * @param {{
   *   onPlay: Function, onResume: Function, onRestart: Function,
   *   onMenu: Function, onBuy: (id: string) => boolean,
   *   onSetting: (key: string, value: any) => void,
   *   settings: import('./storage.js').settings,
   * }} handlers
   */
  constructor(handlers) {
    this.h = handlers;
    this.stage = document.getElementById('stage');
    this.panel = document.getElementById('panel');
    this.hud = document.getElementById('hud');
    this.touchpad = document.getElementById('touchpad');

    this.el = {
      score: document.getElementById('hud-score'),
      best: document.getElementById('hud-best'),
      money: document.getElementById('hud-money'),
      lives: document.getElementById('hud-lives'),
      slots: document.getElementById('hud-slots'),
      combo: document.getElementById('hud-combo'),
    };

    document.getElementById('btn-pause').addEventListener('click', () => this.h.onPause());

    // One delegated listener for every button the panels ever render.
    this.panel.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cmd]');
      if (!btn) return;
      this._command(btn.dataset.cmd, btn.dataset.arg);
    });

    const onFieldChange = (e) => {
      const field = e.target.closest('[data-setting]');
      if (!field) return;
      const value =
        field.type === 'checkbox' ? field.checked : field.type === 'range' ? Number(field.value) : field.value;
      this.h.onSetting(field.dataset.setting, value);
    };
    // `input` makes the volume slider live; `change` covers select and checkbox.
    this.panel.addEventListener('input', onFieldChange);
    this.panel.addEventListener('change', onFieldChange);

    this._lastCombo = 0;
  }

  _command(cmd, arg) {
    switch (cmd) {
      case 'play':
        this.h.onPlay();
        break;
      case 'resume':
        this.h.onResume();
        break;
      case 'restart':
        this.h.onRestart();
        break;
      case 'menu':
        this.h.onMenu();
        break;
      case 'buy':
        this.h.onBuy(arg);
        break;
      case 'fullscreen':
        this.toggleFullscreen();
        break;
    }
  }

  toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }

  /** Enables the on-screen pad; it still only appears during actual play. */
  enableTouchpad(available) {
    this.touchAvailable = available;
    this._syncTouchpad('menu');
  }

  _syncTouchpad(stateName) {
    const show = !!this.touchAvailable && (stateName === 'playing' || stateName === 'shop');
    this.touchpad.hidden = !show;
    this.touchpad.setAttribute('aria-hidden', String(!show));
  }

  // -------------------------------------------------------------- rendering

  /** @param {number} fraction 0..1 */
  setProgress(fraction) {
    const fill = this.panel.querySelector('.bar__fill');
    if (fill) fill.style.width = `${Math.round(fraction * 100)}%`;
  }

  showLoading() {
    this._render(
      'loading',
      `<div class="card">
         <h2 id="panel-title">Loading…</h2>
         <p>Waking up the flies.</p>
         <div class="bar"><div class="bar__fill"></div></div>
       </div>`,
    );
    this.hud.hidden = true;
  }

  showMenu({ best }) {
    const tracks = SOUNDTRACKS.map(
      (t, i) => `<option value="${i}"${i === this.h.settings.get('track') ? ' selected' : ''}>${esc(t.name)}</option>`,
    ).join('');

    this._render(
      'menu',
      `<div class="card">
         <img class="card__logo" id="panel-title" src="img/logo.png" alt="Flygame" />
         <p class="card__lead">Jump on the flies. Collect their coins. Buy something louder.</p>
         <p><strong>Best score:</strong> ${best.toLocaleString()}</p>

         <div class="btn-row">
           <button class="btn btn--primary" data-cmd="play" autofocus>▶ Play</button>
           <button class="btn" data-cmd="fullscreen">⛶ Fullscreen</button>
         </div>

         <ul class="keys">
           <li><kbd>A</kbd><kbd>D</kbd> / <kbd>←</kbd><kbd>→</kbd> Move</li>
           <li><kbd>Space</kbd> / <kbd>W</kbd> Jump</li>
           <li><kbd>Click</kbd> / <kbd>J</kbd> Attack</li>
           <li><kbd>Wheel</kbd> / <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> Weapon</li>
           <li><kbd>Esc</kbd> Pause</li>
           <li>Walk off the left edge to shop</li>
         </ul>

         ${this._settingsMarkup(tracks)}
       </div>`,
    );
    this.hud.hidden = true;
  }

  showPause() {
    this._render(
      'paused',
      `<div class="card">
         <h2 id="panel-title">Paused</h2>
         <p>Take your time — nothing moves while this is open.</p>
         <div class="btn-row">
           <button class="btn btn--primary" data-cmd="resume" autofocus>Resume</button>
           <button class="btn" data-cmd="restart">Restart</button>
           <button class="btn" data-cmd="menu">Main menu</button>
         </div>
         ${this._settingsMarkup(
           SOUNDTRACKS.map(
             (t, i) => `<option value="${i}"${i === this.h.settings.get('track') ? ' selected' : ''}>${esc(t.name)}</option>`,
           ).join(''),
         )}
       </div>`,
    );
  }

  showGameOver({ score, best, newRecord }) {
    this._render(
      'gameover',
      `<div class="card">
         ${newRecord ? '<p class="record">New record</p>' : ''}
         <h2 id="panel-title">Swarmed</h2>
         <div class="score-line">
           <div><strong>${score.toLocaleString()}</strong><span>Score</span></div>
           <div><strong>${best.toLocaleString()}</strong><span>Best</span></div>
         </div>
         <div class="btn-row">
           <button class="btn btn--primary" data-cmd="restart" autofocus>Play again</button>
           <button class="btn" data-cmd="menu">Main menu</button>
         </div>
         <p class="hint">Press <kbd>Enter</kbd> to jump straight back in.</p>
       </div>`,
    );
    this.hud.hidden = false;
  }

  /** @param {{money: number, owned: Set<string>, equipped: string}} shop */
  showShop({ money, owned, equipped }) {
    const items = WEAPONS.map((w, i) => {
      const isOwned = owned.has(w.id);
      const affordable = money >= w.price;
      const label = isOwned ? (w.id === equipped ? 'Equipped' : 'Owned') : affordable ? 'Buy' : 'Too expensive';
      return `<li class="item" data-owned="${isOwned}">
        <div class="item__art"><img src="${ICONS[w.icon]}" alt="" /></div>
        <p class="item__name">${esc(w.name)} <kbd>${i + 1}</kbd></p>
        <p class="item__blurb">${esc(w.blurb)}</p>
        <p class="price">${
          isOwned ? '—' : `${w.price} <img src="img/coin_1.png" alt="coins" />`
        }</p>
        <button class="btn btn--block ${!isOwned && affordable ? 'btn--primary' : ''}"
                data-cmd="buy" data-arg="${w.id}" ${isOwned || !affordable ? 'disabled' : ''}>${label}</button>
      </li>`;
    }).join('');

    this._render(
      'shop',
      `<div class="card card--wide">
         <h2 id="panel-title">The Shop</h2>
         <p>You have <span class="price">${money} <img src="img/coin_1.png" alt="coins" /></span></p>
         <ul class="shop-grid">${items}</ul>
         <p class="hint">Walk <strong>right</strong> to head back out. <kbd>1</kbd>–<kbd>3</kbd> switches weapon.</p>
       </div>`,
      { keepFocus: true },
    );
    this.hud.hidden = false;
  }

  /** Re-reads settings into any control currently on screen (e.g. after `M`). */
  syncSettings() {
    for (const field of this.panel.querySelectorAll('[data-setting]')) {
      const value = this.h.settings.get(field.dataset.setting);
      if (field.type === 'checkbox') field.checked = !!value;
      else field.value = value;
    }
  }

  hidePanel() {
    // Move focus out before emptying the panel, or the browser drops it on
    // <body> and the next Tab starts from the top of the document.
    if (this.panel.contains(document.activeElement)) document.activeElement.blur();
    this._stateName = null;
    this.panel.hidden = true;
    this.panel.innerHTML = '';
    this.hud.hidden = false;
    this.hud.inert = false;
  }

  _settingsMarkup(trackOptions) {
    const s = this.h.settings;
    return `<div class="settings">
      <div class="field">
        <label for="set-track">Soundtrack</label>
        <select id="set-track" data-setting="track">${trackOptions}</select>
      </div>
      <div class="field">
        <label for="set-volume">Volume</label>
        <input id="set-volume" type="range" min="0" max="1" step="0.05"
               value="${s.get('volume')}" data-setting="volume" />
      </div>
      <div class="field">
        <label>Options</label>
        <div>
          <label class="switch">
            <input type="checkbox" data-setting="muted" ${s.get('muted') ? 'checked' : ''} /> Mute
          </label>
          <label class="switch">
            <input type="checkbox" data-setting="screenShake" ${s.get('screenShake') ? 'checked' : ''} /> Screen shake
          </label>
        </div>
      </div>
    </div>`;
  }

  _render(stateName, html, { keepFocus = false } = {}) {
    const activeId = keepFocus && document.activeElement?.dataset?.arg;
    const reRender = !this.panel.hidden && this._stateName === stateName;
    this._stateName = stateName;
    this.stage.dataset.state = stateName;
    this._syncTouchpad(stateName);
    this.panel.className = `panel panel--${stateName}`;
    // Buying an item re-renders the shop card; replaying the fade would flash.
    this.panel.style.animation = reRender ? 'none' : '';
    this.panel.hidden = false;
    // The panel is a modal dialog, so the HUD behind it must not be reachable
    // by Tab, by a click, or by a screen reader.
    this.hud.inert = true;
    this.panel.innerHTML = html;

    // Restore focus onto the equivalent control after a shop re-render, else
    // move it to the panel's primary action so keyboard users are never lost.
    const restore = activeId && this.panel.querySelector(`[data-arg="${activeId}"]:not([disabled])`);
    (restore || this.panel.querySelector('[autofocus]') || this.panel.querySelector('button'))?.focus();
  }

  // -------------------------------------------------------------------- HUD

  setHud({ score, money, lives, maxLives, combo, weapon, owned }, best) {
    this.el.score.textContent = score.toLocaleString();
    this.el.money.textContent = money;
    if (best !== undefined) this.el.best.textContent = Math.max(best, score).toLocaleString();

    this.el.lives.textContent = '';
    this.el.lives.setAttribute('aria-label', `${lives} of ${maxLives} lives remaining`);
    for (let i = 0; i < maxLives; i += 1) {
      const heart = document.createElement('span');
      heart.textContent = '♥';
      heart.className = i < lives ? '' : 'is-lost';
      this.el.lives.append(heart);
    }

    if (combo > 1) {
      if (combo !== this._lastCombo) {
        this.el.combo.textContent = `${combo}× COMBO`;
        this.el.combo.hidden = false;
        // Restart the pop animation.
        this.el.combo.style.animation = 'none';
        void this.el.combo.offsetWidth;
        this.el.combo.style.animation = '';
      }
    } else {
      this.el.combo.hidden = true;
    }
    this._lastCombo = combo;

    const ownedSet = new Set(owned);
    const list = WEAPONS.filter((w) => ownedSet.has(w.id));
    const signature = `${list.map((w) => w.id).join()}|${weapon}`;
    if (signature !== this._slotSignature) {
      this._slotSignature = signature;
      this.el.slots.textContent = '';
      list.forEach((w, i) => {
        const li = document.createElement('li');
        li.className = 'slot';
        li.dataset.active = String(w.id === weapon);
        li.dataset.key = String(i + 1);
        li.title = w.name;
        const icon = document.createElement('img');
        icon.src = ICONS[w.icon];
        icon.alt = w.name;
        li.append(icon);
        this.el.slots.append(li);
      });
    }
  }

  syncStage(state) {
    const name = state === State.PLAYING ? 'playing' : state;
    this.stage.dataset.state = name;
    this._syncTouchpad(name);
  }
}
