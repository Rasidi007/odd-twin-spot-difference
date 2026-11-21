// Everything Odd Twin draws: the menu with miniature scene previews, the two picture
// panels with their markers, the timer, the counter, and the end screens. It also owns the
// clickable regions (buttons and level cards) that input.js reads each frame.

import { FOOTER_Y, HEADER_HEIGHT, LOW_TIME_SECONDS, MARKER_POP_SECONDS, PANEL, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { drawScenePanel, SCENES } from './scenes.js';
import { currentScene, formatTime, SCREEN_GAME_COMPLETE, SCREEN_GAME_OVER, SCREEN_LEVEL_COMPLETE, SCREEN_MENU, SCREEN_PLAY } from './state.js';
import { circle, roundRect, vGradient } from './draw.js';

const FONT = "'Trebuchet MS', 'Segoe UI', Verdana, sans-serif";

let regions = [];
let hoverId = null;

export function getRegions() {
  return regions;
}

export function setHover(id) {
  hoverId = id;
}

/** The region id under point (x, y), or null. */
export function regionAt(x, y) {
  for (let i = regions.length - 1; i >= 0; i -= 1) {
    const region = regions[i];
    if (x >= region.x && x <= region.x + region.w && y >= region.y && y <= region.y + region.h) return region.id;
  }
  return null;
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function text(ctx, str, x, y, font, fill, align = 'left', baseline = 'alphabetic') {
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(str, x, y);
}

function button(ctx, id, x, y, w, h, label, enabled = true) {
  regions.push({ id, x, y, w, h });
  const hovered = hoverId === id && enabled;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = hovered ? 14 : 8;
  ctx.shadowOffsetY = 3;
  roundRect(ctx, x, y, w, h, 10, enabled ? (hovered ? '#ffd94d' : '#f2b705') : '#4a5568');
  ctx.restore();
  text(ctx, label, x + w / 2, y + h / 2 + 1, `700 ${Math.min(19, h * 0.42)}px ${FONT}`, enabled ? '#241a05' : '#a0aec0', 'center', 'middle');
}

function ghostButton(ctx, id, x, y, w, h, label) {
  regions.push({ id, x, y, w, h });
  const hovered = hoverId === id;
  roundRect(ctx, x, y, w, h, 10, hovered ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.06)');
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  text(ctx, label, x + w / 2, y + h / 2 + 1, `700 18px ${FONT}`, '#e2e8f0', 'center', 'middle');
}

/** The deep-navy backdrop with a sprinkle of stars. */
function drawBackground(ctx, now) {
  vGradient(ctx, 0, 0, VIEW_WIDTH, VIEW_HEIGHT, '#0d1526', '#1a2a4a');
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  const dots = [[80, 40], [300, 90], [620, 30], [900, 70], [1150, 45], [200, 700], [1050, 720], [60, 620], [1250, 300], [20, 380]];
  for (const [x, y] of dots) circle(ctx, x, y, 1.6, 'rgba(255, 255, 255, 0.14)');
  void now;
}

function drawHeader(ctx, state) {
  text(ctx, 'ODD TWIN', 40, 46, `800 36px ${FONT}`, '#ffd94d');
  text(ctx, 'SPOT THE DIFFERENCE', 40, 72, `700 13px ${FONT}`, '#8fa3c8');
  if (state.screen !== SCREEN_MENU) {
    const scene = currentScene(state);
    text(ctx, `${scene.name}`, VIEW_WIDTH / 2, 42, `700 26px ${FONT}`, '#ffffff', 'center');
    text(ctx, `${scene.difficulty}  ·  Level ${state.levelIndex + 1} of ${SCENES.length}`, VIEW_WIDTH / 2, 70, `600 14px ${FONT}`, '#8fa3c8', 'center');
  }
  text(ctx, `SCORE  ${state.score}`, VIEW_WIDTH - 40, 44, `800 26px ${FONT}`, '#ffffff', 'right');
  text(ctx, `BEST  ${state.bestScore}`, VIEW_WIDTH - 40, 70, `600 14px ${FONT}`, '#8fa3c8', 'right');
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fillRect(40, HEADER_HEIGHT - 8, VIEW_WIDTH - 80, 1);
}

/** The countdown bar under the header; it turns red and pulses when time is low. */
function drawTimerBar(ctx, state) {
  const x = 40;
  const y = 96;
  const w = VIEW_WIDTH - 80;
  const h = 14;
  const scene = currentScene(state);
  const fraction = Math.max(0, state.timeLeft / scene.timeLimit);
  roundRect(ctx, x, y, w, h, 8, 'rgba(255, 255, 255, 0.1)');
  const color = fraction > 0.5 ? '#4ade80' : fraction > 0.25 ? '#fbbf24' : '#ef4444';
  const low = state.timeLeft <= LOW_TIME_SECONDS && state.screen === SCREEN_PLAY;
  const pulse = low ? 0.75 + 0.25 * Math.sin(state.now * 6) : 1;
  ctx.save();
  ctx.globalAlpha = pulse;
  if (fraction > 0.005) roundRect(ctx, x, y, Math.max(16, w * fraction), h, 8, color);
  ctx.restore();
  text(ctx, formatTime(state.timeLeft), x + w - 2, y + h + 20, `800 18px ${FONT}`, low ? '#ef4444' : '#e2e8f0', 'right');
}

/** "FOUND 2 / 6 — 4 TO GO" with one dot per difference. */
function drawCounter(ctx, state) {
  const scene = currentScene(state);
  const found = state.found.size;
  const total = scene.differences.length;
  const remaining = total - found;
  text(ctx, `FOUND  ${found} / ${total}`, 40, 140, `800 22px ${FONT}`, '#ffd94d');
  text(ctx, remaining === 0 ? 'ALL FOUND!' : `${remaining} TO GO`, 230, 140, `700 18px ${FONT}`, remaining === 0 ? '#4ade80' : '#e2e8f0');
  let dotX = 360;
  for (let i = 0; i < total; i += 1) {
    const isFound = state.found.has(i);
    circle(ctx, dotX, 132, 8, isFound ? '#ffd94d' : 'rgba(255, 255, 255, 0.12)');
    if (!isFound) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(dotX, 132, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    dotX += 24;
  }
}

/** One picture panel: the scene clipped to a rounded frame, labelled A or B. */
function drawPanel(ctx, scene, side, x) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  roundRect(ctx, x - 4, PANEL.y - 4, PANEL.width + 8, PANEL.height + 8, PANEL.radius + 4, '#0a0f1e');
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, PANEL.y, PANEL.width, PANEL.height, PANEL.radius);
  ctx.clip();
  ctx.translate(x, PANEL.y);
  drawScenePanel(ctx, scene, side);
  ctx.restore();
  // Corner badge: A on the left panel, B on the right.
  circle(ctx, x + 24, PANEL.y + 24, 15, 'rgba(10, 15, 30, 0.75)');
  text(ctx, side, x + 24, PANEL.y + 30, `800 18px ${FONT}`, '#ffffff', 'center');
}

/** A gold ring with a check mark, popping in on a fresh find. */
function drawFoundMarker(ctx, x, y, r, progress) {
  const scale = progress < 1 ? 1.55 - 0.55 * easeOutCubic(progress) : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.shadowColor = 'rgba(255, 217, 77, 0.8)';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r + 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-r * 0.4, 0);
  ctx.lineTo(-r * 0.1, r * 0.35);
  ctx.lineTo(r * 0.45, -r * 0.3);
  ctx.stroke();
  ctx.restore();
}

