// Simulated fan pieces for the Home collage, in the shape `rpc/get_fan_gallery` returns
// (`display_name` is already "Nombre I."; the real rows never carry email or full last name).
// `image` stands in for the public Storage URL built from `file_path`.
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

export const SIMULATED_FAN_PIECES = [
  { id: 'demo-1', display_name: 'Tamara B.', comment: 'La hice con la foto de mi primer recital. Ojalá suene tan fuerte como se ve.', image: asset('crowd-lavanda.png') },
  { id: 'demo-2', display_name: 'Lucas G.', comment: 'Rosa y azul porque así me suena el disco.', image: asset('covers/circuito.jpg') },
  { id: 'demo-3', display_name: 'Martina S.', comment: null, image: asset('portrait-wink.jpg') },
  { id: 'demo-4', display_name: 'Juli R.', comment: 'Le subí el contraste hasta que dolió. Así me gusta.', image: asset('covers/hollywood.jpg') },
  { id: 'demo-5', display_name: 'Nico P.', comment: 'Desde Quilmes, con todo.', image: asset('crowd-terracota.png') },
  { id: 'demo-6', display_name: 'Cami F.', comment: 'Probé mil filtros y volví casi al original.', image: asset('covers/transferencia.jpg') },
  { id: 'demo-7', display_name: 'Santi M.', comment: 'Para escuchar fuerte en el colectivo.', image: asset('covers/amor.jpg') },
  { id: 'demo-8', display_name: 'Ana L.', comment: 'Mi primera tapa. ¡Que gane la pista!', image: asset('covers/tipos-y-minas.jpg') },
];
