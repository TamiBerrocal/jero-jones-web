// Simulated newsletter signup. Replace with a real service (e.g. Mailchimp, Buttondown,
// a form endpoint) before sharing the site publicly.
export async function subscribe(email) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { ok: true, email };
}
