/**
 * Game simulation and rendering.
 *
 * Runs on a fixed 60 Hz timestep driven from main.js, so physics is identical
 * on a 60 Hz laptop and a 144 Hz monitor. All entity storage is pre-allocated
 * and reused; the update loop allocates nothing, which keeps the GC quiet.
 */

import {
  VIEW,
  GROUND_Y,
  PLAYER,
  ENEMY,
  BOMB,
  BULLET,
  AXE,
  COIN,
  SCORE,
  DIFFICULTY_STEP,
  PORTAL,
  WEAPONS,
  BACKGROUNDS,
} from './config.js';
import { img, loadLazy } from './assets.js';
import { audio } from './audio.js';

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

/** Picks an animation frame index from elapsed time. */
const animFrame = (t, fps, frames) => Math.floor(t * fps) % frames;

function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export const State = Object.freeze({
  MENU: 'menu',
  PLAYING: 'playing',
  SHOP: 'shop',
  PAUSED: 'paused',
  GAME_OVER: 'gameover',
});

export class Game {
  /**
   * @param {import('./renderer.js').Renderer} renderer
   * @param {import('./input.js').Input} input
   * @param {{onStateChange?: Function, onHud?: Function, onShopChange?: Function, screenShake?: boolean}} hooks
   */
  constructor(renderer, input, hooks = {}) {
    this.r = renderer;
    this.input = input;
    this.hooks = hooks;
    this.state = State.MENU;
    this.time = 0;

    this.bgIndex = Math.floor(Math.random() * BACKGROUNDS.length);
    /** @type {HTMLImageElement | null} */
    this.bg = null;
    this.shopBg = null;
    // The menu previews the arena you are about to play in, which also warms
    // the cache for the very first frame of the run.
    this.preloadScenery();

    this.player = {
      x: 300,
      y: GROUND_Y - PLAYER.H,
      vy: 0,
      facing: 1,
      onGround: true,
      coyote: 0,
      jumpBuffer: 0,
      walking: false,
      weapon: 'fist',
      cooldown: 0,
      swing: -1,
      lives: PLAYER.LIVES,
      invuln: 0,
      pendingReload: 0,
    };

    this.enemies = Array.from({ length: ENEMY.MAX_ALIVE }, () => ({ alive: false }));
    this.bombs = Array.from({ length: 16 }, () => ({ alive: false }));
    this.blasts = Array.from({ length: 8 }, () => ({ alive: false }));
    this.bullets = Array.from({ length: 40 }, () => ({ alive: false }));
    this.coins = Array.from({ length: COIN.MAX }, () => ({ alive: false }));
    this.poofs = Array.from({ length: 12 }, () => ({ alive: false }));
    this.popups = Array.from({ length: 16 }, () => ({ alive: false }));

    this.owned = new Set(WEAPONS.filter((w) => w.owned).map((w) => w.id));
    this.reset();
  }

  // ---------------------------------------------------------------- lifecycle

  reset() {
    const p = this.player;
    p.x = 300;
    p.y = GROUND_Y - PLAYER.H;
    p.vy = 0;
    p.facing = 1;
    p.onGround = true;
    p.coyote = 0;
    p.jumpBuffer = 0;
    p.weapon = 'fist';
    p.cooldown = 0;
    p.swing = -1;
    p.lives = PLAYER.LIVES;
    p.invuln = 0;
    p.pendingReload = 0;

    this.score = 0;
    this.money = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.spawnTimer = 0.6;
    this.time = 0;
    this.newRecord = false;

    this.owned = new Set(WEAPONS.filter((w) => w.owned).map((w) => w.id));
    for (const list of [this.enemies, this.bombs, this.blasts, this.bullets, this.coins, this.poofs, this.popups]) {
      for (const e of list) e.alive = false;
    }
    this.spawnEnemy();
    this._emitHud();
  }

  /** Kicks off the (lazy) background download for the chosen level art. */
  preloadScenery() {
    loadLazy(BACKGROUNDS[this.bgIndex]).then((el) => (this.bg = el)).catch(() => {});
  }

