// Sound source for the Dance player: streams a track's Apple preview (`src`, see previews.js) through one
// <audio> element. dance.js follows its clock through onAudioTime / onAudioEnded.

const audioEl = new Audio();
audioEl.preload = 'none';

export const onAudioTime = (cb) => audioEl.addEventListener('timeupdate', () => cb(audioEl.currentTime, audioEl.src));
export const onAudioEnded = (cb) => audioEl.addEventListener('ended', cb);

export function stopSound() {
  audioEl.pause();
}

export function playSound(track, from = 0) {
  if (audioEl.src !== track.src) audioEl.src = track.src;
  audioEl.currentTime = from;
  audioEl.play().catch(() => {});
}
