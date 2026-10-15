// Profile lock: a 4-digit PIN stored only as a SHA-256 hash (salted with the
// profile id). Like Netflix's, it's a household lock to keep kids out of a
// profile, not account security; the account password protects the data.

export const isPin = (value) => /^\d{4}$/.test(value);

export async function hashPin(profileId, pin) {
  const bytes = new TextEncoder().encode(`dramastream:${profileId}:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function checkPin(profile, pin) {
  return Boolean(profile?.pin_hash) && isPin(pin) && (await hashPin(profile.id, pin)) === profile.pin_hash;
}
