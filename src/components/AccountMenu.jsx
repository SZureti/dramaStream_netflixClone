import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import { useStatus } from '../state/StatusContext.jsx';
import { useProfiles } from '../state/ProfileContext.jsx';
import ProfileAvatar from './ProfileAvatar.jsx';
import { ChevronDownIcon } from './Icons.jsx';

/**
 * Signed in: the profile icon opens a menu to switch profiles, manage them,
 * and reach Account, Help and Sign out.
 * Signed out: a Sign In button. A disclosure (button + list of links) rather
 * than an ARIA menu, so Tab and screen readers behave like ordinary links.
 */
export default function AccountMenu() {
  const { available, user, signOut } = useAuth();
  const { announce } = useStatus();
  const { profiles, current, selectProfile } = useProfiles();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const menuId = useId();

  // Close on route change, outside click, or Escape (returning focus to the button).
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
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

  if (!available) return null;

  if (!user) {
    return (
      <Link to={`/signin?next=${encodeURIComponent(pathname)}`} className="btn btn--sm header-signin">
        Sign In
      </Link>
    );
  }

  const others = profiles.filter((p) => p.id !== current?.id);
  const switchTo = (profile) => {
    setOpen(false);
    selectProfile(profile.id);
    announce(`Switched to ${profile.name}`);
    navigate('/');
  };

  async function handleSignOut() {
    setOpen(false);
    const { error } = await signOut();
    announce(error ?? 'Signed out');
    if (!error) navigate('/', { replace: true });
  }

  return (
    <div className="account-menu" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="account-menu__button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        <ProfileAvatar color={current?.avatar ?? 'red'} size={32} />
        <span className="sr-only">
          Account menu{current ? `, watching as ${current.name}` : ''} ({user.email})
        </span>
        <ChevronDownIcon size={16} className="account-menu__caret" />
      </button>
      <div id={menuId} className="account-menu__panel" hidden={!open}>
        {others.length > 0 && (
          <ul className="account-menu__profiles" aria-label="Switch profile">
            {others.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => switchTo(p)}>
                  <ProfileAvatar color={p.avatar} size={28} />
                  <span>
                    <span className="sr-only">Switch to </span>
                    {p.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="account-menu__email">{user.email}</p>
        <ul>
          <li>
            <Link to="/profiles">Manage Profiles</Link>
          </li>
          <li>
            <Link to="/account">Account</Link>
          </li>
          <li>
            <Link to="/help">Help</Link>
          </li>
          <li>
            <button type="button" onClick={handleSignOut}>
              Sign out of DramaStream
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
