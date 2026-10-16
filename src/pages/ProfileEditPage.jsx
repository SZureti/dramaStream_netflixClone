import { useEffect, useId, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Wordmark } from '../components/AppHeader.jsx';
import ProfileAvatar from '../components/ProfileAvatar.jsx';
import {
  AVATARS,
  LANGUAGES,
  MATURITY_LEVELS,
  SUBTITLE_SIZES,
  SUBTITLE_STYLES,
  useProfiles,
} from '../state/ProfileContext.jsx';
import PinDialog from '../components/PinDialog.jsx';
import { hashPin, isPin } from '../lib/pin.js';
import { useStatus } from '../state/StatusContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const KIDS_LEVELS = ['little-kids', 'older-kids'];

/** Add a profile (/profiles/new) or edit one (/profiles/:id/edit). */
export default function ProfileEditPage() {
  const { profileId } = useParams();
  const editing = Boolean(profileId);
  useDocumentTitle(editing ? 'Edit Profile' : 'Add Profile');
  const { loaded, profiles, createProfile, updateProfile, deleteProfile } = useProfiles();
  const { announce } = useStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const existing = profiles.find((p) => p.id === profileId);
  // A locked profile asks for its PIN before its settings open (unless Manage Profiles just did).
  const [unlocked, setUnlocked] = useState(Boolean(location.state?.unlocked));
  const ids = {
    name: useId(),
    nameError: useId(),
    maturity: useId(),
    language: useId(),
    size: useId(),
    style: useId(),
    pin: useId(),
    pinError: useId(),
  };

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[profiles.length % AVATARS.length]);
  const [isKids, setIsKids] = useState(false);
  const [maturity, setMaturity] = useState('all');
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [autoplayPreviews, setAutoplayPreviews] = useState(true);
  const [language, setLanguage] = useState('en');
  const [subtitleSize, setSubtitleSize] = useState('medium');
  const [subtitleStyle, setSubtitleStyle] = useState('white');
  const [lockOn, setLockOn] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setAvatar(existing.avatar);
    setIsKids(existing.is_kids);
    setMaturity(existing.max_maturity);
    setAutoplayNext(existing.autoplay_next);
    setAutoplayPreviews(existing.autoplay_previews);
    setLanguage(existing.language ?? 'en');
    setSubtitleSize(existing.subtitle_size ?? 'medium');
    setSubtitleStyle(existing.subtitle_style ?? 'white');
    setLockOn(Boolean(existing.pin_hash));
  }, [existing]);

  // A kids profile can only use the kids levels.
  const levels = isKids ? MATURITY_LEVELS.filter((l) => KIDS_LEVELS.includes(l.value)) : MATURITY_LEVELS;
  useEffect(() => {
    if (isKids && !KIDS_LEVELS.includes(maturity)) setMaturity('older-kids');
  }, [isKids, maturity]);

  if (loaded && editing && !existing) {
    return (
      <div className="profiles">
        <div className="profiles__body">
          <h1 className="profiles__title">That profile doesn’t exist</h1>
          <button type="button" className="profiles__manage" onClick={() => navigate('/profiles')}>
            Back to Profiles
          </button>
        </div>
      </div>
    );
  }

  if (loaded && editing && existing?.pin_hash && !unlocked) {
    return (
      <div className="profiles">
        <PinDialog profile={existing} onUnlock={() => setUnlocked(true)} onCancel={() => navigate('/profiles')} />
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) {
      setNameError('Give this profile a name.');
      return;
    }
    if (clean.length > 30) {
      setNameError('Profile names can be up to 30 characters.');
      return;
    }
    // Turning the lock on (or changing the PIN) needs 4 digits; keeping an existing lock doesn't.
    const changingPin = lockOn && (pin !== '' || !existing?.pin_hash);
    if (changingPin && !isPin(pin)) {
      setPinError('Enter exactly 4 digits.');
      return;
    }
    setNameError(null);
    setPinError(null);
    setFormError(null);
    setBusy(true);
    const fields = {
      name: clean,
      avatar,
      is_kids: isKids,
      max_maturity: maturity,
      autoplay_next: autoplayNext,
      autoplay_previews: autoplayPreviews,
      language,
      subtitle_size: subtitleSize,
      subtitle_style: subtitleStyle,
      ...(lockOn ? {} : { pin_hash: null }),
    };
    let result = editing ? await updateProfile(profileId, fields) : await createProfile(fields);
    // The PIN hash is salted with the profile id, so a new profile gets it after it exists.
    if (!result.error && changingPin) {
      const id = result.profile.id;
      result = await updateProfile(id, { pin_hash: await hashPin(id, pin) });
    }
    setBusy(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    announce(editing ? 'Profile saved' : `Added profile “${clean}”`);
    navigate('/profiles');
  }

  async function handleDelete() {
    setBusy(true);
    const result = await deleteProfile(profileId);
    setBusy(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    announce(`Deleted profile “${existing.name}”`);
    navigate('/profiles');
  }

  return (
    <div className="profiles">
      <header className="profiles__header">
        <Wordmark />
      </header>
      <div className="profiles__body profiles__body--form">
        <h1 className="profiles__title">{editing ? 'Edit Profile' : 'Add Profile'}</h1>
        {!editing && <p className="profiles__lede">Add a profile for another person watching DramaStream.</p>}

        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          {formError && (
            <p className="auth-form__error" role="alert">
              {formError}
            </p>
          )}

          <fieldset className="profile-form__avatars">
            <legend className="field-label">Icon</legend>
            <div className="profile-form__avatar-row">
              {AVATARS.map((color) => (
                <label key={color} className="profile-form__avatar">
                  <input
                    type="radio"
                    name="avatar"
                    value={color}
                    checked={avatar === color}
                    onChange={() => setAvatar(color)}
                  />
                  <ProfileAvatar color={color} size={56} />
                  <span className="sr-only">{color}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="auth-field">
            <label htmlFor={ids.name} className="field-label">
              Name
            </label>
            <input
              id={ids.name}
              className="field"
              value={name}
              maxLength={30}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={nameError ? 'true' : undefined}
              aria-describedby={nameError ? ids.nameError : undefined}
            />
            {nameError && (
              <p id={ids.nameError} className="field-error" role="alert">
                {nameError}
              </p>
            )}
          </div>

          <label className="profile-form__check">
            <input type="checkbox" checked={isKids} onChange={(e) => setIsKids(e.target.checked)} />
            <span>
              Kids profile
              <span className="field-hint">Only titles for kids, with a simpler home screen.</span>
            </span>
          </label>

          <div className="auth-field">
            <label htmlFor={ids.maturity} className="field-label">
              Maturity rating
            </label>
            <select id={ids.maturity} className="field" value={maturity} onChange={(e) => setMaturity(e.target.value)}>
              {levels.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label} ({l.ratings})
                </option>
              ))}
            </select>
            <p className="field-hint">Shows titles rated at this level and below.</p>
          </div>

          <div className="auth-field">
            <label htmlFor={ids.language} className="field-label">
              Preferred audio and subtitle language
            </label>
            <select id={ids.language} className="field" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="profile-form__settings">
            <legend className="field-label">Subtitle appearance</legend>
            <div className="profile-form__row">
              <div className="auth-field">
                <label htmlFor={ids.size} className="field-hint">
                  Size
                </label>
                <select
                  id={ids.size}
                  className="field"
                  value={subtitleSize}
                  onChange={(e) => setSubtitleSize(e.target.value)}
                >
                  {SUBTITLE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="auth-field">
                <label htmlFor={ids.style} className="field-hint">
                  Style
                </label>
                <select
                  id={ids.style}
                  className="field"
                  value={subtitleStyle}
                  onChange={(e) => setSubtitleStyle(e.target.value)}
                >
                  {SUBTITLE_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className={`subtitle-preview subtitle-preview--${subtitleSize} subtitle-preview--${subtitleStyle}`}>
              This is how subtitles will look.
            </p>
          </fieldset>

          <fieldset className="profile-form__settings">
            <legend className="field-label">Profile Lock</legend>
            <label className="profile-form__check">
              <input
                type="checkbox"
                checked={lockOn}
                onChange={(e) => {
                  setLockOn(e.target.checked);
                  setPin('');
                  setPinError(null);
                }}
              />
              <span>
                Require a 4-digit PIN to open this profile
                <span className="field-hint">Keeps others (like kids) out of this profile on shared devices.</span>
              </span>
            </label>
            {lockOn && (
              <div className="auth-field">
                <label htmlFor={ids.pin} className="field-hint">
                  {existing?.pin_hash ? 'New PIN (leave blank to keep the current one)' : 'PIN'}
                </label>
                <input
                  id={ids.pin}
                  className="field profile-form__pin"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  aria-invalid={pinError ? 'true' : undefined}
                  aria-describedby={pinError ? ids.pinError : undefined}
                />
                {pinError && (
                  <p id={ids.pinError} className="field-error" role="alert">
                    {pinError}
                  </p>
                )}
              </div>
            )}
          </fieldset>

          <fieldset className="profile-form__settings">
            <legend className="field-label">Playback</legend>
            <label className="profile-form__check">
              <input type="checkbox" checked={autoplayNext} onChange={(e) => setAutoplayNext(e.target.checked)} />
              <span>Autoplay the next episode of a series</span>
            </label>
            <label className="profile-form__check">
              <input
                type="checkbox"
                checked={autoplayPreviews}
                onChange={(e) => setAutoplayPreviews(e.target.checked)}
              />
              <span>Autoplay previews while browsing</span>
            </label>
          </fieldset>

          <div className="profile-form__actions">
            <button type="submit" className="btn btn--primary" disabled={busy}>
              Save
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => navigate('/profiles')}>
              Cancel
            </button>
            {editing && profiles.length > 1 && (
              <button type="button" className="btn btn--secondary" onClick={() => setConfirmDelete(true)}>
                Delete Profile
              </button>
            )}
          </div>

          {confirmDelete && (
            <div className="profile-form__confirm" role="alertdialog" aria-labelledby="delete-profile-q">
              <p id="delete-profile-q">
                Delete “{existing?.name}”? Its My List, history, ratings and reviews will be gone for good.
              </p>
              <div className="profile-form__actions">
                <button type="button" className="btn confirm__danger" onClick={handleDelete} disabled={busy}>
                  Delete Profile
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setConfirmDelete(false)} autoFocus>
                  Keep Profile
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
