// Shared constants for Odd Twin: canvas size, panel geometry, scoring and timing.
// Every other module reads these, so the layout lives in exactly one place.

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 800;

// The two picture panels, side by side, in view coordinates.
export const PANEL = {
  width: 560,
  height: 400,
  leftX: 40,
  rightX: 680,
  y: 150,
  radius: 14,
};

// Header and footer bands.
export const HEADER_HEIGHT = 96;
export const FOOTER_Y = 596;

// Scoring.
export const POINTS_PER_FIND = 100;
export const POINTS_PER_COMBO_STEP = 25;
export const COMBO_WINDOW_SECONDS = 4;
export const WRONG_CLICK_TIME_PENALTY = 5;
export const WRONG_CLICK_SCORE_PENALTY = 25;
export const TIME_BONUS_PER_SECOND = 10;
export const HINTS_PER_LEVEL = 3;
export const HINT_DURATION_SECONDS = 2;

// Feel.
export const MARKER_POP_SECONDS = 0.28;
export const WRONG_MARK_SECONDS = 0.6;
export const FLOAT_TEXT_SECONDS = 1.1;
export const LOW_TIME_SECONDS = 20;

export const GAME_TITLE = 'Odd Twin';
export const GAME_SUBTITLE = 'Spot the Difference';
