# Memoria técnica — Jero Jones

Ecosistema digital de Jero Jones: **sitio web** (3 páginas), **micrositio** de convocatoria a fans y **app móvil**
Forma de Onda. Este documento se centra en el sitio web y explica qué partes se comparten con los otros dos.

| Pieza | URL | Stack |
|---|---|---|
| Sitio web | https://tamiberrocal.github.io/jero-jones-web/ | Vite + HTML/CSS/JS vanilla |
| Micrositio | https://tamiberrocal.github.io/jero-jones-micrositio/ | Vite + HTML/CSS/JS vanilla |
| App Forma de Onda | build nativo (Android/iOS) y demo web | React Native + Expo |
| Backend compartido | Supabase (PostgreSQL, Storage, Auth) | — |

---

## 1. Tecnología elegida y justificación

### HTML + CSS + JavaScript sin framework
El sitio son tres páginas de contenido con una identidad visual muy marcada (títulos rasgados, duotonos,
grano, botones con sombra dura, tipografía condensada). No hay estado complejo ni rutas dinámicas, así que un
framework de componentes (React, Vue) sumaría peso y un paso de hidratación sin aportar nada. Con HTML estático
el contenido llega pintado en la primera respuesta, que es lo que más pesa en PageSpeed.

### Por qué no Bootstrap
Lo evaluamos y lo descartamos:
- **El diseño no es de grilla de componentes.** El canvas de diseño no usa cards, navbars ni modales estándar:
  usa piezas inclinadas que se superponen, escenarios *sticky* animados con el scroll y titulares recortados.
  Con Bootstrap habríamos pasado más tiempo pisando sus estilos que usándolos.
- **Peso.** El CSS de Bootstrap ocupa unos 230 KB sin minificar (~30 KB comprimido) y su JS otros ~80 KB, y
  casi todo quedaría sin usar. Lighthouse lo marca como "CSS sin usar" y bloquea el renderizado.
- **El layout ya lo resuelve CSS nativo.** Grid, Flexbox, `clamp()`, `position: sticky` y variables CSS cubren
  todo lo que antes requería Bootstrap, sin dependencias.
- **Un sistema propio y compartido.** Los tokens (`tokens.css`: paleta, tipografías, medidas) se copian tal cual
  al micrositio, así las dos webs se ven idénticas sin atarse a la nomenclatura de una librería.

### Por qué Vite
- **Multi-página real:** `vite.config.js` declara `index.html`, `quien.html` y `dance.html` como entradas. Cada
  página es un HTML estático que se puede indexar, no una SPA.
- **Build optimizado sin configurar nada:** minifica, separa el JS por página, agrega *hash* a los archivos para
  el caché y reescribe las rutas de assets.
- **Deploy en subcarpeta:** GitHub Pages sirve el sitio desde `/jero-jones-web/`; con `base` Vite reescribe todas
  las rutas absolutas en producción y en desarrollo siguen funcionando desde `/`.
- **Servidor de desarrollo instantáneo** con recarga en caliente, lo que agilizó mucho el ajuste fino del diseño.
- **Plugins propios en pocas líneas:** el plugin `first-paint` (ver Logros) se escribió en ~15 líneas.
- Es la misma herramienta del micrositio, así que los dos proyectos se mantienen igual.

### Por qué no WordPress
No hay un editor de contenido que lo justifique (el catálogo de lanzamientos cambia pocas veces y vive en
`releases.js`), y WordPress exige hosting con PHP y base de datos. Un sitio estático se publica gratis en
GitHub Pages, no tiene superficie de ataque del lado del servidor y es más rápido.

### Por qué Expo para la app
La app mide cuánto baila cada persona durante un recital con el acelerómetro del teléfono y arma un ranking en
vivo. El requisito central es **seguir midiendo con la pantalla bloqueada**, y eso ningún navegador lo permite
(Safari y Chrome cortan el acelerómetro apenas la pestaña se oculta). Hacía falta una app nativa, y Expo
(React Native) permite:
- **Una sola base de código en TypeScript** para Android, iOS y una versión web de demostración
  (`react-native-web`).
- **Builds en la nube con EAS** (`eas build`), sin depender de Android Studio ni Xcode para cada compilación.
- **Módulos ya resueltos** para sensores (`expo-sensors`), audio (`expo-audio`) y fuentes, y *config plugins* para
  ajustar lo nativo (servicio en primer plano en Android, audio en segundo plano en iOS) sin tocar código nativo.

