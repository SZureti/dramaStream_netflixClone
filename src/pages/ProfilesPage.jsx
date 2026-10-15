import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wordmark } from '../components/AppHeader.jsx';
import ProfileAvatar from '../components/ProfileAvatar.jsx';
import { PlusIcon } from '../components/Icons.jsx';
import PinDialog from '../components/PinDialog.jsx';
import { MAX_PROFILES, useProfiles } from '../state/ProfileContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

/** "Who's watching?" — pick a profile, or switch to Manage Profiles to edit them. */
export default function ProfilesPage() {
  useDocumentTitle('Who’s watching?');
  const { loaded, profiles, selectProfile } = useProfiles();
  const navigate = useNavigate();
  const [managing, setManaging] = useState(false);
  const [locked, setLocked] = useState(null); // profile waiting for its PIN
  const [then, setThen] = useState(null); // where to go after unlocking

  if (!loaded) {
    return (
      <div className="profiles">
        <p role="status">Loading profiles…</p>
      </div>
    );
  }

  const open = (profile) => {
    if (managing) {
      navigate(`/profiles/${profile.id}/edit`, { state: { unlocked: true } });
      return;
    }
    selectProfile(profile.id);
    navigate('/', { replace: true });
  };

  // A locked profile asks for its PIN first, for watching and for editing.
  const choose = (profile) => {
    if (profile.pin_hash) {
      setThen(() => () => open(profile));
      setLocked(profile);
    } else {
      open(profile);
    }
  };

  return (
    <div className="profiles">
      <header className="profiles__header">
        <Wordmark />
      </header>
      <div className="profiles__body">
        <h1 className="profiles__title">{managing ? 'Manage Profiles:' : 'Who’s watching?'}</h1>
        <ul className="profiles__grid">
          {profiles.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={`profile-tile${managing ? ' profile-tile--manage' : ''}`}
                onClick={() => choose(p)}
              >
                <span className="profile-tile__art">
                  <ProfileAvatar color={p.avatar} size="100%" kids={p.is_kids} />
                  {managing && (
                    <span className="profile-tile__edit" aria-hidden="true">
                      ✎
                    </span>
                  )}
                </span>
                <span className="profile-tile__name">
                  {managing && <span className="sr-only">Edit </span>}
                  {p.name}
                  {p.pin_hash && (
                    <span className="profile-tile__lock">
                      <span aria-hidden="true"> 🔒</span>
                      <span className="sr-only"> (locked)</span>
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
          {profiles.length < MAX_PROFILES && (
            <li>
              <Link to="/profiles/new" className="profile-tile profile-tile--add">
                <span className="profile-tile__art profile-tile__art--add">
                  <PlusIcon size={48} />
                </span>
                <span className="profile-tile__name">Add Profile</span>
              </Link>
            </li>
          )}
        </ul>
        <button
          type="button"
          className={`profiles__manage${managing ? ' profiles__manage--done' : ''}`}
          onClick={() => setManaging((m) => !m)}
        >
          {managing ? 'Done' : 'Manage Profiles'}
        </button>
      </div>
      <PinDialog
        profile={locked}
        onCancel={() => setLocked(null)}
        onUnlock={() => {
          setLocked(null);
          then?.();
        }}
      />
    </div>
  );
}
