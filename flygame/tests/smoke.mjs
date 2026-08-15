/**
 * Smoke tests for the simulation.
 *
 *   node tests/smoke.mjs
 *
 * These run the real game modules against a tiny DOM stub (tests/dom-stub.mjs),
 * so there is nothing to install and nothing to keep in sync with a browser.
 * They cover the things that used to break silently: physics that depends on
 * frame rate, pools that grow without bound, state transitions that strand the
 * player, and draw calls that reference a sprite which never loaded.
 */

import { installDom } from './dom-stub.mjs';

installDom();

const { Game, State } = await import('../src/game.js');
const { Input } = await import('../src/input.js');
const { Renderer } = await import('../src/renderer.js');
const { loadAll } = await import('../src/assets.js');
const { GROUND_Y, PLAYER, ENEMY, VIEW, BULLET } = await import('../src/config.js');

await loadAll();

const canvas = document.getElementById('game');
const renderer = new Renderer(canvas);
const input = new Input();

const results = [];

function check(name, fn) {
  input.releaseAll();
  input.hasPointer = false;
  input.endFrame();
  try {
    const problem = fn();
    results.push({ name, ok: !problem, detail: problem });
  } catch (err) {
    results.push({ name, ok: false, detail: `${err.name}: ${err.message}` });
  }
}

/** Advances the simulation by `seconds` at the real fixed timestep. */
const run = (game, seconds) => {
  for (let i = 0; i < Math.round(seconds * 60); i += 1) game.update(1 / 60);
};

const make = () =>
  new Game(renderer, input, { screenShake: false, submitScore: () => false });

// ------------------------------------------------------------------ lifecycle

check('starts in the menu', () => {
  const g = make();
  if (g.state !== State.MENU) return `state was ${g.state}`;
});

check('start() resets score, coins and lives', () => {
  const g = make();
  g.score = 999;
  g.money = 5;
  g.player.lives = 1;
  g.owned.add('shotgun');
  g.start();
  if (g.state !== State.PLAYING) return `state was ${g.state}`;
  if (g.score !== 0 || g.money !== 0) return 'score/money not reset';
  if (g.player.lives !== PLAYER.LIVES) return 'lives not reset';
  if (g.owned.has('shotgun')) return 'purchases carried over into a new run';
});

check('two minutes of idle simulation never throws', () => {
  const g = make();
  g.start();
  run(g, 120);
});

check('the enemy pool never exceeds its cap', () => {
  const g = make();
  g.start();
  let peak = 0;
  for (let i = 0; i < 60 * 90; i += 1) {
    g.update(1 / 60);
    let alive = 0;
    for (const e of g.enemies) if (e.alive) alive += 1;
    if (alive > peak) peak = alive;
  }
  if (peak > ENEMY.MAX_ALIVE) return `peak ${peak} > cap ${ENEMY.MAX_ALIVE}`;
  if (peak < 2) return 'enemies never spawned';
});

check('difficulty raises the roster instead of the entity count', () => {
  const g = make();
  g.start();
  g.score = 6000;
  const kinds = new Set();
  for (let i = 0; i < 400; i += 1) kinds.add(g.rollEnemyType());
  if (!kinds.has('bomber')) return 'bombers never appear at high score';
  if (!kinds.has('gold')) return 'gold flies never appear at high score';
});

// -------------------------------------------------------------------- physics

check('the simulation is frame-rate independent', () => {
  // Same elapsed time, different step counts -> same position.
  const a = make();
  const b = make();
  a.start();
  b.start();
  input.right = true;
  for (let i = 0; i < 60; i += 1) a.update(1 / 60);
  for (let i = 0; i < 120; i += 1) b.update(1 / 120);
  input.right = false;
  if (Math.abs(a.player.x - b.player.x) > 0.5) {
    return `x drifted: ${a.player.x.toFixed(2)} vs ${b.player.x.toFixed(2)}`;
  }
});

check('jump leaves the ground and lands again', () => {
  const g = make();
  g.start();
  input.jumpPressed = true;
  input.jumpHeld = true;
  g.update(1 / 60);
  if (g.player.y >= GROUND_Y - PLAYER.H) return 'never left the ground';
  input.jumpPressed = false;
  run(g, 3);
  if (Math.abs(g.player.y - (GROUND_Y - PLAYER.H)) > 1) return `landed at y = ${g.player.y}`;
  if (!g.player.onGround) return 'onGround never returned to true';
});

