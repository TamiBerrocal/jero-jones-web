// Sound source for the Dance player. A track with `src` (an Apple preview, see previews.js) streams through an
// <audio> element; otherwise a short synthesized arpeggio stands in as a sample.

const SCALE = [0, 3, 7, 10, 12, 7, 3, 5];

let ctx = null;
let sequence = null;
const audioEl = new Audio();
audioEl.preload = 'none';

// Real previews report their own clock; dance.js listens here instead of ticking a timer.
export const onAudioTime = (cb) => audioEl.addEventListener('timeupdate', () => cb(audioEl.currentTime, audioEl.src));
export const onAudioEnded = (cb) => audioEl.addEventListener('ended', cb);

function getContext() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function stopSound() {
  if (sequence) {
    clearInterval(sequence);
    sequence = null;
  }
  audioEl.pause();
}

// Returns true when a real preview is playing (the caller then follows onAudioTime / onAudioEnded).
export function playSound(release, trackIndex, from = 0) {
  stopSound();
  const track = release.tracks[trackIndex];

  if (track.src) {
    if (audioEl.src !== track.src) audioEl.src = track.src;
    audioEl.currentTime = from;
    audioEl.play().catch(() => {});
    return true;
  }

  const ac = getContext();
  if (!ac) return;
  const root = release.synthRoot * Math.pow(2, (trackIndex % 4) / 12);
  let step = 0;
  sequence = setInterval(() => {
    const t0 = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = trackIndex % 2 ? 'square' : 'sawtooth';
    osc.frequency.value = root * Math.pow(2, SCALE[(step + trackIndex) % SCALE.length] / 12);
    gain.gain.setValueAtTime(0.06, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + 0.22);
    step++;
  }, 160 - (trackIndex % 3) * 20);
  return false;
}
