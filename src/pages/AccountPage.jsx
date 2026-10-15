import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import { useStatus } from '../state/StatusContext.jsx';
import { useMyList } from '../state/MyListContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function AccountPage() {
  useDocumentTitle('Account');
  const { user, signOut } = useAuth();
  const { announce } = useStatus();
  const { savedIds } = useMyList();
  const navigate = useNavigate();
  const since = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  async function handleSignOut() {
    const { error } = await signOut();
    if (error) {
      announce(error);
      return;
    }
    announce('Signed out');
    navigate('/', { replace: true });
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
            <dt>My List</dt>
            <dd>
              {savedIds.length} {savedIds.length === 1 ? 'title' : 'titles'} saved to this account ·{' '}
              <Link to="/my-list" className="account-card__link">
                Open My List
              </Link>
            </dd>
          </div>
        </dl>
      </section>

      <button type="button" className="btn btn--secondary" onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
}
