import { SIMULATED_FAN_PIECES } from './fans.js';

// Simulated newsletter signup. Replace with a real service (e.g. Mailchimp, Buttondown,
// a form endpoint) before sharing the site publicly.
export async function subscribe(email) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { ok: true, email };
}

// Fan pieces for the Home collage. Simulated for now.
// TODO: once the microsite is live, fetch them from Supabase with the anon key only:
//   POST {VITE_SUPABASE_URL}/rest/v1/rpc/get_fan_gallery  (headers: apikey + Authorization: Bearer <anon>)
//   image = {VITE_SUPABASE_URL}/storage/v1/object/public/fan-pieces/{file_path}
// The RPC returns only id, display_name ("Nombre I."), comment, file_path, created_at.
export async function getFanPieces() {
  return SIMULATED_FAN_PIECES;
}
