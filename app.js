import {
  resolveKick,
  randomKickRolls,
  ZONE_UI_ORDER,
  ZONE_LABELS,
} from './game-resolution.js';

const DIFF_LABEL = { easy: 'やさしい', normal: 'ふつう', hard: 'むずかしい' };
const DIFF_IDS = ['easy', 'normal', 'hard'];
const POWER_LABEL = { placed: 'コース', driven: 'パワー' };
const POWER_HINT = { placed: '枠に入りやすい', driven: '止められにくい' };
const RESULT_WORD = { goal: 'ゴール！', save: 'セーブ', miss: '枠外' };
const RESULT_CLASS = { goal: 'is-goal', save: 'is-save', miss: 'is-miss' };

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = {
  phase: 'aim',
  difficulty: 'normal',
  power: 'placed',
  zone: null,
  goals: 0,
  attempts: 0,
  streak: 0,
  lastKeeperSide: 'center',
  pendingDiff: null,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

const els = {};

function init() {
  els.diffBtn = $('#diff-btn');
  els.scoreNums = $('#score-nums');
  els.streakNums = $('#streak-nums');
  els.pick = $('#pick-line');
  els.hint = $('#power-hint');
  els.kickBtn = $('#kick-btn');
  els.padButtons = $$('#zone-pad button');
  els.powerButtons = $$('#power-group button');
  els.goalCells = $$('#goal-grid .goal-cell');
  els.keeper = $('#keeper');
  els.kicker = $('#kicker');
  els.ballSpot = $('#ball-spot');
  els.pitchResult = $('#pitch-result');
  els.resultWord = $('#result-word');
  els.resultHint = $('#result-hint');
  els.againBtn = $('#again-btn');
  els.deckAim = $('#deck-aim');
  els.deckResult = $('#deck-result');
  els.scenery = $('.scenery');
  els.diffSheet = $('#diff-picker');
  els.diffConfirm = $('#diff-confirm');
  els.confirmFromTo = $('#confirm-fromto');
  els.deck = $('#deck');

  els.padButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => onZonePick(i));
  });
  els.powerButtons.forEach((btn) => {
    btn.addEventListener('click', () => onPowerPick(btn.dataset.power));
  });
  els.kickBtn.addEventListener('click', onKick);
  els.againBtn.addEventListener('click', onAgain);
  els.diffBtn.addEventListener('click', openDiffPicker);
  $$('#diff-picker [data-diff]').forEach((btn) => {
    btn.addEventListener('click', () => onDiffPick(btn.dataset.diff));
  });
  $('#diff-cancel').addEventListener('click', closeSheets);
  $('#diff-abort').addEventListener('click', closeSheets);
  $('#diff-apply').addEventListener('click', applyDiffChange);

  syncHud();
  syncControls();
  updatePickLine();
}

function canInteract() {
  return state.phase === 'aim' || state.phase === 'result';
}

function lockDuringFlight() {
  return state.phase === 'flight';
}

function onZonePick(index) {
  if (!canInteract() || lockDuringFlight()) return;
  state.zone = ZONE_UI_ORDER[index];
  els.padButtons.forEach((b, i) => {
    b.setAttribute('aria-pressed', i === index ? 'true' : 'false');
  });
  mirrorGoal(index);
  updatePickLine();
  syncKickEnabled();
}

function onPowerPick(power) {
  if (!canInteract() || lockDuringFlight()) return;
  state.power = power;
  els.powerButtons.forEach((b) => {
    b.setAttribute('aria-pressed', b.dataset.power === power ? 'true' : 'false');
  });
  els.hint.textContent = POWER_HINT[power];
  updatePickLine();
}

function mirrorGoal(index) {
  els.goalCells.forEach((c, i) => c.classList.toggle('is-on', i === index));
}

function updatePickLine() {
  if (!state.zone) {
    els.pick.textContent = '';
    return;
  }
  els.pick.textContent = `${ZONE_LABELS[state.zone]} · ${POWER_LABEL[state.power]}`;
}

function syncKickEnabled() {
  const on = state.zone !== null && state.phase === 'aim';
  els.kickBtn.disabled = !on;
}

function syncHud() {
  els.diffBtn.textContent = DIFF_LABEL[state.difficulty];
  els.scoreNums.textContent = `${state.goals} / ${state.attempts}`;
  els.streakNums.textContent = String(state.streak);
}

