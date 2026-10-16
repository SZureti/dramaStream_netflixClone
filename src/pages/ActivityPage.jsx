import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import SmartImage from '../components/SmartImage.jsx';
import { getTitleById } from '../data/catalog.js';
import { FINISHED_AT, useProgress } from '../state/ProgressContext.jsx';
import { useProfiles } from '../state/ProfileContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const day = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/** Viewing activity for the current profile: every title played, newest first. */
export default function ActivityPage() {
  useDocumentTitle('Viewing activity');
  const { history } = useProgress();
  const { current } = useProfiles();
  const rows = history.filter((h) => getTitleById(h.titleId));

  return (
    <div className="page activity-page">
      <p>
        <Link to="/account" className="account-card__link">
          ← Account
        </Link>
      </p>
      <h1 className="page__title">Viewing activity</h1>
      <p className="page__lede">{current ? `What ${current.name} has watched, newest first.` : 'Newest first.'}</p>
      {rows.length === 0 ? (
        <EmptyState heading="Nothing watched yet">
          <p>Titles you play will appear here.</p>
        </EmptyState>
      ) : (
        <ol className="activity">
          {rows.map((h) => {
            const t = getTitleById(h.titleId);
            const done = h.position >= h.duration * FINISHED_AT;
            return (
              <li key={h.titleId} className="activity__row">
                <time dateTime={h.updatedAt} className="activity__date">
                  {day(h.updatedAt)}
                </time>
                <SmartImage src={t.heroSmallSrc} alt="" fallbackText="" className="activity__thumb" loading="lazy" />
                <span className="activity__title">
                  <Link to={`/titles/${t.id}`}>{t.title}</Link>
                  {h.season && (
                    <span className="activity__ep">
                      {' '}
                      · S{h.season}:E{h.episode}
                    </span>
                  )}
                </span>
                <span className="activity__status">
                  {done ? 'Finished' : `${Math.round((h.position / h.duration) * 100)}% watched`}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
