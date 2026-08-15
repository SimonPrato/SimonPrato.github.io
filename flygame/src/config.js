/**
 * Tunables for the whole game.
 *
 * Everything in here is expressed in *virtual* units on a fixed 1920x1080
 * stage. The renderer scales that stage to whatever the browser gives us, so
 * gameplay is identical on a phone and on a 4K monitor.
 *
 * Speeds are per second (not per frame) so the simulation is resolution- and
 * refresh-rate independent.
 */

export const VIEW = Object.freeze({ W: 1920, H: 1080 });

/** y of the ground line, i.e. where sprite feet rest. */
export const GROUND_Y = 860;

export const PLAYER = Object.freeze({
  W: 160,
  H: 160,
  SPEED: 950,
  JUMP_V: 1520,
  GRAVITY: 3800,
  /** Grace period after walking off a ledge in which a jump still counts. */
  COYOTE: 0.1,
  /** Jump presses this long before landing are remembered and replayed. */
  JUMP_BUFFER: 0.12,
  /** Hitbox inset from the 160x160 sprite box: the man does not fill it. */
  HIT: Object.freeze({ x: 48, y: 22, w: 64, h: 138 }),
  MIN_X: -70,
  MAX_X: VIEW.W - 170,
  /**
   * The original was one-hit-death. Three hits plus a moment of invulnerability
   * makes the ramp readable without making it easy — set LIVES to 1 for the
   * original rules.
   */
  LIVES: 3,
  INVULN: 1.35,
});

export const ENEMY = Object.freeze({
  W: 160,
  H: 160,
  BASE_SPEED: 330,
  /** Extra speed per point of difficulty (see Game#difficulty). */
  SPEED_PER_LEVEL: 55,
  MAX_ALIVE: 8,
  SPAWN_X: 1731,
  SPAWN_Y: 720,
  HIT: Object.freeze({ x: 24, y: 38, w: 112, h: 86 }),
  /** Seconds between spawns at difficulty 0, and the floor it decays to. */
  SPAWN_INTERVAL: 2.6,
  SPAWN_INTERVAL_MIN: 0.85,
  /** Bomber flies climb to this altitude and then patrol. */
  BOMBER_ALTITUDE: 200,
  BOMBER_CLIMB: 260,
  BOMB_CHANCE_PER_SEC: 0.55,
  DEATH_ANIM: 0.45,
});

export const BOMB = Object.freeze({
  W: 120,
  H: 120,
  GRAVITY: 1500,
  BLAST_W: 190,
  BLAST_H: 190,
  BLAST_TIME: 0.42,
  /** Radius (virtual px) around the blast centre that still hurts. */
  BLAST_RADIUS: 150,
});

export const BULLET = Object.freeze({
  SPEED: 2600,
  W: 96,
  H: 64,
  RADIUS: 34,
  LIFETIME: 1.2,
  /** Pellets per shotgun blast and their total spread in radians. */
  PELLETS: 5,
  SPREAD: 0.16,
  COOLDOWN: 0.55,
  RELOAD_CUE: 0.28,
});

export const AXE = Object.freeze({
  COOLDOWN: 0.42,
  SWING_TIME: 0.24,
  REACH: 165,
  ARC_H: 190,
});

export const COIN = Object.freeze({
  W: 110,
  H: 110,
  MAX: 12,
  MAGNET: 190,
  LIFETIME: 14,
  GRAVITY: 2200,
  BOUNCE: 0.45,
});

export const SCORE = Object.freeze({
  KILL: 100,
  STOMP_BONUS: 50,
  COIN: 25,
  /** Consecutive airborne stomps multiply the kill score, capped here. */
  COMBO_CAP: 5,
  COMBO_WINDOW: 2.0,
});

/** Every 1500 points the roster gains a tougher fly type. */
export const DIFFICULTY_STEP = 1500;

export const PORTAL = Object.freeze({ X: 1731, Y: 700, W: 160, H: 160 });

/** Shop inventory. `id` doubles as the weapon key used by the player. */
export const WEAPONS = Object.freeze([
  Object.freeze({
    id: 'fist',
    name: 'Bare Hands',
    price: 0,
    owned: true,
    icon: 'fist',
    blurb: 'Jump on flies to squash them. Always available.',
  }),
  Object.freeze({
    id: 'shotgun',
    name: 'Shotgun',
    price: 2,
    owned: false,
    icon: 'shotgun',
    blurb: 'Aim with the mouse, click to fire a spread of pellets.',
  }),
  Object.freeze({
    id: 'axe',
    name: 'Fire Axe',
    price: 4,
    owned: false,
    icon: 'fireAxe',
    blurb: 'Short reach, no reload, hits everything in the swing.',
  }),
]);

export const SOUNDTRACKS = Object.freeze([
  { id: 'tavern', name: 'Tavern', src: 'audio/music-tavern.mp3' },
  { id: 'battle', name: 'Battle', src: 'audio/music-battle.mp3' },
  { id: 'fire', name: 'Fire', src: 'audio/music-fire.mp3' },
  { id: 'water', name: 'Water', src: 'audio/music-water.mp3' },
]);

export const BACKGROUNDS = Object.freeze([
  'img/hintergrund.png',
  'img/hintergrund2.png',
  'img/hintergrund3.png',
]);
