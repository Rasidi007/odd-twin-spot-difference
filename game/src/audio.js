// Tiny synthesized sound effects for Odd Twin, made with the Web Audio API: no audio
// files are shipped. Every call is guarded, so a browser without audio still plays fine.

let audioContext = null;
let muted = false;

/** Create (or reuse) the audio context. Called on the first user gesture. */
export function ensureAudio() {
  if (audioContext) {
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    return;
  }
  try {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext = new AudioContextClass();
  } catch {
    audioContext = null;
  }
}

export function isMuted() {
  return muted;
}

export function toggleMuted() {
  muted = !muted;
  return muted;
}

/** Play one soft sine note: frequency, start delay, length, volume. */
function note(frequency, delay, duration, volume) {
  if (!audioContext || muted) return;
  try {
    const start = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  } catch {
    // Sound is decoration; a failure here must never break the game.
  }
}

/** Two rising notes when a difference is found. */
export function playFind() {
  note(660, 0, 0.12, 0.18);
  note(990, 0.07, 0.18, 0.18);
}

/** A low buzz for a wrong click. */
export function playWrong() {
  note(160, 0, 0.16, 0.14);
  note(120, 0.05, 0.18, 0.12);
}

/** A soft blip when a hint appears. */
export function playHint() {
  note(520, 0, 0.1, 0.12);
  note(780, 0.08, 0.12, 0.1);
}

/** A rising arpeggio when a level is cleared. */
export function playWin() {
  note(523, 0, 0.14, 0.16);
  note(659, 0.1, 0.14, 0.16);
  note(784, 0.2, 0.14, 0.16);
  note(1047, 0.3, 0.28, 0.18);
}

/** A short tick for the last seconds of the timer. */
export function playTick() {
  note(880, 0, 0.06, 0.07);
}
