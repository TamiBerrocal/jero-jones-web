// The 20 photos of the "Cerrando el circuito" album (senoidal.html), in book order: the patio show first
// (pages 1–5), then the big venue (pages 6–10). `caption` is optional and shows as a sticker note on the
// layouts that have room for one. `position` (optional) is the object-position for slots that crop.
//
// The files are built by `node scripts/album-photos.mjs` from the originals in assets-src/album/NN.jpg,
// which bakes in each photo's film look (grain, dust, tone). Change a photo there and rerun the script.
const asset = (name) => `${import.meta.env.BASE_URL}assets/album/${name}`;

export const ALBUM_PHOTOS = [
  { src: asset('01.webp'), alt: 'Jero Jones canta con la cabeza hacia atrás frente al teclado, bajo un árbol del patio', caption: 'Luces, cámara y ¡SHOW!' },
  { src: asset('02.webp'), alt: 'La banda toca frente a una pared de chapa con grafitis' },
  { src: asset('03.webp'), alt: 'El patio lleno: Jero Jones canta y el público saca fotos' },
  { src: asset('04.webp'), alt: 'Jero Jones extiende el cable del micrófono hacia la cámara', caption: 'Vos. Sí, vos.', position: '20% 50%' },
  { src: asset('05.webp'), alt: 'El guitarrista, agachado, ajusta sus pedales' },
  { src: asset('06.webp'), alt: 'El bajista toca con el baterista detrás' },
  { src: asset('07.webp'), alt: 'Jero Jones canta a los gritos con el bajista a su lado' },
  { src: asset('08.webp'), alt: 'Jero Jones toca el sintetizador con anteojos de sol' },
  { src: asset('09.webp'), alt: 'Tres fans abrazados cantan entre el público' },
  { src: asset('10.webp'), alt: 'De espaldas, Jero Jones canta mirando al público del patio' },
  { src: asset('11.webp'), alt: 'Jero Jones canta junto al bajista frente a la chapa pintada', position: '30% 50%' },
  { src: asset('12.webp'), alt: 'Jero Jones detrás del sintetizador, junto a la pared de grafitis' },
  { src: asset('13.webp'), alt: 'Desde el escenario, Jero Jones de traje blanco frente a un estadio lleno y haces de luz' },
  { src: asset('14.webp'), alt: 'Jero Jones canta al micrófono con anteojos de sol y moño' },
  { src: asset('15.webp'), alt: 'Una fan grita con el brazo en alto en la primera fila' },
  { src: asset('16.webp'), alt: 'Jero Jones, de espaldas, levanta el brazo frente al público' },
  { src: asset('17.webp'), alt: 'El público se estira para tocar a Jero Jones bajo luces rosas' },
  { src: asset('18.webp'), alt: 'Las piernas de Jero Jones, de pantalón blanco, sobre el escenario' },
  { src: asset('19.webp'), alt: 'Jero Jones canta sostenido por las manos del público', caption: 'Hoy te vas y estoy de vuelta en la arena' },
  { src: asset('20.webp'), alt: 'Jero Jones pasa música frente a una pista llena', caption: 'Mejor adiós', position: '30% 50%' },
];