/** The hint's pulsing cyan ring around one difference still unfound. */
function drawHintRing(ctx, x, y, r, now) {
  const pulse = 0.5 + 0.5 * Math.sin(now * 6);
  ctx.save();
  ctx.globalAlpha = 0.55 + 0.45 * pulse;
  ctx.strokeStyle = '#67e8f9';
  ctx.lineWidth = 4 + 2 * pulse;
  ctx.beginPath();
  ctx.arc(x, y, r + 8 + 4 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawPanels(ctx, state) {
  const scene = currentScene(state);
  drawPanel(ctx, scene, 'A', PANEL.leftX);
  drawPanel(ctx, scene, 'B', PANEL.rightX);
  const panelXs = [PANEL.leftX, PANEL.rightX];
  // Found markers on both panels.
  for (const index of state.found) {
    const difference = scene.differences[index];
    const isLatest = index === state.lastFoundIndex;
    const progress = isLatest ? Math.min(1, (state.now - state.lastFoundAt) / MARKER_POP_SECONDS) : 1;
    for (const panelX of panelXs) {
      drawFoundMarker(ctx, panelX + difference.x, PANEL.y + difference.y, difference.r, progress);
    }
  }
  // The hint ring, on both panels.
  if (state.hintTarget >= 0 && state.now < state.hintUntil) {
    const difference = scene.differences[state.hintTarget];
    for (const panelX of panelXs) {
      drawHintRing(ctx, panelX + difference.x, PANEL.y + difference.y, difference.r, state.now);
    }
  }
  // Red X marks where wrong clicks landed.
  for (const mark of state.wrongMarks) {
    const panelX = mark.side === 'A' ? PANEL.leftX : PANEL.rightX;
    const x = panelX + mark.x;
    const y = PANEL.y + mark.y;
    const fade = Math.max(0, (mark.until - state.now) / 0.6);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x + 10, y + 10);
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x - 10, y + 10);
    ctx.stroke();
    ctx.restore();
  }
  // Floating score text over the panel that was clicked.
  for (const floatText of state.floatTexts) {
    const panelX = floatText.side === 'A' ? PANEL.leftX : PANEL.rightX;
    const progress = 1 - Math.max(0, (floatText.until - state.now) / 1.1);
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    text(ctx, floatText.text, panelX + floatText.x, PANEL.y + floatText.y - progress * 24, `800 20px ${FONT}`, '#ffd94d', 'center');
    ctx.restore();
  }
}

