const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

// Discography shown on the Dance page.
// Cover: either `img` (finished art) or `duo` (photo rendered as a duotone with the title on top).
// Tracks: add `src` (an MP3 under public/audio/) to play a real preview instead of the synth sample;
// `synthRoot` only tunes the placeholder synth.
export const releases = [
  {
    id: 'hollywood',
    title: 'Hollywood está lejos de casa',
    year: '2022',
    kind: 'Lanzamiento',
    bg: '#A5AEE4',
    label: '#A5AEE4',
    duo: { light: '#A5AEE4', dark: '#293484', img: asset('hero-crowd.jpg'), pos: 'center' },
    ink: '#D4D4D4',
    backBg: '#A5AEE4',
    backInk: '#293484',
    synthRoot: 220,
    tracks: placeholderTracks(4),
  },
  {
    id: 'transferencia',
    title: 'Transferencia',
    year: '2023',
    kind: 'Lanzamiento',
    bg: '#9A9C1C',
    label: '#9A9C1C',
    duo: { light: '#9A9C1C', dark: '#5C1D60', img: asset('portrait.jpg'), pos: 'top' },
    ink: '#D4D4D4',
    backBg: '#9A9C1C',
    backInk: '#0B0B0B',
    synthRoot: 196,
    tracks: placeholderTracks(5),
  },
  {
    id: 'circuito',
    title: 'Circuito',
    year: '2025',
    kind: 'Álbum',
    bg: '#B82A38',
    label: '#EC8797',
    img: asset('cover-wink.jpg'),
    backBg: '#B82A38',
    backInk: '#D4D4D4',
    synthRoot: 174,
    tracks: placeholderTracks(8),
  },
  {
    id: 'amor',
    title: '¿De qué hablamos cuando hablamos de amor?',
    year: '2026',
    kind: 'EP',
    bg: '#EC8797',
    label: '#EC8797',
    duo: { light: '#EC8797', dark: '#281D60', img: asset('video-still.jpg'), pos: 'center' },
    ink: '#D4D4D4',
    backBg: '#EC8797',
    backInk: '#0B0B0B',
    synthRoot: 262,
    tracks: placeholderTracks(5),
  },
];

function placeholderTracks(count) {
  return Array.from({ length: count }, (_, i) => ({ name: `[Tema ${i + 1}]`, duration: '[0:00]' }));
}