  setState(next) {
    if (this.state === next) return;
    this.state = next;
    this.input.releaseAll();
    this.hooks.onStateChange?.(next);
  }

  start() {
    this.reset();
    this.preloadScenery();
    this.setState(State.PLAYING);
  }

  pause() {
    if (this.state === State.PLAYING || this.state === State.SHOP) {
      this._resumeTo = this.state;
      this.setState(State.PAUSED);
    }
  }

  resume() {
    if (this.state === State.PAUSED) this.setState(this._resumeTo ?? State.PLAYING);
  }

  get difficulty() {
    return Math.floor(this.score / DIFFICULTY_STEP);
  }

  // ------------------------------------------------------------------- update

  /** @param {number} dt fixed timestep in seconds */
  update(dt) {
    this.time += dt;
    switch (this.state) {
      case State.PLAYING:
        this.updateArena(dt);
        break;
      case State.SHOP:
        this.updateShop(dt);
        break;
      default:
        break;
    }
    this.input.endFrame();
  }

  updateArena(dt) {
    this.updatePlayer(dt);
    this.updateSpawning(dt);
    this.updateEnemies(dt);
    this.updateBombs(dt);
    this.updateBullets(dt);
    this.updateCoins(dt);
    this.updateEffects(dt);

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    // Walking off the left edge takes you to the shop.
    if (this.player.x <= PLAYER.MIN_X) {
      this.enterShop();
    }
  }

  updateShop(dt) {
    this.updatePlayer(dt, { combat: false });
    this.updateEffects(dt);
    if (this.player.x > VIEW.W * 0.88) this.leaveShop();
  }

  enterShop() {
    this.player.x = 120;
    this.player.vy = 0;
    this.player.y = GROUND_Y - PLAYER.H;
    if (!this.shopBg) loadLazy('img/shop.png').then((el) => (this.shopBg = el)).catch(() => {});
    this.setState(State.SHOP);
  }

  leaveShop() {
    this.player.x = 60;
    this.setState(State.PLAYING);
  }

  updatePlayer(dt, { combat = true } = {}) {
    const p = this.player;
    const inp = this.input;

    // --- horizontal ---
    const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    p.walking = dir !== 0;
    if (dir) p.x += dir * PLAYER.SPEED * dt;
    p.x = clamp(p.x, PLAYER.MIN_X - 40, PLAYER.MAX_X);

    // --- jumping, with coyote time and an input buffer ---
    if (inp.jumpPressed) p.jumpBuffer = PLAYER.JUMP_BUFFER;
    p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
    p.coyote = p.onGround ? PLAYER.COYOTE : Math.max(0, p.coyote - dt);

    if (p.jumpBuffer > 0 && p.coyote > 0) {
      p.vy = -PLAYER.JUMP_V;
      p.onGround = false;
      p.coyote = 0;
      p.jumpBuffer = 0;
    }

    // Releasing jump early cuts the arc short — standard variable-height jump.
    if (!inp.jumpHeld && p.vy < -PLAYER.JUMP_V * 0.35) p.vy = -PLAYER.JUMP_V * 0.35;

    p.vy += PLAYER.GRAVITY * dt;
    p.y += p.vy * dt;

    const floor = GROUND_Y - PLAYER.H;
    if (p.y >= floor) {
      p.y = floor;
      p.vy = 0;
      p.onGround = true;
    } else {
      p.onGround = false;
    }

    if (p.invuln > 0) p.invuln -= dt;

    // --- aiming & facing ---
    const muzzle = this.muzzle();
    let aim = inp.aim;
    if (!inp.hasPointer) {
      const target = this.nearestEnemy(muzzle.x, muzzle.y);
      aim = target
        ? { x: target.x + ENEMY.W / 2, y: target.y + ENEMY.H / 2 }
        : { x: muzzle.x + p.facing * 400, y: muzzle.y };
    }
    this.aimAngle = Math.atan2(aim.y - muzzle.y, aim.x - muzzle.x);
    if (combat && p.weapon !== 'fist') {
      p.facing = Math.cos(this.aimAngle) >= 0 ? 1 : -1;
    } else if (dir) {
      p.facing = dir;
    }

    // --- weapon switching ---
    if (inp.weaponStep) this.cycleWeapon(inp.weaponStep);
    if (inp.weaponSlot) {
      const w = WEAPONS[inp.weaponSlot - 1];
      if (w && this.owned.has(w.id)) this.equip(w.id);
    }

    // --- attacking ---
    p.cooldown = Math.max(0, p.cooldown - dt);
    if (p.pendingReload > 0) {
      p.pendingReload -= dt;
      if (p.pendingReload <= 0) audio.play('reload', { volume: 0.5 });
    }
    if (p.swing >= 0) {
      p.swing += dt;
      if (p.swing > AXE.SWING_TIME) p.swing = -1;
    }
    // `firePressed` as well as `fireHeld`: a click fast enough to go down and up
    // between two frames would otherwise never be seen at all.
    if (combat && (inp.fireHeld || inp.firePressed) && p.cooldown === 0) {
      if (p.weapon === 'shotgun') this.fireShotgun();
      else if (p.weapon === 'axe') this.swingAxe();
    }
  }