function drawFooter(ctx, state) {
  if (state.message && state.now < state.messageUntil) {
    text(ctx, state.message, VIEW_WIDTH / 2, FOOTER_Y + 28, `600 17px ${FONT}`, '#e2e8f0', 'center');
  }
  const buttonY = FOOTER_Y + 52;
  button(ctx, 'hint', 40, buttonY, 220, 48, `Hint  (${state.hintsLeft} left)`, state.hintsLeft > 0 && state.screen === SCREEN_PLAY);
  ghostButton(ctx, 'restart', 280, buttonY, 180, 48, 'Restart level');
  ghostButton(ctx, 'menu', 480, buttonY, 180, 48, 'Level select');
  ghostButton(ctx, 'sound', 1060, buttonY, 180, 48, state.muted ? 'Sound: off' : 'Sound: on');
  text(ctx, 'Click a difference in either picture  ·  H hint  ·  R restart  ·  Esc menu', VIEW_WIDTH / 2, FOOTER_Y + 136, `600 14px ${FONT}`, '#8fa3c8', 'center');
}

/** The menu: title, four level cards with miniature scene previews, how to play. */
function drawMenu(ctx, state) {
  drawBackground(ctx, state.now);
  text(ctx, 'ODD TWIN', VIEW_WIDTH / 2, 130, `800 72px ${FONT}`, '#ffd94d', 'center');
  text(ctx, 'SPOT THE DIFFERENCE', VIEW_WIDTH / 2, 172, `700 22px ${FONT}`, '#8fa3c8', 'center');
  text(ctx, 'Two pictures. A handful of sneaky changes. Find them all before the clock runs out.', VIEW_WIDTH / 2, 210, `600 17px ${FONT}`, '#e2e8f0', 'center');
  const cardW = 280;
  const cardH = 300;
  const gap = 20;
  const totalW = cardW * 4 + gap * 3;
  const startX = (VIEW_WIDTH - totalW) / 2;
  const cardY = 250;
  SCENES.forEach((scene, index) => {
    const x = startX + index * (cardW + gap);
    const id = `level-${index}`;
    regions.push({ id, x, y: cardY, w: cardW, h: cardH });
    const hovered = hoverId === id;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = hovered ? 22 : 12;
    ctx.shadowOffsetY = 6;
    roundRect(ctx, x, cardY, cardW, cardH, 16, hovered ? '#22355c' : '#182747');
    ctx.restore();
    // Miniature preview of the scene, left panel's version.
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x + 12, cardY + 12, cardW - 24, 178, 10);
    ctx.clip();
    ctx.translate(x + 12, cardY + 12);
    ctx.scale((cardW - 24) / 560, 178 / 400);
    drawScenePanel(ctx, scene, 'A');
    ctx.restore();
    text(ctx, scene.name, x + cardW / 2, cardY + 228, `800 21px ${FONT}`, '#ffffff', 'center');
    text(ctx, `${scene.difficulty}  ·  ${scene.differences.length} differences  ·  ${formatTime(scene.timeLimit)}`, x + cardW / 2, cardY + 256, `600 13px ${FONT}`, '#8fa3c8', 'center');
    text(ctx, scene.tagline, x + cardW / 2, cardY + 280, `600 12px ${FONT}`, '#a8b8d8', 'center');
  });
  text(ctx, 'Click a level to play.  A wrong click costs 5 seconds — a quick find after another builds a combo.', VIEW_WIDTH / 2, 610, `600 15px ${FONT}`, '#8fa3c8', 'center');
  if (state.bestScore > 0) {
    text(ctx, `Your best total score: ${state.bestScore}`, VIEW_WIDTH / 2, 650, `700 16px ${FONT}`, '#ffd94d', 'center');
  }
  ghostButton(ctx, 'sound', VIEW_WIDTH / 2 - 90, 690, 180, 44, state.muted ? 'Sound: off' : 'Sound: on');
}