**Publicación en tiendas.** La app no llegó a publicarse en Google Play ni en el App Store:
- **Apple** exige la membresía paga del Apple Developer Program (USD 99/año) incluso para distribuir por
  TestFlight. Además, mantener viva la app con una sesión de audio silenciosa es justo lo que las guías de
  revisión de Apple restringen (el modo audio en segundo plano es solo para apps que reproducen sonido de verdad),
  así que había un riesgo alto de rechazo.
- **Google Play** exige que las cuentas personales nuevas hagan una prueba cerrada con al menos 12 testers durante
  14 días antes de publicar, y pide una declaración justificando el servicio en primer plano y el uso de sensores
  en segundo plano. Esos plazos no entraban en el calendario de la entrega.

### Supabase como backend
Un único proyecto (plan gratuito) da servicio a las tres piezas: PostgreSQL, Storage para las imágenes, Auth y
Realtime para el ranking de la app. Desde las webs se consume con `fetch` contra su API REST, **sin SDK** (menos
JS que descargar), y solo con la clave pública `anon`. Las políticas RLS (Row Level Security) limitan lo que esa
clave puede hacer:
- `newsletter_subscribers`: solo INSERT (nadie puede leer los emails desde el navegador).
- `fan_submissions`: solo INSERT. La galería pública se lee con la función `get_fan_gallery()`, que devuelve
  "Nombre I." + comentario + imagen, y **nunca** el email ni el apellido completo.

---

## 2. Herramientas utilizadas

| Herramienta | Uso |
|---|---|
| **Vite 7** | Servidor de desarrollo, build multi-página, plugin `first-paint` |
| **JavaScript ES modules** | Un módulo por responsabilidad: `home.js`, `nav.js`, `dance.js`, `audio.js`, `previews.js`, `api.js`, `fan-wall.js`, `signup.js` |
| **CSS con custom properties** | `tokens.css` (sistema), `base.css`, `components.css` y una hoja por página |
| **Filtros SVG** (`feTurbulence`, `feDisplacementMap`, `feColorMatrix`) | Bordes rasgados, duotonos y grano, aplicados en vivo sobre fotos normales |
| **@fontsource** (Roboto / Roboto Condensed) | Tipografía de respaldo autoalojada |
| **sharp** + `scripts/png-to-webp.mjs` | Conversión de PNG a WebP sin pérdida |
| **Supabase** | Base de datos, Storage, RLS |
| **API pública de iTunes (Lookup)** | Previews de 30 s y links a Apple Music |
| **YouTube embed** | Video en "Mirá", cargado de forma diferida |
| **GitHub Actions + GitHub Pages** | Deploy automático en cada push a `main` |
| **Claude Design** | Canvas de diseño (boards Home, Quién, Dance) que funciona como fuente de verdad visual |
| **Expo / EAS / React Native** | App Forma de Onda |
| **Lighthouse / PageSpeed Insights** | Medición de rendimiento |

---

## 3. Pasos clave de configuración

1. **Proyecto Vite multi-página:** `npm create vite` con la plantilla vanilla, y en `vite.config.js` las tres
   entradas HTML en `build.rollupOptions.input`.
2. **Ruta base para GitHub Pages:** `base: '/jero-jones-web/'` solo en producción. En JS los assets se arman con
   `import.meta.env.BASE_URL`.
3. **Deploy:** workflow `.github/workflows/deploy.yml` (instala, `npm run build`, sube `dist/` como artefacto de
   Pages). En el repo, Settings → Pages → Source: *GitHub Actions*.
4. **Sistema visual:** se trasladaron los tokens del canvas y del manual de identidad a `tokens.css` y los
   motivos (rasgado, duotono, grano, sticker) a clases reutilizables en `base.css`.
5. **Assets del canvas:** cada imagen se descargó y se guardó en `public/assets/` con un nombre legible. Las
   secuencias del hero (51 cuadros) y de la gira (61 cuadros) se guardaron numeradas (`hero/NN.webp`, `tour/NN.webp`).
6. **Supabase:** se corrió `supabase/schema.sql` (tablas, buckets, políticas RLS y la función de galería). La URL y
   la clave `anon` van en `.env.production` (pública por diseño) y en `.env.local` para desarrollo. La clave
   `service_role` nunca entra al repo.
