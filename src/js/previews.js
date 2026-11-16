// Resolves each track's `appleId` into Apple's 30-second preview (`src`) and its Apple Music page (`appleUrl`).
// Preview URLs can rotate, so they are looked up at runtime instead of being stored. The iTunes Lookup API is
// public, keyless and CORS-enabled. If it fails, tracks keep no `src` and audio.js plays the synth sample.

const LOOKUP = 'https://itunes.apple.com/lookup';

export async function loadPreviews(releases) {
  const tracks = releases.flatMap((r) => r.tracks).filter((t) => t.appleId);
  if (!tracks.length) return;
  try {
    const ids = tracks.map((t) => t.appleId).join(',');
    const res = await fetch(`${LOOKUP}?id=${ids}&country=AR&entity=song`);
    if (!res.ok) return;
    const { results } = await res.json();
    const byId = new Map(results.map((r) => [r.trackId, r]));
    tracks.forEach((t) => {
      const hit = byId.get(t.appleId);
      if (!hit?.previewUrl) return;
      t.src = hit.previewUrl;
      t.appleUrl = hit.trackViewUrl;
    });
  } catch {
    // Offline or blocked: keep the synth fallback.
  }
}
