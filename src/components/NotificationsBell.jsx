import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SmartImage from './SmartImage.jsx';
import { BellIcon } from './Icons.jsx';
import { getCatalog } from '../data/catalog.js';
import { buildNotifications, unreadCount } from '../data/notifications.js';
import { readJSON, writeJSON } from '../lib/storage.js';
import { useReminders } from '../state/RemindersContext.jsx';
import { useProfiles } from '../state/ProfileContext.jsx';

const seenKey = (profileId) => `dramastream:notifications-seen:${profileId ?? 'guest'}`;

function when(iso) {
  const days = Math.round((Date.now() - new Date(iso)) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

/** Header bell: new arrivals and reminders that came true. A disclosure, like the account menu. */
export default function NotificationsBell() {
  const { reminderIds } = useReminders();
  const { current } = useProfiles();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(() => readJSON(seenKey(current?.id), null));
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();

  const items = buildNotifications({ catalog: getCatalog(), reminderIds });
  const unread = unreadCount(items, lastSeen);

  useEffect(() => setLastSeen(readJSON(seenKey(current?.id), null)), [current?.id]);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !wrapRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && items.length) {
      // Opening the bell marks everything as read.
      const newest = items[0].at;
      writeJSON(seenKey(current?.id), newest);
      setTimeout(() => setLastSeen(newest), 1200); // keep the dots visible for a moment
    }
  };

  return (
    <div className="bell" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="bell__button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <BellIcon size={22} />
        <span className="sr-only">Notifications{unread ? `, ${unread} new` : ''}</span>
        {unread > 0 && (
          <span className="bell__count" aria-hidden="true">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      <div id={panelId} className="bell__panel" hidden={!open}>
        <p className="bell__heading">Notifications</p>
        {items.length === 0 ? (
          <p className="bell__empty">Nothing new yet. Use Remind Me on New &amp; Popular to hear when titles arrive.</p>
        ) : (
          <ul className="bell__list">
            {items.map((n) => (
              <li key={n.id} className={`bell__item${!lastSeen || n.at > lastSeen ? ' bell__item--unread' : ''}`}>
                <Link to={`/titles/${n.title.id}`} className="bell__link">
                  <SmartImage src={n.title.heroSmallSrc} alt="" fallbackText="" className="bell__thumb" />
                  <span>
                    <span className="bell__kind">{n.kind === 'available' ? 'Now available' : 'New arrival'}</span>
                    <span className="bell__title">{n.title.title}</span>
                    <span className="bell__when">{when(n.at)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link to="/new" className="bell__all">
          See New &amp; Popular
        </Link>
      </div>
    </div>
  );
}
