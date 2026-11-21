// Screenshot scenes behind ?shot=cover|harbor|library|win. Each one stages a real game
// state — a level in progress with some differences found and several still unfound, or a
// finished level — and freezes the timer, so the frame is deterministic and the same URL
// always gives the same picture. Nothing here changes how the game plays without ?shot=.

import { SCREEN_LEVEL_COMPLETE, startLevel } from './state.js';

/** Mark differences found and settle their markers (found a second ago, pop finished). */
function stageFound(state, indices, score, timeLeft) {
  state.found = new Set(indices);
  state.foundOrder = [...indices];
  state.totalFound = indices.length;
  state.score = score;
  state.timeLeft = timeLeft;
  state.lastFoundIndex = indices[indices.length - 1];
  state.lastFoundAt = state.now - 1;
  state.message = '';
  state.frozen = true;
}

/** Set `state` to the named scene; any other name stages the cover. */
export function stageShot(name, state) {
  if (name === 'harbor') {
    startLevel(state, 1);
    stageFound(state, [0, 1, 4], 325, 88);
    state.message = 'Found: A crate on the dock';
    state.messageUntil = state.now + 60;
    return;
  }
  if (name === 'library') {
    startLevel(state, 2);
    stageFound(state, [2], 100, 132);
    state.message = 'Found: The colour of one book';
    state.messageUntil = state.now + 60;
    return;
  }
  if (name === 'win') {
    startLevel(state, 0);
    state.found = new Set([0, 1, 2, 3, 4, 5]);
    state.foundOrder = [0, 1, 2, 3, 4, 5];
    state.totalFound = 6;
    state.score = 1810;
    state.levelBonus = 1050;
    state.timeLeft = 105;
    state.screen = SCREEN_LEVEL_COMPLETE;
    state.message = '';
    state.frozen = true;
    return;
  }
  if (name === 'camp') {
    // Verification-only scene for the fourth level; not one of the entry's screenshots.
    startLevel(state, 3);
    stageFound(state, [0, 6], 225, 121);
    state.message = 'Found: The moon';
    state.messageUntil = state.now + 60;
    return;
  }
  // The cover: the garden mid-hunt, two found, four still to go.
  startLevel(state, 0);
  stageFound(state, [0, 2], 225, 105);
  state.message = 'Found: The colour of a flower';
  state.messageUntil = state.now + 60;
}
