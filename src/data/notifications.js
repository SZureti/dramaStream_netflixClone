// Notifications for the header bell, worked out from data the app already has:
//   - "Now available": a title you asked to be reminded about has arrived.
//   - "New arrival": a title added to DramaStream recently.
// Pure functions so they're easy to test; NotificationsBell supplies the inputs.

const DAY = 24 * 60 * 60 * 1000;
const NEW_FOR_DAYS = 30;

/**
 * @param catalog      titles available now (getCatalog())
 * @param reminderIds  title ids the viewer asked to be reminded about
 * @param now          Date (injectable for tests)
 * @returns newest first: [{ id, kind: 'available' | 'new', title, at: ISO string }]
 */
export function buildNotifications({ catalog, reminderIds, now = new Date() }) {
  const items = [];
  for (const t of catalog) {
    if (reminderIds.includes(t.id) && t.availableFrom) {
      items.push({ id: `available:${t.id}`, kind: 'available', title: t, at: `${t.availableFrom}T00:00:00.000Z` });
    } else if (t.availableFrom && now - new Date(t.availableFrom) < NEW_FOR_DAYS * DAY) {
      items.push({ id: `new:${t.id}`, kind: 'new', title: t, at: `${t.availableFrom}T00:00:00.000Z` });
    } else if (t.addedAt && now - new Date(t.addedAt) < NEW_FOR_DAYS * DAY) {
      items.push({ id: `new:${t.id}`, kind: 'new', title: t, at: t.addedAt });
    }
  }
  return items.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 12);
}

/** How many items arrived after the viewer last opened the bell. */
export function unreadCount(items, lastSeenIso) {
  if (!lastSeenIso) return items.length;
  return items.filter((n) => n.at > lastSeenIso).length;
}
