import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function NotFoundPage({ missingTitleId }) {
  useDocumentTitle('Not found');
  const isTitle = Boolean(missingTitleId);

  return (
    <div className="page not-found">
      <p className="not-found__code" aria-hidden="true">
        404
      </p>
      <EmptyState
        headingLevel={1}
        heading={isTitle ? 'We couldn’t find that title' : 'Lost your way?'}
        actions={
          <>
            <Link to="/" className="btn btn--primary">
              Go to Home
            </Link>
            <Link to="/search" className="btn btn--secondary">
              Search titles
            </Link>
          </>
        }
      >
        {isTitle ? (
          <p>
            There’s no title with the ID <code>{missingTitleId}</code> in the DramaStream catalog.
          </p>
        ) : (
          <p>This page doesn’t exist. You’ll find plenty to watch on the home page.</p>
        )}
      </EmptyState>
    </div>
  );
}
