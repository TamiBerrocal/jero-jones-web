const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

// Discography shown on the Dance page, newest first.
// Tracks: `playable` marks the ones with a preview; add `src` (an MP3 under public/audio/) to play the real
// preview instead of the synth sample. `synthRoot` only tunes the placeholder synth.
export const releases = [
  {
    id: 'amor',
    title: '¿De qué hablamos cuando hablamos de amor?',
    year: '2026',
    kind: 'EP',
    bg: '#EC8797',
    label: '#EC8797',
    img: asset('covers/amor.jpg'),
    backBg: '#EC8797',
    backInk: '#0B0B0B',
    synthRoot: 262,
    tracks: tracks(['Tu Bar', 'Nada Más en Mí', 'Pretensión', 'Viajes de Metal', 'Amor'], ['5:09', '4:11', '3:33', '3:53', '3:29']),
  },
  {
    id: 'circuito',
    title: 'Circuito',
    year: '2025',
    kind: 'Álbum',
    bg: '#B82A38',
    label: '#EC8797',
    img: asset('covers/circuito.jpg'),
    backBg: '#B82A38',
    backInk: '#D4D4D4',
    synthRoot: 174,
    tracks: tracks(
      ['Crónicas', '¡Cambio, Cambio!', 'Sin Aire', 'OXI', '¿Qué Hacés?', 'Sueño Fatal', 'Mejor Adiós'],
      ['3:03', '3:10', '4:14', '2:30', '3:19', '3:51', '3:37'],
    ),
  },
  {
    id: 'transferencia',
    title: 'Transferencia',
    year: '2023',
    kind: 'EP',
    bg: '#9A9C1C',
    label: '#9A9C1C',
    img: asset('covers/transferencia.jpg'),
    backBg: '#9A9C1C',
    backInk: '#0B0B0B',
    synthRoot: 196,
    tracks: tracks(['C++', 'Nostalgia', 'Voces de Invierno', 'Transferencia Tecno', 'Disco y T.V'], ['0:59', '3:38', '3:13', '3:26', '2:35']),
  },
  {
    id: 'hollywood',
    title: 'Hollywood está lejos de casa',
    year: '2022',
    kind: 'EP',
    bg: '#A5AEE4',
    label: '#A5AEE4',
    img: asset('covers/hollywood.jpg'),
    backBg: '#293484',
    backInk: '#F2F2F2',
    synthRoot: 220,
    tracks: tracks(['Pedro Raúl', 'El Hijo de la Bestia', 'Muñeca de Trapo', 'Tren de la Oportunidad'], ['3:13', '4:33', '4:20', '5:17']),
  },
];

// For now only the first track of each release has a preview.
function tracks(names, durations) {
  return names.map((name, i) => ({ name, duration: durations[i], playable: i === 0 }));
}
