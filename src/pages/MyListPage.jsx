import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import TitleCard from '../components/TitleCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { ListIcon } from '../components/Icons.jsx';
import { getTitleById } from '../data/catalog.js';
import { useMyList } from '../state/MyListContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function MyListPage() {
  useDocumentTitle('My List');
  const { savedIds, inAccount } = useMyList();
  const headingRef = useRef(null);
  // My List stores IDs; resolve them against the one canonical catalog.
  const saved = savedIds.map(getTitleById).filter(Boolean);

  // Removing a card removes the button that had focus; don't strand keyboard
  // users at the top of the document — return them to the page heading.
  useEffect(() => {
    if (document.activeElement === document.body) headingRef.current?.focus({ preventScroll: true });
  }, [savedIds.length]);

  return (
    <div className="page my-list-page">
      <div className="page__heading-row">
        <h1 className="page__title" ref={headingRef} tabIndex={-1}>
          My List
        </h1>
        {saved.length > 0 && (
          <p className="page__count">
            {saved.length} {saved.length === 1 ? 'title' : 'titles'}
          </p>
        )}
      </div>

      {saved.length === 0 ? (
        <EmptyState
          icon={<ListIcon size={44} />}
          heading="Your list is empty"
          actions={
            <Link to="/" className="btn btn--primary">
              Browse Titles
            </Link>
          }
        >
          <p>
            Choose <strong>Add to My List</strong> on any film, series, or documentary to save it here.
          </p>
          <p className="empty-state__hint">
            {inAccount ? 'Your list is saved to your account.' : 'Saved in this browser. Sign in to keep it on every device.'}
          </p>
        </EmptyState>
      ) : (
        <>
          <p className="page__lede">
            {inAccount
              ? 'Saved to your account, newest first.'
              : 'Saved in this browser, newest first. Sign in to keep your list on every device.'}
          </p>
          <ul className="card-grid">
            {saved.map((t) => (
              <li key={t.id}>
                <TitleCard title={t} headingLevel={2} showCategory showRemove eager />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
