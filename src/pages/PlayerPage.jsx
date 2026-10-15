import { useLocation, useNavigate, useParams } from 'react-router-dom';
import MockPlayer from '../components/MockPlayer.jsx';
import { getTitleById } from '../data/catalog.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import NotFoundPage from './NotFoundPage.jsx';

export default function PlayerPage() {
  const { titleId } = useParams();
  const title = getTitleById(titleId);
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle(title ? `Watching ${title.title}` : 'Not found');

  if (!title) return <NotFoundPage missingTitleId={titleId} />;

  const detailsPath = `/titles/${title.id}`;
  // If we arrived from this title's details page, step back to it (keeps
  // history tidy); otherwise go there directly, carrying the original origin
  // forward so the details page's own Back still returns to Search/My List/Home.
  const from = location.state?.from;
  const backToDetails = () =>
    from === detailsPath
      ? navigate(-1)
      : navigate(detailsPath, { replace: true, state: from ? { from } : undefined });

  return <MockPlayer key={title.id} title={title} onBack={backToDetails} />;
}
