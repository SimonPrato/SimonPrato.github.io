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
  // Slightly smaller than the original 160x160 so the fixed 1920x1080 stage
  // reads as a bigger map.
  W: 136,
  H: 136,
  SPEED: 950,
  JUMP_V: 1520,
  GRAVITY: 3800,
  /** Grace period after walking off a ledge in which a jump still counts. */
  COYOTE: 0.1,
  /** Jump presses this long before landing are remembered and replayed. */
  JUMP_BUFFER: 0.12,
  /** Hitbox inset from the 136x136 sprite box: the man does not fill it. */
  HIT: Object.freeze({ x: 41, y: 19, w: 54, h: 117 }),
  MIN_X: -70,
  MAX_X: VIEW.W - 146,
  /**
   * The original was one-hit-death. Three hits plus a moment of invulnerability
   * makes the ramp readable without making it easy — set LIVES to 1 for the
   * original rules.
   */
  LIVES: 3,
  INVULN: 1.35,
});

export const ENEMY = Object.freeze({
  W: 136,
  H: 136,
  /** Fixed for the whole run: flies do not get faster as the score climbs. */
  BASE_SPEED: 330,
  MAX_ALIVE: 8,
  SPAWN_X: 1731,
  SPAWN_Y: 745,
  HIT: Object.freeze({ x: 20, y: 32, w: 95, h: 73 }),
  /** Seconds between spawns at difficulty 0, and the floor it decays to. */
  SPAWN_INTERVAL: 2.6,
  SPAWN_INTERVAL_MIN: 0.85,
  /** Airborne types climb to this altitude and then patrol. */
  BOMBER_ALTITUDE: 200,
  BOMBER_CLIMB: 260,
  /** Amplitude and rate of the hover bob once at altitude. */
  HOVER_AMP: 18,
  HOVER_RATE: 1.7,
  DEATH_ANIM: 0.45,
  /** Hits required to kill each type. Types absent from this map die in one. */
  HP: Object.freeze({ warfly: 3, heli: 4 }),
  /** How long a damaged enemy flashes white. */
  HURT_FLASH: 0.14,
  /** Gunner types: seconds between aimed shots. */
  GUN_INTERVAL: Object.freeze({ warfly: 2.1, heli: 1.6 }),
  /**
   * War flies patrol low enough that a jump still reaches them, so melee-only
   * players have an answer; the heli stays out of reach and has to be shot.
   */
  WARFLY_ALTITUDE: 470,
  HELI_ALTITUDE: 300,
});

export const ENEMY_BULLET = Object.freeze({
  SPEED: 620,
  W: 26,
  H: 10,
  RADIUS: 9,
  LIFETIME: 4,
  MAX: 24,
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
  REACH: 150,
  ARC_H: 170,
  /** Damage the blade itself deals on contact. */
  DAMAGE: 2,
});

/** The red arc the fire axe throws forward on every swing. */
export const SHOCKWAVE = Object.freeze({
  SPEED: 1250,
  RANGE: 620,
  /** Half-height of the crescent, and how much it grows over its travel. */
  H: 110,
  GROWTH: 0.7,
  DAMAGE: 1,
  MAX: 6,
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
