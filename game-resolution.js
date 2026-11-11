/**
 * Flor penalty-kick-substance v1 — locked resolution (no UI).
 * Rolls are independent integers 0–99 unless noted.
 */

/** @typedef {'high-left'|'high-center'|'high-right'|'mid-left'|'center'|'mid-right'|'low-left'|'low-center'|'low-right'} ZoneId */
/** @typedef {'placed'|'driven'} Power */
/** @typedef {'easy'|'normal'|'hard'} Difficulty */
/** @typedef {'left'|'center'|'right'} Side */
/** @typedef {'goal'|'save'|'miss'} Outcome */

export const ZONE_UI_ORDER = [
  'high-left', 'high-center', 'high-right',
  'mid-left', 'center', 'mid-right',
  'low-left', 'low-center', 'low-right',
];

export const ZONE_LABELS = {
  'high-left': '左上',
  'high-center': '上',
  'high-right': '右上',
  'mid-left': '左',
  center: 'まんなか',
  'mid-right': '右',
  'low-left': '左下',
  'low-center': '下',
  'low-right': '右下',
};

const ZONE_META = {
  'high-left': { side: 'left', group: 'corner' },
  'high-center': { side: 'center', group: 'mid' },
  'high-right': { side: 'right', group: 'corner' },
  'mid-left': { side: 'left', group: 'mid' },
  center: { side: 'center', group: 'center' },
  'mid-right': { side: 'right', group: 'mid' },
  'low-left': { side: 'left', group: 'corner' },
  'low-center': { side: 'center', group: 'mid' },
  'low-right': { side: 'right', group: 'corner' },
};

/** On-target success rate (percent). Off target if roll >= rate. */
const ON_TARGET = {
  center: { placed: 98, driven: 92 },
  'low-center': { placed: 98, driven: 92 },
  'mid-left': { placed: 98, driven: 92 },
  'mid-right': { placed: 98, driven: 92 },
  'low-left': { placed: 94, driven: 84 },
  'low-right': { placed: 94, driven: 84 },
  'high-center': { placed: 94, driven: 84 },
  'high-left': { placed: 90, driven: 76 },
  'high-right': { placed: 90, driven: 76 },
};

const SAVE_PCT = {
  easy: { corner: 18, mid: 40, center: 70 },
  normal: { corner: 32, mid: 58, center: 85 },
  hard: { corner: 48, mid: 75, center: 92 },
};

export const MISS_HINTS = {
  'high-center': '上に外れた',
  'mid-left': '左に外れた',
  'low-left': '左に外れた',
  'mid-right': '右に外れた',
  'low-right': '右に外れた',
  'high-left': '左上に外れた',
  'high-right': '右上に外れた',
};

/**
 * Keeper guess from roll 0–99: left 40% / center 20% / right 40%.
 * @param {number} roll
 * @returns {Side}
 */
export function keeperSideFromRoll(roll) {
  if (roll < 40) return 'left';
  if (roll < 60) return 'center';
  return 'right';
}

/**
 * @param {{
 *   zone: ZoneId,
 *   power: Power,
 *   difficulty: Difficulty,
 *   rolls: { keeper: number, onTarget: number, save: number }
 * }} params
 */
export function resolveKick({ zone, power, difficulty, rolls }) {
  const meta = ZONE_META[zone];
  if (!meta) throw new Error(`unknown zone: ${zone}`);

  const keeperSide = keeperSideFromRoll(rolls.keeper);
  const onTargetRate = ON_TARGET[zone][power];

  if (rolls.onTarget >= onTargetRate) {
    return {
      outcome: /** @type {const} */ ('miss'),
      keeperSide,
      hint: MISS_HINTS[zone] ?? null,
    };
  }

  const shotSide = meta.side;
  if (keeperSide !== shotSide) {
    return { outcome: /** @type {const} */ ('goal'), keeperSide };
  }

  let saveRate = SAVE_PCT[difficulty][meta.group];
  if (power === 'driven') {
    saveRate = Math.round(saveRate * 0.75);
  }

  if (rolls.save < saveRate) {
    return { outcome: /** @type {const} */ ('save'), keeperSide };
  }

  return { outcome: /** @type {const} */ ('goal'), keeperSide };
}

/** Three independent 0–99 rolls via crypto. */
export function randomKickRolls() {
  const buf = new Uint32Array(3);
  crypto.getRandomValues(buf);
  return {
    keeper: buf[0] % 100,
    onTarget: buf[1] % 100,
    save: buf[2] % 100,
  };
}
