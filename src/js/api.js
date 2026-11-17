import { simulatedFanPieces } from './fans.js';

// Supabase project shared with the Forma de Onda app and the microsite. Only the anon key ever reaches the
// browser: it can insert newsletter rows and call get_fan_gallery, nothing else (RLS + grants, see
// el-disco-mobile-app/supabase/schema.sql). Values come from .env.production (and .env.local in dev).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const configured = Boolean(SUPABASE_URL && SUPABASE_KEY);

const headers = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
});

// Newsletter signup. `source` says which page the form was on ('home' or 'quien').
// The table is insert-only for the anon key; an email that's already there (409) counts as subscribed.
export async function subscribe(email, source = 'web') {
  if (!configured) throw new Error('Supabase is not configured');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify({ email: email.trim(), source }),
  });
  if (res.ok || res.status === 409) return { ok: true };
  throw new Error(`Newsletter signup failed: ${res.status}`);
}

// Fan pieces for the Home collage, newest first. get_fan_gallery only returns public, visible images whose file
// exists, with the name already shortened to "Nombre I." (never the email or the full last name).
const GALLERY_MAX = 200;
const publicImage = (path) =>
  `${SUPABASE_URL}/storage/v1/object/public/fan-pieces/${path.split('/').map(encodeURIComponent).join('/')}`;

export async function getFanPieces() {
  // Dev only: `?fans=300` simulates any number of pieces to check how the collage packs them.
  const requested = import.meta.env.DEV ? Number(new URLSearchParams(location.search).get('fans')) : 0;
  if (requested > 0) return simulatedFanPieces(Math.min(requested, 10000));
  if (!configured) return [];

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_fan_gallery`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ max_items: GALLERY_MAX }),
  });
  if (!res.ok) throw new Error(`Fan gallery failed: ${res.status}`);
  const rows = await res.json();
  return rows.map((row) => ({
    id: row.id,
    display_name: row.display_name,
    comment: row.comment,
    image: publicImage(row.file_path),
  }));
}
