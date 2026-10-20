// TMDB gives out two credentials: a short v3 API key (sent as ?api_key=) and a
// long v4 "read access token" (a JWT, sent as a Bearer header). Accept either.
export function tmdbAuth(key: string): { headers: Record<string, string>; param: string } {
  return key.startsWith("eyJ")
    ? { headers: { Authorization: `Bearer ${key}` }, param: "" }
    : { headers: {}, param: `&api_key=${encodeURIComponent(key)}` };
}
