// Odd Twin — Spot the Difference. Entry point: creates the state, stages a screenshot
// scene when ?shot= is present, attaches input, and runs the frame loop.

import { LOW_TIME_SECONDS } from './config.js';
import { playTick } from './audio.js';
import { attachInput } from './input.js';
import { render } from './render.js';
import { stageShot } from './shots.js';
import { createState, SCREEN_PLAY, tick } from './state.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const state = createState();

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) stageShot(shot, state);

attachInput(canvas, state);

let lastTimestamp = performance.now();
let lastWholeSecond = Math.ceil(state.timeLeft);

/** One frame: advance the clock, tick the timer's last-seconds sound, draw. */
function frame(timestamp) {
  const dt = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
  lastTimestamp = timestamp;
  tick(state, dt);
  if (state.screen === SCREEN_PLAY && !state.frozen && state.timeLeft <= LOW_TIME_SECONDS) {
    const wholeSecond = Math.ceil(state.timeLeft);
    if (wholeSecond !== lastWholeSecond && wholeSecond > 0) {
      lastWholeSecond = wholeSecond;
      if (wholeSecond <= 5) playTick();
    }
  }
  render(ctx, state);
  if (state.message && state.now < state.messageUntil) status.textContent = state.message;
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
