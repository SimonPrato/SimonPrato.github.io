/**
 * Bootstrap and the main loop.
 *
 * The loop is a fixed-timestep accumulator on requestAnimationFrame: physics
 * always advances in 1/60 s steps, rendering happens once per animation frame.
 * The original ran `setInterval(fn, 1)` and then called the update function
 * between one and thirteen times per tick depending on how far the wall clock
 * had drifted — which is why it played differently on every machine.
 */

import { loadAll } from './assets.js';
import { audio } from './audio.js';
import { Game, State } from './game.js';
import { Input } from './input.js';
import { Renderer } from './renderer.js';
import { settings } from './storage.js';
import { UI } from './ui.js';

const STEP = 1 / 60;
/** Never simulate more than this much time in one frame (tab-switch guard). */
const MAX_FRAME = 0.25;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const canvas = document.getElementById('game');
const renderer = new Renderer(canvas, document.documentElement);
const input = new Input().attach(canvas, renderer);

let game;
let ui;

const shakeEnabled = () => settings.get('screenShake') && !prefersReducedMotion.matches;

// --------------------------------------------------------------- state wiring

function onStateChange(state) {
  ui.syncStage(state);
  switch (state) {
    case State.MENU:
      audio.stopMusic();
      ui.showMenu({ best: settings.get('highScore') });
      break;
    case State.PLAYING:
      ui.hidePanel();
      ui.setHud(game.hudState(), settings.get('highScore'));
      audio.playMusic();
      break;
    case State.SHOP:
      ui.showShop({ money: game.money, owned: game.owned, equipped: game.player.weapon });
      break;
    case State.PAUSED:
      ui.showPause();
      break;
    case State.GAME_OVER:
      ui.showGameOver({
        score: game.score,
        best: settings.get('highScore'),
        newRecord: game.newRecord,
      });
      break;
  }
}

function applySetting(key, value) {
  settings.set(key, value);
  ui.syncSettings();
  switch (key) {
    case 'volume':
      audio.unlock();
      audio.setVolume(value);
      break;
    case 'muted':
      audio.setMuted(value);
      break;
    case 'track':
      audio.unlock();
      audio.selectTrack(Number(value));
      break;
    case 'screenShake':
      game.hooks.screenShake = shakeEnabled();
      break;
  }
}

// ------------------------------------------------------------------ main loop

let last = 0;
let accumulator = 0;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000 || 0, MAX_FRAME);
  last = now;

  accumulator += dt;
  let steps = 0;
  while (accumulator >= STEP && steps < 8) {
    game.update(STEP);
    accumulator -= STEP;
    steps += 1;
  }
  if (steps === 8) accumulator = 0;

  renderer.updateShake(dt);
  game.render();
}

// ---------------------------------------------------------------- global keys

window.addEventListener('keydown', (e) => {
  // Keys pressed while the assets are still loading have nothing to act on.
  if (!game) return;
  if (e.target instanceof HTMLElement && e.target.closest('input, select, textarea')) return;

  if (e.code === 'Escape' || e.code === 'KeyP') {
    e.preventDefault();
    if (game.state === State.PAUSED) game.resume();
    else game.pause();
    return;
  }
  if (e.code === 'KeyF') {
    e.preventDefault();
    ui.toggleFullscreen();
    return;
  }
  if (e.code === 'KeyM') {
    e.preventDefault();
    applySetting('muted', !settings.get('muted'));
    return;
  }
  if (e.code === 'Enter' || e.code === 'NumpadEnter') {
    // Enter is the universal "continue". Activate whichever panel button has
    // focus, falling back to the primary action — the original screen promised
    // "PRESS ENTER" and it should hold wherever focus happens to be.
    const panel = document.getElementById('panel');
    if (panel.hidden) return;
    const focused = document.activeElement;
    const target =
      focused instanceof HTMLButtonElement && panel.contains(focused)
        ? focused
        : panel.querySelector('button[autofocus]:not([disabled])');
    if (target) {
      e.preventDefault();
      target.click();
    }
  }
});

// Any first interaction is our chance to legally start audio.
for (const type of ['pointerdown', 'keydown']) {
  window.addEventListener(type, () => audio.unlock(), { once: true });
}

// The rotate gate is drawn by CSS; this just stops the run behind it so nobody
// loses a life to a screen they cannot see.
const portraitGate = window.matchMedia('(orientation: portrait) and (pointer: coarse)');
portraitGate.addEventListener('change', (e) => {
  if (e.matches) game?.pause();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    audio.suspend();
    game?.pause();
  } else {
    audio.resume();
  }
});

// ---------------------------------------------------------------------- start

async function boot() {
  ui = new UI({
    settings,
    onPlay: () => game.start(),
    onResume: () => game.resume(),
    onRestart: () => game.start(),
    onMenu: () => game.setState(State.MENU),
    onPause: () => game.pause(),
    onBuy: (id) => game.buy(id),
    onSetting: applySetting,
  });

  ui.showLoading();
  ui.enableTouchpad(window.matchMedia('(pointer: coarse)').matches);
  input.attachTouchPad(document.getElementById('touchpad'));

  try {
    await loadAll((p) => ui.setProgress(p));
  } catch (err) {
    document.getElementById('panel').innerHTML =
      `<div class="card"><h2>Could not load the game</h2><p>${err.message}</p></div>`;
    return;
  }

  game = new Game(renderer, input, {
    screenShake: shakeEnabled(),
    onStateChange,
    onHud: (hud) => ui.setHud(hud, settings.get('highScore')),
    onShopChange: () =>
      ui.showShop({ money: game.money, owned: game.owned, equipped: game.player.weapon }),
    submitScore: (score) => settings.submitScore(score),
  });

  audio.setVolume(settings.get('volume'));
  audio.setMuted(settings.get('muted'));
  audio.selectTrack(settings.get('track'));

  // Opt-in handle for poking at a running game from the console or a test
  // driver: open the page with ?debug and use window.flygame.
  if (new URLSearchParams(location.search).has('debug')) {
    window.flygame = { game, ui, audio, renderer, input, settings, State };
  }

  onStateChange(State.MENU);
  last = performance.now();
  requestAnimationFrame(frame);
}

boot();
