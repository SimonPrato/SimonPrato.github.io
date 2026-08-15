/**
 * Image loading.
 *
 * The original game declared ~55 <img width="0" height="0"> tags in the body
 * and hoped they had decoded before the first frame. This does it properly:
 * a manifest, a real progress signal, and `decode()` so the first draw of a
 * sprite never blocks the compositor.
 *
 * Backgrounds are deliberately *not* in the eager manifest — they are 1-1.6 MB
 * each and only one is ever needed per session.
 */

/** Sprites needed before the first frame can be drawn. ~1.2 MB total. */
const MANIFEST = {
  // Player
  player1: 'img/Mann_1.png',
  player2: 'img/Mann_2.png',
  player1L: 'img/Mann_1_links.png',
  player2L: 'img/Mann_2_links.png',

  // Common fly. The art is named the wrong way round: "Fliege_1.png" faces
  // left and "Fliege_1_links.png" faces right, so the keys are swapped here to
  // keep `flyN` = right-facing everywhere else in the code.
  fly1: 'img/Fliege_1_links.png',
  fly2: 'img/fliege_2_links.png',
  fly3: 'img/Fliege_3_links.png',
  fly4: 'img/Fliege_4_links.png',
  fly1L: 'img/Fliege_1.png',
  fly2L: 'img/Fliege_2.png',
  fly3L: 'img/Fliege_3.png',
  fly4L: 'img/Fliege_4.png',

  // Gold fly (drops coins) — no second orientation exists, so it is mirrored.
  // The source art faces left, matching the `flyNL` keys.
  gold1: 'img/Gold Fliege 1.png',
  gold2: 'img/Gold Fliege 2.png',
  gold3: 'img/Gold Fliege 3.png',
  gold4: 'img/Gold Fliege 4.png',

  // Bomber fly — same inverted naming as the common fly
  bomber1: 'img/bomb1_left.png',
  bomber2: 'img/bomb2_left.png',
  bomber3: 'img/bomb3_left.png',
  bomber4: 'img/bomb4_left.png',
  bomber1L: 'img/bomb1.png',
  bomber2L: 'img/bomb2.png',
  bomber3L: 'img/bomb3.png',
  bomber4L: 'img/bomb4.png',

  // Armoured gunships: tougher, and they shoot back. Same inverted naming.
  warfly: 'img/Kampffliege_1_links.png',
  warflyL: 'img/Kampffliege_1.png',
  heli: 'img/Kampfheli_1_links.png',
  heliL: 'img/Kampfheli_1.png',

  // Effects
  poof1: 'img/Fliege_stirbt_1.png',
  poof2: 'img/Fliege_stirbt_2.png',
  poof3: 'img/Fliege_stirbt_3.png',
  explosion: 'img/explosion.png',
  grenade: 'img/grenade.png',

  // Pickups & scenery
  coin1: 'img/coin_1.png',
  coin2: 'img/coin_2.png',
  coin3: 'img/coin_3.png',
  coin4: 'img/coin_4.png',
  coin5: 'img/coin_5.png',
  coin6: 'img/coin_6.png',
  portal1: 'img/Portal_1.png',
  portal2: 'img/Portal_2.png',

  // Weapons & projectiles
  shotgun: 'img/shotgun.png',
  fireAxe: 'img/fireaxe.png',
  fist: 'img/fist.png',
  bullet1: 'img/Bullet 1.png',
  bullet2: 'img/Bullet 2.png',
  bullet3: 'img/Bullet 3.png',
  bullet4: 'img/Bullet 4.png',
};

/** key -> HTMLImageElement, populated by `loadAll`. */
export const img = Object.create(null);

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const el = new Image();
    el.decoding = 'async';
    el.onload = () => (el.decode ? el.decode().then(() => resolve(el), () => resolve(el)) : resolve(el));
    el.onerror = () => reject(new Error(`Could not load ${src}`));
    el.src = src;
  });
}

/**
 * Loads every sprite in the manifest.
 * @param {(fraction: number) => void} [onProgress] 0..1
 */
export async function loadAll(onProgress) {
  const entries = Object.entries(MANIFEST);
  let done = 0;
  await Promise.all(
    entries.map(async ([key, src]) => {
      img[key] = await loadImage(src);
      done += 1;
      onProgress?.(done / entries.length);
    }),
  );
  return img;
}

const lazyCache = new Map();

/**
 * Loads a one-off image (backgrounds, menu art) on demand and caches it.
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
export function loadLazy(src) {
  let pending = lazyCache.get(src);
  if (!pending) {
    pending = loadImage(src);
    lazyCache.set(src, pending);
  }
  return pending;
}
