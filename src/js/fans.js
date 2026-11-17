// Simulated fan pieces for the Home collage, in the shape `rpc/get_fan_gallery` returns
// (`display_name` is already "Nombre I."; the real rows never carry email or full last name).
// `image` stands in for the public Storage URL built from `file_path`.
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

const IMAGES = [
  'crowd-lavanda.webp', 'covers/circuito.jpg', 'portrait-wink.jpg', 'covers/hollywood.jpg',
  'crowd-terracota.webp', 'covers/transferencia.jpg', 'covers/amor.jpg', 'covers/tipos-y-minas.jpg',
];
const NAMES = [
  'Tamara B.', 'Lucas G.', 'Martina S.', 'Juli R.', 'Nico P.', 'Cami F.', 'Santi M.', 'Ana L.',
  'Facu D.', 'Sol V.', 'Tomi A.', 'Flor C.', 'Mati H.', 'Agus N.', 'Vicky O.', 'Lean T.',
];
const COMMENTS = [
  'La hice con la foto de mi primer recital. Ojalá suene tan fuerte como se ve.',
  'Rosa y azul porque así me suena el disco.',
  null,
  'Le subí el contraste hasta que dolió. Así me gusta.',
  'Desde Quilmes, con todo.',
  'Probé mil filtros y volví casi al original.',
  'Para escuchar fuerte en el colectivo.',
  'Mi primera tapa. ¡Que gane la pista!',
  'Encontré la tercera pista a las 3 de la mañana.',
];

const simulatedPiece = (i) => ({
  id: `demo-${i + 1}`,
  display_name: NAMES[i % NAMES.length],
  comment: COMMENTS[i % COMMENTS.length],
  image: asset(IMAGES[i % IMAGES.length]),
});

export const simulatedFanPieces = (count) => Array.from({ length: count }, (_, i) => simulatedPiece(i));