function syncControls() {
  const isAim = state.phase === 'aim';
  const isResult = state.phase === 'result';
  const locked = !isAim;
  els.padButtons.forEach((b) => { b.disabled = locked; });
  els.powerButtons.forEach((b) => { b.disabled = locked; });
  els.deckAim.hidden = isResult;
  els.deckResult.hidden = !isResult;
  els.pitchResult.hidden = !isResult;
  els.scenery.classList.toggle('is-result', isResult);
  els.diffBtn.disabled = lockDuringFlight();
  syncKickEnabled();
}

function setKeeperPose(side, diving) {
  els.keeper.classList.remove('is-dived-left', 'is-dived-right', 'is-center');
  if (!diving) {
    els.keeper.classList.add('is-center');
    return;
  }
  if (side === 'left') els.keeper.classList.add('is-dived-left');
  else if (side === 'right') els.keeper.classList.add('is-dived-right');
  else els.keeper.classList.add('is-center');
}

function onKick() {
  if (state.phase !== 'aim' || !state.zone) return;

  state.phase = 'flight';
  syncControls();

  const rolls = randomKickRolls();
  const result = resolveKick({
    zone: state.zone,
    power: state.power,
    difficulty: state.difficulty,
    rolls,
  });
  state.lastKeeperSide = result.keeperSide;

  const plantMs = state.reducedMotion ? 0 : 175;
  const flyMs = state.reducedMotion ? 0 : 520;
  const resultMs = state.reducedMotion ? 0 : 150;

  els.kicker.classList.add('is-kicking');
  els.ballSpot.classList.add('is-hidden');

  window.setTimeout(() => {
    const zoneIndex = ZONE_UI_ORDER.indexOf(state.zone);
    const cell = els.goalCells[zoneIndex];
    const ball = document.createElement('span');
    ball.className = 'ball-in-goal';
    ball.id = 'ball-in-goal';
    if (result.outcome !== 'miss') {
      cell.appendChild(ball);
    }
    els.kicker.classList.add('is-hidden');
    setKeeperPose(result.keeperSide, true);
    els.ballSpot.classList.remove('is-kicking');

    window.setTimeout(() => {
      showResult(result, resultMs);
    }, flyMs);
  }, plantMs);
}

function showResult(result, delayMs) {
  const go = () => {
    state.attempts += 1;
    if (result.outcome === 'goal') {
      state.goals += 1;
      state.streak += 1;
    } else {
      state.streak = 0;
    }

    els.resultWord.textContent = RESULT_WORD[result.outcome];
    els.resultWord.className = `result-word ${RESULT_CLASS[result.outcome]}`;
    if (result.outcome === 'miss' && result.hint) {
      els.resultHint.textContent = result.hint;
      els.resultHint.hidden = false;
    } else {
      els.resultHint.hidden = true;
      els.resultHint.textContent = '';
    }

    els.kicker.classList.add('is-hidden');
    els.ballSpot.classList.add('is-hidden');
    state.phase = 'result';
    syncHud();
    syncControls();
  };

  if (delayMs <= 0) go();
  else window.setTimeout(go, delayMs);
}

function onAgain() {
  state.phase = 'aim';
  state.zone = null;
  els.padButtons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
  els.goalCells.forEach((c) => {
    c.classList.remove('is-on');
    c.querySelector('.ball-in-goal')?.remove();
  });
  els.kicker.classList.remove('is-hidden', 'is-kicking');
  els.ballSpot.classList.remove('is-hidden', 'is-kicking');
  setKeeperPose('center', false);
  updatePickLine();
  syncHud();
  syncControls();
}

function openDiffPicker() {
  if (lockDuringFlight()) return;
  closeSheets();
  els.diffSheet.hidden = false;
}

function closeSheets() {
  els.diffSheet.hidden = true;
  els.diffConfirm.hidden = true;
  state.pendingDiff = null;
}

function onDiffPick(diff) {
  if (diff === state.difficulty) {
    closeSheets();
    return;
  }
  state.pendingDiff = diff;
  els.confirmFromTo.textContent = `${DIFF_LABEL[state.difficulty]}　→　${DIFF_LABEL[diff]}`;
  els.diffSheet.hidden = true;
  els.diffConfirm.hidden = false;
}

function applyDiffChange() {
  if (!state.pendingDiff) return;
  state.difficulty = state.pendingDiff;
  state.goals = 0;
  state.attempts = 0;
  state.streak = 0;
  closeSheets();
  if (state.phase === 'result') onAgain();
  else {
    syncHud();
    syncControls();
  }
}

init();
