// The game state of Odd Twin: which screen is showing, the level in progress, the
// score, the timer, hints, and the list of differences found so far. Pure logic, no drawing.

import {
  COMBO_WINDOW_SECONDS,
  HINTS_PER_LEVEL,
  POINTS_PER_COMBO_STEP,
  POINTS_PER_FIND,
  TIME_BONUS_PER_SECOND,
  WRONG_CLICK_SCORE_PENALTY,
  WRONG_CLICK_TIME_PENALTY,
} from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_MENU = 'menu';
export const SCREEN_PLAY = 'play';
export const SCREEN_LEVEL_COMPLETE = 'level-complete';
export const SCREEN_GAME_OVER = 'game-over';
export const SCREEN_GAME_COMPLETE = 'game-complete';

const BEST_KEY = 'odd-twin-best-score';

/** Read the saved best total score, or 0 when there is none. */
export function loadBestScore() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(score) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Best score is a nicety; private mode must not break the game.
  }
}

/** A fresh state: the menu, no level running. */
export function createState() {
  return {
    screen: SCREEN_MENU,
    levelIndex: 0,
    found: new Set(),
    foundOrder: [],
    score: 0,
    bestScore: loadBestScore(),
    timeLeft: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintTarget: -1,
    hintUntil: 0,
    combo: 0,
    lastFindAt: -Infinity,
    lastFoundIndex: -1,
    lastFoundAt: 0,
    muted: false,
    now: 0,
    frozen: false,
    levelBonus: 0,
    levelTime: 0,
    totalFound: 0,
    totalDifferences: SCENES.reduce((sum, scene) => sum + scene.differences.length, 0),
    wrongMarks: [],
    floatTexts: [],
    message: '',
    messageUntil: 0,
    newBest: false,
  };
}

export function currentScene(state) {
  return SCENES[state.levelIndex];
}

/** Start (or restart) a level: fresh finds, full time, full hints. */
export function startLevel(state, levelIndex) {
  const scene = SCENES[levelIndex];
  state.screen = SCREEN_PLAY;
  state.levelIndex = levelIndex;
  state.found = new Set();
  state.foundOrder = [];
  state.timeLeft = scene.timeLimit;
  state.levelTime = scene.timeLimit;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.hintTarget = -1;
  state.combo = 0;
  state.lastFindAt = -Infinity;
  state.lastFoundIndex = -1;
  state.lastFoundAt = 0;
  state.wrongMarks = [];
  state.floatTexts = [];
  state.message = `Find ${scene.differences.length} differences — ${scene.tagline}`;
  state.messageUntil = state.now + 4;
}

/** The index of the difference at panel-local (x, y), or -1 when the click hits none. */
export function differenceAt(scene, x, y) {
  for (let index = 0; index < scene.differences.length; index += 1) {
    const difference = scene.differences[index];
    const dx = x - difference.x;
    const dy = y - difference.y;
    if (dx * dx + dy * dy <= difference.r * difference.r) return index;
  }
  return -1;
}

/**
 * Handle a click on a panel at panel-local (x, y) on side 'A' or 'B'. Returns 'found',
 * 'already', 'miss' or null when the click is not on a playing screen.
 */
export function clickPanel(state, x, y, side) {
  if (state.screen !== SCREEN_PLAY) return null;
  const scene = currentScene(state);
  const index = differenceAt(scene, x, y);
  if (index === -1) {
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_CLICK_TIME_PENALTY);
    state.score = Math.max(0, state.score - WRONG_CLICK_SCORE_PENALTY);
    state.combo = 0;
    state.wrongMarks.push({ x, y, side, until: state.now + 0.6 });
    state.message = `Not a difference — minus ${WRONG_CLICK_TIME_PENALTY} seconds`;
    state.messageUntil = state.now + 2;
    return 'miss';
  }
  if (state.found.has(index)) {
    state.message = `Already found: ${scene.differences[index].name}`;
    state.messageUntil = state.now + 2;
    return 'already';
  }
  const withinCombo = state.now - state.lastFindAt <= COMBO_WINDOW_SECONDS;
  state.combo = withinCombo ? state.combo + 1 : 0;
  const points = POINTS_PER_FIND + state.combo * POINTS_PER_COMBO_STEP;
  state.score += points;
  state.lastFindAt = state.now;
  state.lastFoundIndex = index;
  state.lastFoundAt = state.now;
  state.found.add(index);
  state.foundOrder.push(index);
  state.totalFound += 1;
  state.floatTexts.push({
    x,
    y: y - 30,
    side,
    text: state.combo > 0 ? `+${points}  COMBO x${state.combo + 1}` : `+${points}`,
    until: state.now + 1.1,
  });
  state.message = `Found: ${scene.differences[index].name}`;
  state.messageUntil = state.now + 2;
  if (state.found.size === scene.differences.length) completeLevel(state);
  return 'found';
}

/** Award the time bonus and move to the level-complete screen. */
function completeLevel(state) {
  const scene = currentScene(state);
  state.levelBonus = Math.ceil(state.timeLeft) * TIME_BONUS_PER_SECOND;
  state.score += state.levelBonus;
  state.screen = SCREEN_LEVEL_COMPLETE;
  state.message = '';
  if (state.levelIndex === SCENES.length - 1) {
    state.screen = SCREEN_GAME_COMPLETE;
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      state.newBest = true;
      saveBestScore(state.score);
    }
  }
}

/** Spend a hint: briefly ring a random difference still unfound. Returns false when none are left. */
export function useHint(state) {
  if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return false;
  const scene = currentScene(state);
  const remaining = scene.differences
    .map((difference, index) => index)
    .filter((index) => !state.found.has(index));
  if (remaining.length === 0) return false;
  state.hintsLeft -= 1;
  state.hintTarget = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintUntil = state.now + 2;
  state.message = 'Hint: look inside the glowing ring';
  state.messageUntil = state.now + 2;
  return true;
}

/** Advance the clock by dt seconds; the timer only runs while playing. */
export function tick(state, dt) {
  state.now += dt;
  if (state.frozen || state.screen !== SCREEN_PLAY) return;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = SCREEN_GAME_OVER;
    state.message = '';
  }
  state.wrongMarks = state.wrongMarks.filter((mark) => mark.until > state.now);
  state.floatTexts = state.floatTexts.filter((text) => text.until > state.now);
}

/** Format seconds as m:ss. */
export function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
