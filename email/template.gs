// Welcome email sent to new newsletter subscribers (see welcome.gs).
// Plain JavaScript with no Apps Script APIs, so scripts/preview-email.mjs can render it in Node.
// Email clients only understand a small subset of HTML/CSS: table layout, inline styles, no web fonts,
// flexbox, SVG filters or JS. The torn headline and duotone live in the header image instead.

var EMAIL_SITE = 'https://tamiberrocal.github.io/jero-jones-web/';

function welcomeEmail() {
  var site = EMAIL_SITE;
  var c = {
    black: '#0b0b0b',
    paper: '#d4d4d4',
    pink: '#ec8797',
    lavender: '#a5aee4',
    white: '#f2f2f2',
    muted: '#8a8a8a',
  };
  // Single quotes only: this goes inside double-quoted style attributes.
  var font = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  var subject = 'Ya estás adentro';

  var link = function (href, label) {
    return '<a href="' + href + '" style="color:' + c.pink + ';font-weight:700;text-decoration:underline;">' + label + '</a>';
  };

  var html =
    '<!doctype html>' +
    '<html lang="es"><head>' +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<meta name="color-scheme" content="dark">' +
    '<meta name="supported-color-schemes" content="dark">' +
    '<title>' + subject + '</title>' +
    '<style>' +
    '@media (max-width: 620px) { .px { padding-left: 24px !important; padding-right: 24px !important; }' +
    ' .lead { font-size: 26px !important; } }' +
    '</style>' +
    '</head>' +
    '<body style="margin:0;padding:0;background:' + c.black + ';">' +
    // Inbox preview line
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' +
    'Gracias por sumarte. Te aviso primero cuando haya fechas o música nueva.' +
    '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + c.black + ';">' +
    '<tr><td align="center" style="padding:24px 0;">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:' + c.black + ';">' +
    // Header image
    '<tr><td style="padding:0;">' +
    '<a href="' + site + '"><img src="' + site + 'assets/email/header.jpg" width="600" height="200" ' +
    'alt="jero jones · Ya estás adentro" ' +
    'style="display:block;width:100%;max-width:600px;height:auto;border:0;background:' + c.black + ';color:' + c.paper + ';font-family:' + font + ';font-size:24px;font-weight:700;"></a>' +
    '</td></tr>' +
    // Pink rule, like the site's color blocks
    '<tr><td style="height:8px;line-height:8px;font-size:0;background:' + c.pink + ';">&nbsp;</td></tr>' +
    // Body
    '<tr><td class="px" style="padding:40px 48px 8px;font-family:' + font + ';color:' + c.paper + ';">' +
    '<p style="margin:0 0 16px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:' + c.lavender + ';">Newsletter</p>' +
    '<p class="lead" style="margin:0 0 20px;font-size:30px;line-height:1.1;font-weight:700;color:' + c.white + ';">¡Gracias por sumarte!</p>' +
    '<p style="margin:0 0 16px;font-size:17px;line-height:1.55;">' +
    'Desde ahora sos de los primeros en enterarte cuando haya fechas nuevas, lanzamientos o algo que no te podés perder. Pocos mails, prometido.' +
    '</p>' +
    '<p style="margin:0 0 32px;font-size:17px;line-height:1.55;">' +
    'Mientras tanto, pasá por ' + link(site + 'dance.html', 'Dance, dance, dance') + ' para escuchar los discos, ' +
    'o abrí ' + link(site + 'app/', 'Forma de Onda') + ' en el celu y sumate a bailar.' +
    '</p>' +
    '</td></tr>' +
    // Button: pink block with a hard paper shadow, drawn as right/bottom borders
    '<tr><td class="px" style="padding:0 48px 48px;">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>' +
    '<td style="background:' + c.pink + ';border-right:4px solid ' + c.paper + ';border-bottom:4px solid ' + c.paper + ';">' +
    '<a href="' + site + '" style="display:inline-block;padding:15px 28px;font-family:' + font + ';font-size:15px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:' + c.black + ';text-decoration:none;">Ir al sitio</a>' +
    '</td></tr></table>' +
    '</td></tr>' +
    // Footer
    '<tr><td class="px" style="padding:24px 48px 40px;border-top:1px solid #2a2a2a;font-family:' + font + ';font-size:13px;line-height:1.6;color:' + c.muted + ';">' +
    '<p style="margin:0 0 12px;">' +
    '<a href="https://www.instagram.com/jerojonespfg2/" style="color:' + c.paper + ';font-weight:700;text-decoration:none;">Instagram</a>' +
    '&nbsp;&nbsp;·&nbsp;&nbsp;' +
    '<a href="https://open.spotify.com/artist/4Tk06wQxbCfPYcxqxGE8yJ" style="color:' + c.paper + ';font-weight:700;text-decoration:none;">Spotify</a>' +
    '&nbsp;&nbsp;·&nbsp;&nbsp;' +
    '<a href="https://youtube.com/@jerojones" style="color:' + c.paper + ';font-weight:700;text-decoration:none;">YouTube</a>' +
    '</p>' +
    '<p style="margin:0 0 8px;">Te llegó este mail porque dejaste tu dirección en el sitio de Jero Jones. Si no fuiste vos, ignoralo.</p>' +
    '<p style="margin:0;">© 2026 Berrocal · Galvagni · Serber. Diseño Gráfico Digital. ORT Argentina.</p>' +
    '</td></tr>' +
    '</table>' +
    '</td></tr></table>' +
    '</body></html>';

  var text = [
    '¡Gracias por sumarte!',
    '',
    'Desde ahora sos de los primeros en enterarte cuando haya fechas nuevas, lanzamientos o algo que no te podés perder. Pocos mails, prometido.',
    '',
    'Mientras tanto, pasá por Dance, dance, dance para escuchar los discos: ' + site + 'dance.html',
    'O abrí Forma de Onda en el celu y sumate a bailar: ' + site + 'app/',
    '',
    'Sitio: ' + site,
    'Instagram: https://www.instagram.com/jerojonespfg2/',
    'Spotify: https://open.spotify.com/artist/4Tk06wQxbCfPYcxqxGE8yJ',
    'YouTube: https://youtube.com/@jerojones',
    '',
    'Te llegó este mail porque dejaste tu dirección en el sitio de Jero Jones. Si no fuiste vos, ignoralo.',
    '© 2026 Berrocal · Galvagni · Serber. Diseño Gráfico Digital. ORT Argentina.',
  ].join('\n');

  return { subject: subject, html: html, text: text };
}
