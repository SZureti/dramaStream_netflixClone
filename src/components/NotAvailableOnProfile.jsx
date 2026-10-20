import { Link } from 'react-router-dom';
import EmptyState from './EmptyState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

/** Shown instead of a page the current (restricted, e.g. Kids) profile may not open. */
export default function NotAvailableOnProfile({ children }) {
  useDocumentTitle('Not available');
  return (
    <div className="page">
      <EmptyState
        heading="Not available on this profile"
        actions={
          <Link to="/" className="btn btn--primary">
            Back to Home
          </Link>
        }
      >
        {children}
      </EmptyState>
    </div>
  );
}