  muzzle() {
    const p = this.player;
    return { x: p.x + PLAYER.W / 2 + p.facing * 18, y: p.y + 88 };
  }

  equip(id) {
    if (this.player.weapon === id) return;
    this.player.weapon = id;
    this.player.cooldown = 0.12;
    this.hooks.onHud?.(this.hudState());
  }

  cycleWeapon(step) {
    const list = WEAPONS.filter((w) => this.owned.has(w.id));
    if (list.length < 2) return;
    const at = list.findIndex((w) => w.id === this.player.weapon);
    const next = (((at + step) % list.length) + list.length) % list.length;
    this.equip(list[next].id);
  }

  buy(id) {
    const item = WEAPONS.find((w) => w.id === id);
    if (!item || this.owned.has(id) || this.money < item.price) return false;
    this.money -= item.price;
    this.owned.add(id);
    this.equip(id);
    audio.play('coin', { rate: 0.8 });
    this._emitHud();
    // Only refresh the shop card while the shop is actually open — otherwise a
    // purchase would paint the panel back over live gameplay.
    if (this.state === State.SHOP) this.hooks.onShopChange?.();
    return true;
  }

  fireShotgun() {
    const p = this.player;
    p.cooldown = BULLET.COOLDOWN;
    p.pendingReload = BULLET.RELOAD_CUE;
    audio.play('shot', { volume: 0.6, rate: rand(0.96, 1.05) });
    this.r.shake(7, this.hooks.screenShake);

    const m = this.muzzle();
    for (let i = 0; i < BULLET.PELLETS; i += 1) {
      const b = this.bullets.find((x) => !x.alive);
      if (!b) break;
      const spread = BULLET.PELLETS === 1 ? 0 : (i / (BULLET.PELLETS - 1) - 0.5) * BULLET.SPREAD;
      const a = this.aimAngle + spread;
      b.alive = true;
      b.x = m.x;
      b.y = m.y;
      b.vx = Math.cos(a) * BULLET.SPEED;
      b.vy = Math.sin(a) * BULLET.SPEED;
      b.angle = a;
      b.life = BULLET.LIFETIME;
      b.born = this.time;
    }
  }

  swingAxe() {
    const p = this.player;
    p.cooldown = AXE.COOLDOWN;
    p.swing = 0;
    this.r.shake(3, this.hooks.screenShake);

    const bx = p.facing > 0 ? p.x + PLAYER.W * 0.55 : p.x + PLAYER.W * 0.45 - AXE.REACH;
    const by = p.y + (PLAYER.H - AXE.ARC_H) / 2;
    let hit = false;
    for (const e of this.enemies) {
      if (!e.alive || e.dying) continue;
      if (overlaps(bx, by, AXE.REACH, AXE.ARC_H, e.x + ENEMY.HIT.x, e.y + ENEMY.HIT.y, ENEMY.HIT.w, ENEMY.HIT.h)) {
        this.killEnemy(e, false);
        hit = true;
      }
    }
    if (hit) this.r.shake(6, this.hooks.screenShake);
  }

