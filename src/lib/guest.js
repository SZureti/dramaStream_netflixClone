// Remembers that a signed-out visitor chose "Browse without signing in", so
// Home stops sending them to the welcome page. Per browser only.
const KEY = 'dramastream:guest:v1';

export function hasChosenGuest() {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return true; // storage blocked: don't trap the visitor on the welcome page
  }
}

export function chooseGuest() {
  try {
    window.localStorage.setItem(KEY, '1');
  } catch {
    // Storage blocked: they'll just see the welcome page again next visit.
  }
}
