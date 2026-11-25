// The 20 photos of the "Cerrando el circuito" album (home-album.html), in book order.
// `caption` is optional and shows as a sticker note on the layouts that have room for one.
//
// PLACEHOLDERS: these reuse images already on the site until the curated photos arrive. To swap them in,
// save the files as public/assets/album/01.webp … 20.webp (PNGs: run scripts/png-to-webp.mjs) and point
// `src` at `asset('album/NN.webp')`. Any aspect ratio works: every slot crops with object-fit: cover.
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

export const ALBUM_PHOTOS = [
  { src: asset('hero/01.webp'), alt: 'Jero Jones en el escenario', caption: 'Primera fila, primera canción' },
  { src: asset('crowd-lavanda.webp'), alt: 'El público con las manos arriba' },
  { src: asset('covers/circuito.jpg'), alt: 'Tapa de Circuito' },
  { src: asset('portrait-wink.jpg'), alt: 'Jero Jones guiñando un ojo', caption: 'El guiño que nadie vio venir' },
  { src: asset('covers/hollywood.jpg'), alt: 'Tapa de Hollywood' },
  { src: asset('tour/10.webp'), alt: 'Fotograma de la gira Forma de onda' },
  { src: asset('covers/amor.jpg'), alt: 'Tapa de Amor' },
  { src: asset('crowd-terracota.webp'), alt: 'El público bailando' },
  { src: asset('hero/18.webp'), alt: 'Jero Jones cantando' },
  { src: asset('covers/transferencia.jpg'), alt: 'Tapa de Transferencia' },
  { src: asset('tour/30.webp'), alt: 'Fotograma de la gira Forma de onda' },
  { src: asset('covers/tipos-y-minas.jpg'), alt: 'Tapa de Tipos y minas', caption: 'Esta la armamos entre todos' },
  { src: asset('hero/30.webp'), alt: 'Jero Jones en el escenario' },
  { src: asset('tour/45.webp'), alt: 'Fotograma de la gira Forma de onda' },
  { src: asset('crowd-lavanda.webp'), alt: 'El público con las manos arriba' },
  { src: asset('hero/40.webp'), alt: 'Jero Jones bailando' },
  { src: asset('tour/55.webp'), alt: 'Fotograma de la gira Forma de onda' },
  { src: asset('covers/circuito.jpg'), alt: 'Tapa de Circuito' },
  { src: asset('portrait-wink.jpg'), alt: 'Jero Jones guiñando un ojo' },
  { src: asset('hero/51.webp'), alt: 'Jero Jones saludando', caption: 'Hasta la próxima vuelta' },
];