  // ------------------------------------------------------------------ enemies

  updateSpawning(dt) {
    const alive = this.enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0);
    if (alive >= ENEMY.MAX_ALIVE) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    const interval = Math.max(
      ENEMY.SPAWN_INTERVAL_MIN,
      ENEMY.SPAWN_INTERVAL - this.difficulty * 0.35,
    );
    this.spawnTimer = interval * rand(0.75, 1.25);
    this.spawnEnemy();
  }

  spawnEnemy() {
    const e = this.enemies.find((x) => !x.alive);
    if (!e) return;
    e.alive = true;
    e.dying = false;
    e.deathTimer = 0;
    e.x = ENEMY.SPAWN_X;
    e.y = ENEMY.SPAWN_Y;
    e.type = this.rollEnemyType();
    e.vx = -(ENEMY.BASE_SPEED + this.difficulty * ENEMY.SPEED_PER_LEVEL) * rand(0.85, 1.15);
    e.bombTimer = rand(0.8, 2.4);
    e.spawnFlash = 0.35;
  }

  rollEnemyType() {
    const r = Math.random();
    if (this.difficulty >= 1) {
      if (r < 0.13) return 'gold';
      if (r < 0.46) return 'bomber';
      return 'fly';
    }
    return r < 0.2 ? 'gold' : 'fly';
  }

  updateEnemies(dt) {
    const p = this.player;
    for (const e of this.enemies) {
      if (!e.alive) continue;

      if (e.dying) {
        e.deathTimer += dt;
        if (e.deathTimer >= ENEMY.DEATH_ANIM) e.alive = false;
        continue;
      }

      if (e.spawnFlash > 0) e.spawnFlash -= dt;

      e.x += e.vx * dt;
      if (e.x <= 0) {
        e.x = 0;
        e.vx = Math.abs(e.vx);
      } else if (e.x >= ENEMY.SPAWN_X) {
        e.x = ENEMY.SPAWN_X;
        e.vx = -Math.abs(e.vx);
      }

      if (e.type === 'bomber') {
        if (e.y > ENEMY.BOMBER_ALTITUDE) e.y = Math.max(ENEMY.BOMBER_ALTITUDE, e.y - ENEMY.BOMBER_CLIMB * dt);
        else e.y = ENEMY.BOMBER_ALTITUDE + Math.sin(this.time * 2 + e.x * 0.01) * 22;
        e.bombTimer -= dt;
        if (e.bombTimer <= 0 && e.y <= ENEMY.BOMBER_ALTITUDE + 30) {
          e.bombTimer = rand(1.4, 3.4) / (1 + this.difficulty * 0.2);
          this.dropBomb(e);
        }
      }

      // --- player collision ---
      const ph = { x: p.x + PLAYER.HIT.x, y: p.y + PLAYER.HIT.y, w: PLAYER.HIT.w, h: PLAYER.HIT.h };
      const eh = { x: e.x + ENEMY.HIT.x, y: e.y + ENEMY.HIT.y, w: ENEMY.HIT.w, h: ENEMY.HIT.h };
      if (!overlaps(ph.x, ph.y, ph.w, ph.h, eh.x, eh.y, eh.w, eh.h)) continue;

      // A stomp is "falling, and last frame my feet were above the fly's
      // lower edge". The generous band is deliberate: at full falling speed the
      // player covers 25 px per frame, so a stricter test drops real stomps.
      const stomping = p.vy > 0 && ph.y + ph.h - p.vy * dt <= eh.y + eh.h * 0.8;
      if (stomping) {
        this.killEnemy(e, true);
        p.vy = -PLAYER.JUMP_V * 0.62;
        p.jumpBuffer = 0;
      } else {
        this.hurtPlayer();
      }
    }
  }

  killEnemy(e, stomped) {
    e.dying = true;
    e.deathTimer = 0;
    e.vx = 0;

    this.comboTimer = SCORE.COMBO_WINDOW;
    this.combo = Math.min(SCORE.COMBO_CAP, this.combo + 1);
    const gained = (SCORE.KILL + (stomped ? SCORE.STOMP_BONUS : 0)) * this.combo;
    this.score += gained;

    audio.play('enemyDeath', { rate: 1 + this.combo * 0.06 });
    this.r.shake(stomped ? 5 : 3, this.hooks.screenShake);
    this.spawnPopup(e.x + ENEMY.W / 2, e.y + 40, `+${gained}`, this.combo > 1 ? '#ffd75e' : '#ffffff');
    this.spawnPoof(e.x, e.y);
    if (e.type === 'gold') this.dropCoin(e.x + ENEMY.W / 2, e.y + ENEMY.H / 2);
    this._emitHud();
  }

  hurtPlayer() {
    const p = this.player;
    if (p.invuln > 0) return;
    p.lives -= 1;
    p.invuln = PLAYER.INVULN;
    // A short hop backwards sells the hit and breaks the overlap. The lower
    // bound stops short of the shop door: taking a hit must never teleport you
    // out of the arena.
    p.vy = -PLAYER.JUMP_V * 0.4;
    p.x = clamp(p.x - p.facing * 90, PLAYER.MIN_X + 20, PLAYER.MAX_X);
    this.combo = 0;
    this.r.shake(16, this.hooks.screenShake);
    this._emitHud();
    if (p.lives <= 0) this.gameOver();
    else audio.play('lose', { volume: 0.5, rate: 1.4 });
  }

  gameOver() {
    // The blink is driven by the invulnerability timer, which stops ticking
    // once the simulation halts — leave it set and the player never reappears.
    this.player.invuln = 0;
    audio.play('lose');
    this.newRecord = this.hooks.submitScore?.(this.score) ?? false;
    this.setState(State.GAME_OVER);
  }

  nearestEnemy(x, y) {
    let best = null;
    let bestD = Infinity;
    for (const e of this.enemies) {
      if (!e.alive || e.dying) continue;
      const dx = e.x + ENEMY.W / 2 - x;
      const dy = e.y + ENEMY.H / 2 - y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  // -------------------------------------------------------------------- bombs

  dropBomb(from) {
    const b = this.bombs.find((x) => !x.alive);
    if (!b) return;
    b.alive = true;
    b.x = from.x + (ENEMY.W - BOMB.W) / 2;
    b.y = from.y + 60;
    b.vy = 0;
    b.spin = 0;
    audio.play('bombFall', { volume: 0.35 });
  }

  updateBombs(dt) {
    for (const b of this.bombs) {
      if (!b.alive) continue;
      b.vy += BOMB.GRAVITY * dt;
      b.y += b.vy * dt;
      b.spin += dt * 5;
      if (b.y + BOMB.H >= GROUND_Y + 20) {
        b.alive = false;
        this.explode(b.x + BOMB.W / 2, GROUND_Y - BOMB.BLAST_H * 0.45);
      }
    }

    for (const f of this.blasts) {
      if (!f.alive) continue;
      f.t += dt;
      if (f.t >= BOMB.BLAST_TIME) f.alive = false;
    }
  }

  explode(cx, cy) {
    const f = this.blasts.find((x) => !x.alive);
    if (f) {
      f.alive = true;
      f.x = cx;
      f.y = cy;
      f.t = 0;
    }
    audio.play('explosion', { volume: 0.55 });
    this.r.shake(14, this.hooks.screenShake);

    const p = this.player;
    const px = p.x + PLAYER.W / 2;
    const py = p.y + PLAYER.H * 0.7;
    if (Math.hypot(px - cx, py - cy) < BOMB.BLAST_RADIUS) this.hurtPlayer();

    // Blasts also clear flies caught in them — bombers can kill their own kind.
    for (const e of this.enemies) {
      if (!e.alive || e.dying) continue;
      const ex = e.x + ENEMY.W / 2;
      const ey = e.y + ENEMY.H / 2;
      if (Math.hypot(ex - cx, ey - cy) < BOMB.BLAST_RADIUS) this.killEnemy(e, false);
    }
  }

  // ------------------------------------------------------------------ bullets

  updateBullets(dt) {
    for (const b of this.bullets) {
      if (!b.alive) continue;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < -100 || b.x > VIEW.W + 100 || b.y < -100 || b.y > VIEW.H + 100) {
        b.alive = false;
        continue;
      }
      for (const e of this.enemies) {
        if (!e.alive || e.dying) continue;
        const cx = e.x + ENEMY.HIT.x + ENEMY.HIT.w / 2;
        const cy = e.y + ENEMY.HIT.y + ENEMY.HIT.h / 2;
        if (Math.hypot(b.x - cx, b.y - cy) < BULLET.RADIUS + ENEMY.HIT.w * 0.45) {
          b.alive = false;
          this.killEnemy(e, false);
          break;
        }
      }
    }
  }

  // -------------------------------------------------------------------- coins

  dropCoin(x, y) {
    const c = this.coins.find((k) => !k.alive);
    if (!c) return;
    c.alive = true;
    c.x = x - COIN.W / 2;
    c.y = y;
    c.vx = rand(-90, 90);
    c.vy = -520;
    c.life = COIN.LIFETIME;
  }

  updateCoins(dt) {
    const p = this.player;
    const px = p.x + PLAYER.W / 2;
    const py = p.y + PLAYER.H * 0.6;

    for (const c of this.coins) {
      if (!c.alive) continue;
      c.life -= dt;
      if (c.life <= 0) {
        c.alive = false;
        continue;
      }

      const cx = c.x + COIN.W / 2;
      const cy = c.y + COIN.H / 2;
      const dist = Math.hypot(px - cx, py - cy);

      if (dist < COIN.MAGNET) {
        // Gentle magnet so coins never feel fiddly to collect.
        const pull = (1 - dist / COIN.MAGNET) * 1400 * dt;
        c.x += ((px - cx) / (dist || 1)) * pull;
        c.y += ((py - cy) / (dist || 1)) * pull;
        c.vy = Math.min(c.vy, 0);
      } else {
        c.vy += COIN.GRAVITY * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        const floor = GROUND_Y - COIN.H * 0.75;
        if (c.y >= floor) {
          c.y = floor;
          c.vy = -c.vy * COIN.BOUNCE;
          c.vx *= 0.7;
          if (Math.abs(c.vy) < 60) c.vy = 0;
        }
      }
      c.x = clamp(c.x, 0, VIEW.W - COIN.W);

      if (dist < 90) {
        c.alive = false;
        this.money += 1;
        this.score += SCORE.COIN;
        audio.play('coin', { rate: rand(0.95, 1.1) });
        this.spawnPopup(cx, cy - 20, '+1', '#ffd75e');
        this._emitHud();
      }
    }
  }

  // ------------------------------------------------------------------ effects

  spawnPoof(x, y) {
    const f = this.poofs.find((p) => !p.alive);
    if (!f) return;
    f.alive = true;
    f.x = x;
    f.y = y;
    f.t = 0;
  }

  spawnPopup(x, y, text, color) {
    const f = this.popups.find((p) => !p.alive);
    if (!f) return;
    f.alive = true;
    f.x = x;
    f.y = y;
    f.t = 0;
    f.text = text;
    f.color = color;
  }

  updateEffects(dt) {
    for (const f of this.poofs) {
      if (!f.alive) continue;
      f.t += dt;
      if (f.t > 0.36) f.alive = false;
    }
    for (const f of this.popups) {
      if (!f.alive) continue;
      f.t += dt;
      f.y -= 90 * dt;
      if (f.t > 0.9) f.alive = false;
    }
  }

  // ------------------------------------------------------------------- render

  render() {
    const { r } = this;
    r.begin();
    if (this.state === State.MENU) this.drawBackdrop(this.bg);
    else if (this.state === State.SHOP) this.drawShop();
    else this.drawArena();
    r.end();
  }

  drawBackdrop(image) {
    const { ctx } = this.r;
    if (image) {
      ctx.drawImage(image, 0, 0, VIEW.W, VIEW.H);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, VIEW.H);
      g.addColorStop(0, '#c9d7e6');
      g.addColorStop(1, '#6d7f8f');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW.W, VIEW.H);
    }
  }

  drawArena() {
    this.drawBackdrop(this.bg);
    this.drawPortal();
    this.drawCoins();
    this.drawEnemies();
    this.drawBombs();
    this.drawPlayer();
    this.drawWeapon();
    this.drawBullets();
    this.drawBlasts();
    this.drawEffects();
    this.drawShopSignpost();
  }

  drawShop() {
    this.drawBackdrop(this.shopBg);
    this.drawPlayer();
    this.drawEffects();
  }

  drawPortal() {
    const frame = animFrame(this.time, 6, 2);
    this.r.sprite(frame === 0 ? img.portal1 : img.portal2, PORTAL.X, PORTAL.Y, PORTAL.W, PORTAL.H);
  }

  /** A nudge toward the shop so first-time players find it. */
  drawShopSignpost() {
    if (this.state !== State.PLAYING) return;
    if (this.score > 0 && this.money === 0) return;
    const { ctx } = this.r;
    const pulse = 0.55 + Math.sin(this.time * 3) * 0.2;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,.65)';
    ctx.lineWidth = 6;
    ctx.font = '600 34px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.strokeText('← SHOP', 24, 640);
    ctx.fillText('← SHOP', 24, 640);
    ctx.restore();
  }

  /** False on the "off" half of the post-hit blink. */
  playerVisible() {
    const { invuln } = this.player;
    return !(invuln > 0 && Math.floor(invuln * 14) % 2 === 0);
  }

  drawPlayer() {
    const p = this.player;
    if (!this.playerVisible()) return;

    const left = p.facing < 0;
    const stepping = p.walking && p.onGround && animFrame(this.time, 8, 2) === 1;
    let sprite;
    if (left) sprite = stepping ? img.player2L : img.player1L;
    else sprite = stepping ? img.player2 : img.player1;
    this.r.sprite(sprite, p.x, p.y, PLAYER.W, PLAYER.H);
  }

  drawWeapon() {
    const p = this.player;
    if (!this.playerVisible()) return;
    if (p.weapon === 'shotgun') this.drawShotgun();
    else if (p.weapon === 'axe') this.drawAxe();
  }

  drawShotgun() {
    const { ctx } = this.r;
    const p = this.player;
    const gx = p.x + PLAYER.W / 2 - 12;
    const gy = p.y + 86;
    const kick = p.cooldown > BULLET.COOLDOWN - 0.09 ? 14 : 0;

    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(this.aimAngle);
    ctx.translate(-kick, 0);
    if (p.facing < 0) ctx.scale(1, -1);
    ctx.drawImage(img.shotgun, 0, -15, 140, 32);
    ctx.restore();
  }

  drawAxe() {
    const { ctx } = this.r;
    const p = this.player;
    const t = p.swing >= 0 ? clamp(p.swing / AXE.SWING_TIME, 0, 1) : 0;
    // Idle rest angle, swinging down through the arc while attacking.
    const angle = p.swing >= 0 ? -1.9 + t * 2.9 : -0.75;

    ctx.save();
    ctx.translate(p.x + PLAYER.W / 2 + p.facing * 26, p.y + 96);
    ctx.scale(p.facing, 1);
    ctx.rotate(angle);
    ctx.drawImage(img.fireAxe, -18, -18, 150, 134);
    ctx.restore();
  }

  drawEnemies() {
    for (const e of this.enemies) {
      if (!e.alive) continue;

      if (e.dying) {
        const frame = clamp(Math.floor((e.deathTimer / ENEMY.DEATH_ANIM) * 3), 0, 2);
        const sprite = [img.poof1, img.poof2, img.poof3][frame];
        const fade = 1 - e.deathTimer / ENEMY.DEATH_ANIM;
        this.r.sprite(sprite, e.x, e.y, ENEMY.W, ENEMY.H, { alpha: fade });
        continue;
      }

      const frame = animFrame(this.time + e.x * 0.002, 10, 4);
      const left = e.vx < 0;
      let sprite;
      if (e.type === 'gold') {
        sprite = [img.gold1, img.gold2, img.gold3, img.gold4][frame];
      } else if (e.type === 'bomber') {
        sprite = left
          ? [img.bomber1L, img.bomber2L, img.bomber3L, img.bomber4L][frame]
          : [img.bomber1, img.bomber2, img.bomber3, img.bomber4][frame];
      } else {
        sprite = left
          ? [img.fly1L, img.fly2L, img.fly3L, img.fly4L][frame]
          : [img.fly1, img.fly2, img.fly3, img.fly4][frame];
      }

      // Gold flies have no left-facing art, so mirror them instead.
      const mirror = e.type === 'gold' && left;
      const alpha = e.spawnFlash > 0 ? 0.45 + 0.55 * (1 - e.spawnFlash / 0.35) : 1;
      this.r.sprite(sprite, e.x, e.y, ENEMY.W, ENEMY.H, mirror || alpha !== 1 ? { flip: mirror, alpha } : undefined);
    }
  }

  drawBombs() {
    for (const b of this.bombs) {
      if (!b.alive) continue;
      this.r.sprite(img.grenade, b.x, b.y, BOMB.W, BOMB.H, { rotate: b.spin });
    }
  }

  drawBlasts() {
    for (const f of this.blasts) {
      if (!f.alive) continue;
      const t = f.t / BOMB.BLAST_TIME;
      const size = BOMB.BLAST_W * (0.6 + t * 0.9);
      this.r.sprite(img.explosion, f.x - size / 2, f.y - size / 2 + 20, size, size, { alpha: 1 - t * t });
    }
  }

  drawBullets() {
    const frames = [img.bullet1, img.bullet2, img.bullet3, img.bullet4];
    for (const b of this.bullets) {
      if (!b.alive) continue;
      const age = this.time - b.born;
      const sprite = frames[clamp(Math.floor(age * 30), 0, 3)];
      this.r.sprite(sprite, b.x - BULLET.W / 2, b.y - BULLET.H / 2, BULLET.W, BULLET.H, {
        rotate: b.angle,
        alpha: clamp(b.life / 0.35, 0, 1),
      });
    }
  }

  drawCoins() {
    for (const c of this.coins) {
      if (!c.alive) continue;
      const frame = animFrame(this.time + c.x * 0.01, 12, 6);
      const sprite = [img.coin1, img.coin2, img.coin3, img.coin4, img.coin5, img.coin6][frame];
      // Blink out during the last two seconds so a despawn is never a surprise.
      const alpha = c.life < 2 ? (Math.floor(c.life * 8) % 2 ? 0.25 : 1) : 1;
      this.r.sprite(sprite, c.x, c.y, COIN.W, COIN.H, alpha !== 1 ? { alpha } : undefined);
    }
  }

  drawEffects() {
    const { ctx } = this.r;
    for (const f of this.poofs) {
      if (!f.alive) continue;
      const frame = clamp(Math.floor((f.t / 0.36) * 3), 0, 2);
      this.r.sprite([img.poof1, img.poof2, img.poof3][frame], f.x, f.y, ENEMY.W, ENEMY.H, {
        alpha: 1 - f.t / 0.36,
      });
    }

    if (this.popups.some((p) => p.alive)) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '700 40px system-ui, sans-serif';
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(0,0,0,.7)';
      for (const f of this.popups) {
        if (!f.alive) continue;
        ctx.globalAlpha = clamp(1 - (f.t - 0.5) / 0.4, 0, 1);
        ctx.strokeText(f.text, f.x, f.y);
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x, f.y);
      }
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------- hud

  hudState() {
    return {
      score: this.score,
      money: this.money,
      lives: this.player.lives,
      maxLives: PLAYER.LIVES,
      combo: this.combo,
      weapon: this.player.weapon,
      owned: [...this.owned],
    };
  }

  _emitHud() {
    this.hooks.onHud?.(this.hudState());
  }
}