/** A dimmed overlay panel for the end screens. */
function drawOverlayPanel(ctx, w, h) {
  ctx.fillStyle = 'rgba(8, 12, 24, 0.72)';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  const x = (VIEW_WIDTH - w) / 2;
  const y = (VIEW_HEIGHT - h) / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  roundRect(ctx, x, y, w, h, 20, '#16233f');
  ctx.restore();
  ctx.strokeStyle = 'rgba(255, 217, 77, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  return { x, y, w, h };
}

function drawLevelComplete(ctx, state) {
  const panel = drawOverlayPanel(ctx, 620, 400);
  const cx = panel.x + panel.w / 2;
  text(ctx, 'LEVEL CLEAR!', cx, panel.y + 74, `800 42px ${FONT}`, '#ffd94d', 'center');
  const scene = currentScene(state);
  text(ctx, `${scene.name} — all ${scene.differences.length} differences found`, cx, panel.y + 112, `600 17px ${FONT}`, '#e2e8f0', 'center');
  text(ctx, `Time bonus  +${state.levelBonus}`, cx, panel.y + 162, `700 22px ${FONT}`, '#4ade80', 'center');
  text(ctx, `Total score  ${state.score}`, cx, panel.y + 202, `800 28px ${FONT}`, '#ffffff', 'center');
  const isLast = state.levelIndex === SCENES.length - 1;
  if (!isLast) button(ctx, 'next', cx - 210, panel.y + 250, 420, 52, `Next level: ${SCENES[state.levelIndex + 1].name}`);
  ghostButton(ctx, 'replay', cx - 210, panel.y + (isLast ? 250 : 316), 200, 48, 'Replay level');
  ghostButton(ctx, 'menu', cx + 10, panel.y + (isLast ? 250 : 316), 200, 48, 'Level select');
}

function drawGameOver(ctx, state) {
  const panel = drawOverlayPanel(ctx, 620, 380);
  const cx = panel.x + panel.w / 2;
  const scene = currentScene(state);
  text(ctx, 'TIME UP!', cx, panel.y + 74, `800 42px ${FONT}`, '#ef4444', 'center');
  text(ctx, `You found ${state.found.size} of ${scene.differences.length} differences in ${scene.name}.`, cx, panel.y + 112, `600 17px ${FONT}`, '#e2e8f0', 'center');
  const remaining = scene.differences.filter((difference, index) => !state.found.has(index));
  text(ctx, `Still hiding: ${remaining.map((difference) => difference.name).join(' · ')}`, cx, panel.y + 148, `600 14px ${FONT}`, '#8fa3c8', 'center');
  text(ctx, `Score  ${state.score}`, cx, panel.y + 196, `800 26px ${FONT}`, '#ffffff', 'center');
  button(ctx, 'retry', cx - 210, panel.y + 240, 200, 52, 'Try again');
  ghostButton(ctx, 'menu', cx + 10, panel.y + 240, 200, 52, 'Level select');
}

function drawGameComplete(ctx, state) {
  const panel = drawOverlayPanel(ctx, 620, 420);
  const cx = panel.x + panel.w / 2;
  text(ctx, 'YOU FOUND THEM ALL!', cx, panel.y + 74, `800 38px ${FONT}`, '#ffd94d', 'center');
  text(ctx, `Every difference in all ${SCENES.length} scenes — ${state.totalFound} finds in total.`, cx, panel.y + 112, `600 17px ${FONT}`, '#e2e8f0', 'center');
  if (state.newBest) {
    text(ctx, 'NEW BEST SCORE!', cx, panel.y + 152, `800 22px ${FONT}`, '#4ade80', 'center');
  }
  text(ctx, `Final score  ${state.score}`, cx, panel.y + 202, `800 30px ${FONT}`, '#ffffff', 'center');
  text(ctx, `Best  ${state.bestScore}`, cx, panel.y + 236, `600 16px ${FONT}`, '#8fa3c8', 'center');
  button(ctx, 'menu', cx - 210, panel.y + 280, 420, 52, 'Back to level select');
}

/** Draw the whole frame for the current state. Rebuilds the clickable regions. */
export function render(ctx, state) {
  regions = [];
  if (state.screen === SCREEN_MENU) {
    drawMenu(ctx, state);
    return;
  }
  drawBackground(ctx, state.now);
  drawHeader(ctx, state);
  drawTimerBar(ctx, state);
  drawCounter(ctx, state);
  drawPanels(ctx, state);
  drawFooter(ctx, state);
  if (state.screen === SCREEN_LEVEL_COMPLETE) drawLevelComplete(ctx, state);
  else if (state.screen === SCREEN_GAME_OVER) drawGameOver(ctx, state);
  else if (state.screen === SCREEN_GAME_COMPLETE) drawGameComplete(ctx, state);
  void SCREEN_PLAY;
}