check('a buffered jump still fires just after landing', () => {
  const g = make();
  g.start();
  g.player.y = GROUND_Y - PLAYER.H - 12;
  g.player.vy = 400;
  g.player.onGround = false;
  input.jumpPressed = true;
  input.jumpHeld = true;
  run(g, 0.1);
  if (g.player.vy >= 0) return 'the buffered jump was dropped';
});

check('the player stays inside the arena', () => {
  const g = make();
  g.start();
  input.right = true;
  run(g, 10);
  input.right = false;
  if (g.player.x > PLAYER.MAX_X + 0.001) return `x = ${g.player.x}`;
});

// ----------------------------------------------------------------------- shop

check('walking off the left edge opens the shop, walking right leaves it', () => {
  const g = make();
  g.start();
  input.left = true;
  run(g, 3);
  input.left = false;
  if (g.state !== State.SHOP) return `state was ${g.state}`;
  input.right = true;
  run(g, 5);
  input.right = false;
  if (g.state !== State.PLAYING) return `did not leave the shop (${g.state})`;
});

check('leaving the shop does not bounce straight back into it', () => {
  const g = make();
  g.start();
  g.enterShop();
  g.leaveShop();
  g.update(1 / 60);
  if (g.state !== State.PLAYING) return 'fell back into the shop on the next frame';
});

check('buying is refused without coins and works with them', () => {
  const g = make();
  g.start();
  if (g.buy('shotgun') !== false) return 'bought a shotgun for free';
  g.money = 10;
  if (g.buy('shotgun') !== true) return 'could not buy with coins';
  if (!g.owned.has('shotgun')) return 'shotgun missing after purchase';
  if (g.money !== 8) return `money was ${g.money}, expected 8`;
  if (g.buy('shotgun') !== false) return 'bought the same weapon twice';
  if (g.buy('nonexistent') !== false) return 'bought an item that does not exist';
});

check('weapon cycling only visits owned weapons', () => {
  const g = make();
  g.start();
  g.money = 99;
  g.buy('axe');
  const seen = new Set();
  for (let i = 0; i < 6; i += 1) {
    g.cycleWeapon(1);
    seen.add(g.player.weapon);
  }
  if (seen.has('shotgun')) return 'cycled onto an unowned shotgun';
  if (seen.size !== 2) return `visited ${seen.size} weapons, expected 2`;
});

// --------------------------------------------------------------------- combat

check('a stomp kills the enemy, scores, and bounces the player', () => {
  const g = make();
  g.start();
  const e = g.enemies.find((x) => x.alive);
  e.x = 800;
  e.y = ENEMY.SPAWN_Y;
  e.vx = 0;
  g.player.x = 800;
  g.player.y = e.y - 60;
  g.player.vy = 900;
  g.update(1 / 60);
  if (!e.dying) return 'the enemy survived the stomp';
  if (g.score <= 0) return 'no score awarded';
  if (g.player.vy >= 0) return 'no bounce after the stomp';
});

check('walking into an enemy costs a life instead of scoring', () => {
  const g = make();
  g.start();
  const e = g.enemies.find((x) => x.alive);
  e.x = 800;
  e.y = GROUND_Y - ENEMY.H;
  e.vx = 0;
  g.player.x = 800;
  g.player.y = GROUND_Y - PLAYER.H;
  g.player.vy = 0;
  g.update(1 / 60);
  if (g.player.lives !== PLAYER.LIVES - 1) return `lives = ${g.player.lives}`;
  if (e.dying) return 'the enemy died from a side-on collision';
});

check('shotgun pellets kill an enemy', () => {
  const g = make();
  g.start();
  g.money = 10;
  g.buy('shotgun');
  const e = g.enemies.find((x) => x.alive);
  e.x = 900;
  e.y = 700;
  e.vx = 0;
  g.player.x = 300;
  g.player.y = GROUND_Y - PLAYER.H;
  input.hasPointer = true;
  input.aim = { x: e.x + ENEMY.W / 2, y: e.y + ENEMY.H / 2 };
  input.fireHeld = true;
  run(g, 0.6);
  input.fireHeld = false;
  if (!e.dying && e.alive) return 'the enemy survived a direct blast';
});