7. **Tipografías:** `font-family` con Helvetica Neue / Helvetica Neue Condensed primero y Roboto como respaldo.
   Gracias a `unicode-range` y `local()`, el navegador solo descarga Roboto si al dispositivo le falta Helvetica.
8. **Previews de audio:** cada tema en `releases.js` lleva su `appleId`; al cargar, una sola llamada a
   `itunes.apple.com/lookup` resuelve todos.

---

## 4. Logros y dificultades técnicas

### 4.1 Hero y gira animados con el scroll
El hero y el tablero de gira son secuencias de cuadros (51 y 61 imágenes) que avanzan con el scroll dentro de un
escenario *sticky*. El tablero de gira tiene letras tipo *split-flap* (como los carteles de aeropuerto) que se
detienen en cada ciudad y terminan en "TOUR 2026".
- **Dificultad:** los cuadros del hero pesan ~8 MB en total. Cargarlos con la página hundía el LCP.
- **Solución:** los cuadros nunca se cargan con la página. Los del hero empiezan con el primer scroll, toque o
  tecla (o ~2 s después de `load` si el navegador está ocioso); los de la gira, cuando faltan dos pantallas para
  llegar, de a seis por vez. Mientras un cuadro no llega se muestra el anterior más cercano, así que la animación
  nunca se ve en blanco.
- **Por qué no achicamos las imágenes para celular:** el escenario recorta y agranda el cuadro (`object-fit: cover`),
  y en pantallas retina las copias chicas se veían borrosas.

### 4.2 Primera pintura sin saltos (CLS)
PageSpeed marcaba CLS 0.917 en Home desktop: el layout saltaba cuando el JS armaba el hero y cuando el nav pasaba a
menú hamburguesa.
- Un **plugin propio de Vite** (`first-paint`) agrega la clase `js` a `<html>` antes de pintar (la versión estática
  sin JS queda bajo `html:not(.js)`) e inserta en línea, justo después del nav, el script `nav-fit.js`, que decide
  si la barra entra en una fila o pasa a hamburguesa **antes** de la primera pintura.
- Resultado: Home pasó de 73/52 a 99/100 (mobile/desktop) sin cambiar un solo píxel del diseño (se compararon
  capturas a 375, 768 y 1440 px).

### 4.3 Nav que nunca se parte en dos filas
En vez de un *breakpoint* fijo, `nav.js` mide si logo + links + botón entran en una fila (al cargar, al
redimensionar y cuando terminan de cargar las fuentes). Si no entran, colapsa a un menú de pantalla completa.
Publica su altura como `--nav-h`, que usan todos los escenarios *sticky*.

### 4.4 Reproductor de música (Dance)
Fue la parte que más versiones tuvo:
1. **Audio sintetizado.** El primer prototipo generaba un arpegio con la Web Audio API como muestra, porque no
   teníamos archivos de audio con derechos para publicar.
2. **YouTube oculto (descartado).** Usar los videos oficiales como fuente de audio con un reproductor invisible
   choca con los términos de la API de YouTube, que exigen un reproductor visible de al menos 200×200 px y
   prohíben usarlo solo como audio.
3. **Spotify (descartado).** Su API ya no entrega previews de 30 s a apps nuevas y el embed obliga a usar su
   propio reproductor visual, que rompía el diseño de la barra.
4. **iTunes Lookup API (solución final).** Es pública, sin clave y habilitada para CORS. Con el `appleId` de cada
   tema devuelve el preview oficial de 30 s y el link a Apple Music. El audio se reproduce en un `<audio>` propio, así
   que la barra de progreso, la pausa y el avance automático siguen el reloj real del audio, con el diseño del canvas.
- **Detalles:** las URLs de preview rotan, así que se resuelven en cada carga y nunca se guardan en el código.
  Cada tema enlaza a Apple Music, como piden los términos de uso. Al final se eliminó el sonido sintetizado de
  respaldo: si un preview no se resuelve, el tema aparece como "no disponible" en vez de sonar algo que no es la
  canción.

### 4.5 Filtros del micrositio: por qué no integrar Figma
Para que los fans diseñen su tapa evaluamos dos caminos: integrar Figma (que cada fan editara una plantilla) o
aplicar filtros en el navegador. Figma se descartó:
- **Un único canvas compartido.** La integración disponible genera o edita un archivo de Figma. Para que cada fan
  tuviera su propia tapa habría que duplicar el archivo por envío, o que todos trabajaran sobre el mismo canvas,
  pisándose entre sí y viendo los envíos de los demás antes de la moderación.
