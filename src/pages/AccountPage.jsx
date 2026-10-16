import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileAvatar from '../components/ProfileAvatar.jsx';
import PlanPicker from '../components/PlanPicker.jsx';
import { planById } from '../data/plans.js';
import { useAuth } from '../state/AuthContext.jsx';
import { useStatus } from '../state/StatusContext.jsx';
import { MATURITY_LEVELS, useProfiles } from '../state/ProfileContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const maturityLabel = (v) => MATURITY_LEVELS.find((m) => m.value === v)?.label ?? v;

export default function AccountPage() {
  useDocumentTitle('Account');
  const { user, signOut, signOutEverywhere, changePlan } = useAuth();
  const { profiles } = useProfiles();
  const { announce } = useStatus();
  const navigate = useNavigate();
  const since = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const plan = planById(user.user_metadata?.plan) ?? planById('standard');
  const [changing, setChanging] = useState(false);
  const [nextPlan, setNextPlan] = useState(plan.id);
  const [busy, setBusy] = useState(false);

  async function handleSignOut(everywhere) {
    setBusy(true);
    const { error } = everywhere ? await signOutEverywhere() : await signOut();
    setBusy(false);
    if (error) {
      announce(error);
      return;
    }
    announce(everywhere ? 'Signed out on every device' : 'Signed out');
    navigate('/', { replace: true });
  }

  async function savePlan() {
    setBusy(true);
    const { error } = await changePlan(nextPlan);
    setBusy(false);
    if (error) {
      announce(error);
      return;
    }
    setChanging(false);
    announce(`Plan changed to ${planById(nextPlan).name}`);
  }

  return (
    <div className="page account-page">
      <h1 className="page__title">Account</h1>
      <p className="page__lede">Member since {since}</p>

      <section className="account-card" aria-labelledby="membership-heading">
        <h2 id="membership-heading" className="account-card__title">
          Membership
        </h2>
        <dl className="account-card__facts">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Password</dt>
            <dd>
              ••••••••{' '}
              <Link to="/reset-password" className="account-card__link">
                Change password
              </Link>
            </dd>
          </div>
          <div>
            <dt>Plan</dt>
            <dd>
              {plan.name} · {plan.resolution} · {plan.screens} {plan.screens === 1 ? 'screen' : 'screens'} · Free{' '}
              {!changing && (
                <button type="button" className="link-btn account-card__link" onClick={() => setChanging(true)}>
                  Change plan
                </button>
              )}
            </dd>
          </div>
        </dl>
        {changing && (
          <div className="account-card__plan">
            <PlanPicker value={nextPlan} onChange={setNextPlan} legend="Change plan" />
            <div className="account-card__actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={savePlan} disabled={busy}>
                Save plan
              </button>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setChanging(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="account-card" aria-labelledby="profiles-heading">
        <h2 id="profiles-heading" className="account-card__title">
          Profiles
        </h2>
        <ul className="account-profiles">
          {profiles.map((p) => (
            <li key={p.id} className="account-profiles__item">
              <ProfileAvatar color={p.avatar} size={44} kids={p.is_kids} />
              <span className="account-profiles__text">
                <span className="account-profiles__name">
                  {p.name}
                  {p.pin_hash && <span className="account-profiles__badge">Locked</span>}
                </span>
                <span className="account-profiles__meta">{maturityLabel(p.max_maturity)}</span>
              </span>
              <Link to={`/profiles/${p.id}/edit`} className="account-card__link">
                Edit<span className="sr-only"> {p.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="account-card__row">
          <Link to="/account/activity" className="account-card__link">
            Viewing activity
          </Link>
          <span aria-hidden="true"> · </span>
          <Link to="/profiles" className="account-card__link">
            Manage profiles
          </Link>
        </p>
      </section>

      <section className="account-card" aria-labelledby="security-heading">
        <h2 id="security-heading" className="account-card__title">
          Security
        </h2>
        <div className="account-card__actions">
          <button type="button" className="btn btn--secondary" onClick={() => handleSignOut(false)} disabled={busy}>
            Sign Out
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => handleSignOut(true)} disabled={busy}>
            Sign out of all devices
          </button>
        </div>
        <p className="field-hint">
          “All devices” ends every session for this account, including other browsers and phones.
        </p>
      </section>
    </div>
  );
}