check('the shotgun respects its cooldown', () => {
  const g = make();
  g.start();
  g.money = 10;
  g.buy('shotgun');
  run(g, 0.2); // let the short delay applied when equipping expire
  input.hasPointer = true;
  input.aim = { x: 1900, y: 800 };
  input.fireHeld = true;
  g.update(1 / 60);
  const firstShot = g.bullets.filter((b) => b.alive).length;
  g.update(1 / 60);
  const afterOneFrame = g.bullets.filter((b) => b.alive).length;
  input.fireHeld = false;
  if (firstShot !== BULLET.PELLETS) return `fired ${firstShot} pellets, expected ${BULLET.PELLETS}`;
  if (afterOneFrame > firstShot) return 'fired again before the cooldown elapsed';
});

check('bullets are recycled rather than accumulating', () => {
  const g = make();
  g.start();
  g.money = 10;
  g.buy('shotgun');
  input.hasPointer = true;
  input.aim = { x: 1900, y: 800 };
  input.fireHeld = true;
  run(g, 20);
  input.fireHeld = false;
  if (g.bullets.length !== 40) return `bullet pool grew to ${g.bullets.length}`;
});

check('the axe kills what is directly in front of the player', () => {
  const g = make();
  g.start();
  g.money = 10;
  g.buy('axe');
  const e = g.enemies.find((x) => x.alive);
  g.player.x = 600;
  g.player.facing = 1;
  e.x = 700;
  e.y = g.player.y;
  e.vx = 0;
  g.swingAxe();
  if (!e.dying) return 'the enemy survived the swing';
});

check('a tap too fast to span a frame still attacks', () => {
  const g = make();
  g.start();
  g.money = 10;
  g.buy('shotgun');
  run(g, 0.3); // clear the equip delay
  input.hasPointer = true;
  input.aim = { x: 1900, y: 800 };
  // Down and up inside a single frame: only the edge flag survives.
  input.firePressed = true;
  input.fireHeld = false;
  g.update(1 / 60);
  if (!g.bullets.some((b) => b.alive)) return 'the tap was dropped';
});

check('the axe does not reach behind the player', () => {
  const g = make();
  g.start();
  g.money = 10;
  g.buy('axe');
  const e = g.enemies.find((x) => x.alive);
  g.player.x = 600;
  g.player.facing = 1;
  e.x = 300;
  e.y = g.player.y;
  e.vx = 0;
  g.swingAxe();
  if (e.dying) return 'the swing hit an enemy behind the player';
});

check('three hits end the run', () => {
  const g = make();
  g.start();
  for (let i = 0; i < PLAYER.LIVES; i += 1) {
    g.player.invuln = 0;
    g.hurtPlayer();
  }
  if (g.state !== State.GAME_OVER) return `state was ${g.state}`;
});

check('invulnerability absorbs repeated hits', () => {
  const g = make();
  g.start();
  g.hurtPlayer();
  g.hurtPlayer();
  g.hurtPlayer();
  if (g.player.lives !== PLAYER.LIVES - 1) return `lives = ${g.player.lives}`;
});

check('the combo multiplier decays and is capped', () => {
  const g = make();
  g.start();
  for (let i = 0; i < 20; i += 1) {
    const e = g.enemies.find((x) => x.alive && !x.dying) ?? (g.spawnEnemy(), g.enemies.find((x) => x.alive && !x.dying));
    if (e) g.killEnemy(e, true);
  }
  if (g.combo > 5) return `combo reached ${g.combo}`;
  run(g, 3);
  if (g.combo !== 0) return 'the combo never expired';
});

// ---------------------------------------------------------------------- coins

check('coins can be collected and add money', () => {
  const g = make();
  g.start();
  g.dropCoin(g.player.x + PLAYER.W / 2, g.player.y + PLAYER.H / 2);
  run(g, 0.5);
  if (g.money < 1) return 'the coin was never picked up';
});

check('uncollected coins expire instead of piling up', () => {
  const g = make();
  g.start();
  g.player.x = 100;
  g.player.lives = 999; // the run must survive long enough for coins to time out
  for (let i = 0; i < 5; i += 1) g.dropCoin(1700, 300);
  run(g, 20);
  if (g.coins.some((c) => c.alive)) return 'coins never despawned';
});

check('dropping more coins than the pool holds is safe', () => {
  const g = make();
  g.start();
  for (let i = 0; i < 200; i += 1) g.dropCoin(1700, 300);
  if (g.coins.length !== 12) return `coin pool grew to ${g.coins.length}`;
  if (g.coins.some((c) => c === undefined)) return 'a hole was punched in the pool';
});

// -------------------------------------------------------------------- bombers