- **Cuentas y tokens.** La API REST de Figma solo permite leer el contenido. Para escribir hace falta un plugin
  corriendo dentro del editor con la sesión del usuario, o sea, cada fan necesitaría una cuenta de Figma. Usar un
  token propio desde una web estática lo dejaría expuesto públicamente.
- **Exportar el resultado** requiere otra llamada a la API de render por cada pieza, con límites de uso, y después
  subirla a Storage. Son más puntos donde puede fallar.
- **Experiencia:** abrir un editor profesional pesado es mucho pedir para una convocatoria pensada para el celular.

La solución fue un editor propio con **9 sliders de filtros CSS** (brillo, contraste, saturación, etc.) sobre la
foto que sube el fan. Al enviar, se dibuja la imagen en un `<canvas>` con `ctx.filter` a resolución original y se
sube un PNG a Supabase. Funciona sin cuenta, en cualquier celular y con privacidad (el email nunca se expone).

### 4.6 "Cerrando el circuito": la galería de fans
La sección de Home muestra las tapas que mandan los fans desde el micrositio. Las piezas son cuadradas, inclinadas,
se pueden superponer y se achican a medida que llegan más (hasta un mínimo de 20 px). Pasado ese mínimo, el
escenario crece. Al pasar el mouse (o tocar, en pantallas táctiles) aparece "Nombre I." y el comentario. Los datos
vienen de la función `get_fan_gallery()`, que nunca expone datos personales.

### 4.7 Imágenes y tipografía
- Las imágenes del primer pantallazo (LCP) llevan `fetchpriority="high"`, y el retrato de Quién además se precarga.
- **Tipografía unificada** en web, micrositio y app: Helvetica Neue si el dispositivo la tiene; si no, Roboto
  autoalojada (sin depender de Google Fonts).

### 4.8 Otras dificultades
- **Mantener tres proyectos coherentes:** tokens y componentes base se copian entre web y micrositio, y el esquema
  de base de datos vive en un único archivo (`schema.sql` del repo de la app).

---

## 5. Resultados de PageSpeed Insights

| Página | Mobile | Desktop |
|---|---|---|
| Home | [Informe mobile](https://pagespeed.web.dev/analysis/https-tamiberrocal-github-io-jero-jones-web/8ih7jbmykc?form_factor=mobile) | [Informe desktop](https://pagespeed.web.dev/analysis/https-tamiberrocal-github-io-jero-jones-web/8ih7jbmykc?form_factor=desktop) |
| ¿Quién es Jero Jones? | [Informe mobile](https://pagespeed.web.dev/analysis/https-tamiberrocal-github-io-jero-jones-web-quien-html/f2vdhhhf5r?form_factor=mobile) | [Informe desktop](https://pagespeed.web.dev/analysis/https-tamiberrocal-github-io-jero-jones-web-quien-html/f2vdhhhf5r?form_factor=desktop) |
| Dance, dance, dance | [Informe mobile](https://pagespeed.web.dev/analysis/https-tamiberrocal-github-io-jero-jones-web-dance-html/0dwudpn76r?form_factor=mobile) | [Informe desktop](https://pagespeed.web.dev/analysis/https-tamiberrocal-github-io-jero-jones-web-dance-html/0dwudpn76r?form_factor=desktop) |

Puntajes del sitio publicado (PageSpeed Insights, Lighthouse 13.6.0, 17/11/2026 20:39 GMT-3; mobile emulado
en Moto G Power):

| Página | Dispositivo | Rendimiento | Accesibilidad | Prácticas recomendadas | SEO |
|---|---|---|---|---|---|
| Home | Mobile | 99 | 96 | 100 | 100 |
| Home | Desktop | 100 | 96 | 100 | 100 |
| ¿Quién es Jero Jones? | Mobile | 99 | 100 | 100 | 100 |
| ¿Quién es Jero Jones? | Desktop | 100 | 100 | 100 | 100 |
| Dance, dance, dance | Mobile | 97 | 96 | 100 | 100 |
| Dance, dance, dance | Desktop | 100 | 96 | 100 | 100 |
