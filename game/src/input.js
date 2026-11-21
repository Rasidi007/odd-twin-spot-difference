// Mouse and keyboard input for Odd Twin: maps a click on the scaled canvas back to
// view coordinates, routes it to a button, a level card or a picture panel, and handles
// the keyboard shortcuts (H hint, R restart, Esc menu, 1-4 level select, M mute).

import { PANEL, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { ensureAudio, playFind, playHint, playWin, playWrong, toggleMuted } from './audio.js';
import { regionAt, setHover } from './render.js';
import { clickPanel, SCREEN_GAME_OVER, SCREEN_LEVEL_COMPLETE, SCREEN_MENU, SCREEN_PLAY, startLevel, useHint } from './state.js';
import { SCENES } from './scenes.js';

/** Convert a mouse event's client position to view coordinates. */
function toView(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT,
  };
}

/** Which panel (if any) a view point is on, with panel-local coordinates. */
function panelAt(x, y) {
  if (y < PANEL.y || y > PANEL.y + PANEL.height) return null;
  if (x >= PANEL.leftX && x <= PANEL.leftX + PANEL.width) {
    return { side: 'A', x: x - PANEL.leftX, y: y - PANEL.y };
  }
  if (x >= PANEL.rightX && x <= PANEL.rightX + PANEL.width) {
    return { side: 'B', x: x - PANEL.rightX, y: y - PANEL.y };
  }
  return null;
}

/** Run the action a button or level card names. */
function activate(state, id) {
  if (id.startsWith('level-')) {
    startLevel(state, Number(id.slice('level-'.length)));
    return;
  }
  switch (id) {
    case 'hint':
      if (useHint(state)) playHint();
      break;
    case 'restart':
    case 'retry':
    case 'replay':
      startLevel(state, state.levelIndex);
      break;
    case 'next':
      startLevel(state, Math.min(SCENES.length - 1, state.levelIndex + 1));
      break;
    case 'menu':
      state.screen = SCREEN_MENU;
      break;
    case 'sound':
      state.muted = toggleMuted();
      break;
    default:
      break;
  }
}

function onClick(canvas, state, event) {
  ensureAudio();
  const { x, y } = toView(canvas, event);
  const regionId = regionAt(x, y);
  if (regionId) {
    activate(state, regionId);
    return;
  }
  if (state.screen !== SCREEN_PLAY) return;
  const panel = panelAt(x, y);
  if (!panel) return;
  const result = clickPanel(state, panel.x, panel.y, panel.side);
  if (result === 'found') {
    playFind();
    if (state.screen === SCREEN_LEVEL_COMPLETE || state.screen === SCREEN_GAME_COMPLETE) playWin();
  } else if (result === 'miss') {
    playWrong();
  }
}

function onKey(state, event) {
  if (event.repeat) return;
  const key = event.key.toLowerCase();
  ensureAudio();
  if (key === 'm') {
    state.muted = toggleMuted();
    return;
  }
  if (key === 'escape') {
    state.screen = SCREEN_MENU;
    return;
  }
  if (state.screen === SCREEN_MENU && key >= '1' && key <= String(SCENES.length)) {
    startLevel(state, Number(key) - 1);
    return;
  }
  if (key === 'h') {
    if (useHint(state)) playHint();
    return;
  }
  if (key === 'r') {
    if (state.screen === SCREEN_PLAY || state.screen === SCREEN_GAME_OVER || state.screen === SCREEN_LEVEL_COMPLETE) {
      startLevel(state, state.levelIndex);
    }
    return;
  }
  if (key === 'enter') {
    if (state.screen === SCREEN_LEVEL_COMPLETE) {
      startLevel(state, Math.min(SCENES.length - 1, state.levelIndex + 1));
    } else if (state.screen === SCREEN_GAME_OVER) {
      startLevel(state, state.levelIndex);
    } else if (state.screen === SCREEN_GAME_COMPLETE) {
      state.screen = SCREEN_MENU;
    }
  }
}

/** Attach the listeners; the render loop keeps the regions current. */
export function attachInput(canvas, state) {
  canvas.addEventListener('click', (event) => onClick(canvas, state, event));
  canvas.addEventListener('mousemove', (event) => {
    const { x, y } = toView(canvas, event);
    setHover(regionAt(x, y));
    canvas.style.cursor = regionAt(x, y) || (state.screen === SCREEN_PLAY && panelAt(x, y)) ? 'pointer' : 'default';
  });
  window.addEventListener('keydown', (event) => onKey(state, event));
}