check('a bomber drops a bomb that explodes on the ground', () => {
  const g = make();
  g.start();
  const e = g.enemies.find((x) => x.alive);
  e.type = 'bomber';
  e.y = ENEMY.BOMBER_ALTITUDE;
  e.x = 1000;
  e.bombTimer = 0;
  g.player.x = 100;
  let sawBomb = false;
  for (let i = 0; i < 60 * 5; i += 1) {
    g.update(1 / 60);
    if (g.bombs.some((b) => b.alive)) sawBomb = true;
    if (sawBomb && g.blasts.some((b) => b.alive)) return undefined;
  }
  return sawBomb ? 'the bomb never exploded' : 'the bomber never dropped a bomb';
});

check('a blast standing on top of the player costs a life', () => {
  const g = make();
  g.start();
  g.player.x = 800;
  g.explode(g.player.x + PLAYER.W / 2, g.player.y + PLAYER.H * 0.7);
  if (g.player.lives !== PLAYER.LIVES - 1) return `lives = ${g.player.lives}`;
});

// --------------------------------------------------------------------- render

check('rendering every state completes without throwing', () => {
  const g = make();
  g.start();
  g.money = 10;
  g.buy('shotgun');
  run(g, 4);
  for (const state of Object.values(State)) {
    g.state = state;
    g.render();
  }
  if (renderer.ctx._depth !== 0) return `unbalanced save/restore (depth ${renderer.ctx._depth})`;
});

check('rendering draws every live entity kind without a missing sprite', () => {
  const g = make();
  g.start();
  g.money = 10;
  g.buy('axe');
  const [a, b, c] = g.enemies;
  Object.assign(a, { alive: true, dying: false, type: 'fly', x: 400, y: 700, vx: -100, spawnFlash: 0, bombTimer: 9 });
  Object.assign(b, { alive: true, dying: false, type: 'gold', x: 800, y: 600, vx: 100, spawnFlash: 0, bombTimer: 9 });
  Object.assign(c, { alive: true, dying: false, type: 'bomber', x: 1200, y: 220, vx: -100, spawnFlash: 0, bombTimer: 9 });
  g.dropBomb(c);
  g.explode(600, 800);
  g.dropCoin(500, 600);
  g.spawnPoof(300, 700);
  g.spawnPopup(300, 600, '+100', '#fff');
  g.player.swing = 0.1;
  const before = renderer.ctx.drawn;
  g.render();
  if (renderer.ctx.drawn - before < 8) return `only ${renderer.ctx.drawn - before} sprites drawn`;
});

check('dying enemies render through their whole animation', () => {
  const g = make();
  g.start();
  const e = g.enemies.find((x) => x.alive);
  g.killEnemy(e, false);
  let freed = false;
  for (let i = 0; i < 40; i += 1) {
    g.update(1 / 60);
    g.render();
    // The slot may immediately be recycled for a new spawn, so watch for the
    // moment it is released rather than its state at the end.
    if (!e.alive || !e.dying) freed = true;
  }
  if (!freed) return 'the corpse never despawned';
});

// ---------------------------------------------------------------------- state

check('pause freezes the simulation and resumes where it left off', () => {
  const g = make();
  g.start();
  run(g, 1);
  g.pause();
  const before = { x: g.player.x, score: g.score };
  input.right = true;
  run(g, 2);
  input.right = false;
  if (g.player.x !== before.x) return 'the player moved while paused';
  if (g.score !== before.score) return 'the score changed while paused';
  g.resume();
  if (g.state !== State.PLAYING) return `resume landed on ${g.state}`;
});

check('pausing inside the shop returns to the shop', () => {
  const g = make();
  g.start();
  g.enterShop();
  g.pause();
  g.resume();
  if (g.state !== State.SHOP) return `resume landed on ${g.state}`;
});

check('enemies never drift outside the stage', () => {
  const g = make();
  g.start();
  run(g, 60);
  for (const e of g.enemies) {
    if (!e.alive) continue;
    if (e.x < -1 || e.x > ENEMY.SPAWN_X + 1) return `enemy at x = ${e.x}`;
    if (e.y < 0 || e.y > VIEW.H) return `enemy at y = ${e.y}`;
  }
});

// --------------------------------------------------------------------- report

const failed = results.filter((r) => !r.ok);
const pad = Math.max(...results.map((r) => r.name.length));
for (const r of results) {
  const mark = r.ok ? '\x1b[32m ok \x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  console.log(`${mark}  ${r.name.padEnd(pad)}${r.ok ? '' : `  — ${r.detail}`}`);
}
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
