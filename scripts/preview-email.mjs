// Renders email/template.gs to an HTML file for a quick look in the browser.
// Usage: node scripts/preview-email.mjs [out.html]   (default: email/preview.html, gitignored)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = readFileSync(`${root}email/template.gs`, 'utf8');
const welcomeEmail = new Function(`${source}\nreturn welcomeEmail;`)();
const { subject, html, text } = welcomeEmail();

const out = process.argv[2] ?? `${root}email/preview.html`;
// Show the local header so the preview works before the image is deployed.
const localHeader = new URL('../public/assets/email/header.jpg', import.meta.url).href;
writeFileSync(out, html.replace(/https:\/\/[^"]+\/assets\/email\/header\.jpg/, localHeader));
console.log(`Subject: ${subject}\nHTML: ${out}\n\n${text}`);
