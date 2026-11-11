import assert from 'node:assert/strict';
import {
  resolveKick,
  keeperSideFromRoll,
  ZONE_UI_ORDER,
} from '../game-resolution.js';

assert.equal(keeperSideFromRoll(0), 'left');
assert.equal(keeperSideFromRoll(39), 'left');
assert.equal(keeperSideFromRoll(40), 'center');
assert.equal(keeperSideFromRoll(59), 'center');
assert.equal(keeperSideFromRoll(60), 'right');

// Off target → miss (high-center placed 94% → roll 94 misses)
let r = resolveKick({
  zone: 'high-center',
  power: 'placed',
  difficulty: 'normal',
  rolls: { keeper: 10, onTarget: 94, save: 0 },
});
assert.equal(r.outcome, 'miss');
assert.equal(r.hint, '上に外れた');

// On target, keeper wrong side → goal
r = resolveKick({
  zone: 'high-right',
  power: 'placed',
  difficulty: 'normal',
  rolls: { keeper: 5, onTarget: 0, save: 99 },
});
assert.equal(r.outcome, 'goal');
assert.equal(r.keeperSide, 'left');

// Same side corner normal placed: save if save < 32
r = resolveKick({
  zone: 'high-left',
  power: 'placed',
  difficulty: 'normal',
  rolls: { keeper: 10, onTarget: 0, save: 31 },
});
assert.equal(r.outcome, 'save');

r = resolveKick({
  zone: 'high-left',
  power: 'placed',
  difficulty: 'normal',
  rolls: { keeper: 10, onTarget: 0, save: 32 },
});
assert.equal(r.outcome, 'goal');

// Driven center normal: 85 × 0.75 = 63.75 → 64% save
r = resolveKick({
  zone: 'center',
  power: 'driven',
  difficulty: 'normal',
  rolls: { keeper: 50, onTarget: 0, save: 63 },
});
assert.equal(r.outcome, 'save');

r = resolveKick({
  zone: 'center',
  power: 'driven',
  difficulty: 'normal',
  rolls: { keeper: 50, onTarget: 0, save: 64 },
});
assert.equal(r.outcome, 'goal');

assert.equal(ZONE_UI_ORDER.length, 9);

console.log('game-resolution.test.js: ok');
