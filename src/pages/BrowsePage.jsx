import { useId } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import TitleCard from '../components/TitleCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getTitlesByType } from '../data/catalog.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import NotFoundPage from './NotFoundPage.jsx';

// URL slug → catalog type, Netflix-style names.
export const BROWSE = {
  series: { type: 'series', title: 'TV Shows' },
  films: { type: 'film', title: 'Movies' },
  documentaries: { type: 'documentary', title: 'Documentaries' },
};

/** /browse/series, /browse/films, /browse/documentaries with a genre filter (?genre=). */
export default function BrowsePage() {
  const { kind } = useParams();
  const page = BROWSE[kind];
  const [params, setParams] = useSearchParams();
  const selectId = useId();
  useDocumentTitle(page?.title ?? 'Not found');
  if (!page) return <NotFoundPage />;

  const all = getTitlesByType(page.type);
  const genres = [...new Set(all.flatMap((t) => t.genres))].sort();
  const genre = genres.includes(params.get('genre')) ? params.get('genre') : '';
  const titles = genre ? all.filter((t) => t.genres.includes(genre)) : all;

  return (
    <div className="page browse-page">
      <div className="browse-page__head">
        <h1 className="page__title">{page.title}</h1>
        {genres.length > 1 && (
          <div className="browse-page__filter">
            <label htmlFor={selectId} className="sr-only">
              Genre
            </label>
            <select
              id={selectId}
              className="field browse-page__select"
              value={genre}
              onChange={(e) => setParams(e.target.value ? { genre: e.target.value } : {}, { replace: true })}
            >
              <option value="">All genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <p className="page__lede" role="status">
        {titles.length} {titles.length === 1 ? 'title' : 'titles'}
        {genre ? ` in ${genre}` : ''}
      </p>
      {titles.length === 0 ? (
        <EmptyState heading={`No ${page.title.toLowerCase()} here yet`}>
          <p>Nothing on this profile matches. Try another genre.</p>
        </EmptyState>
      ) : (
        <ul className="card-grid">
          {titles.map((t) => (
            <li key={t.id}>
              <TitleCard title={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
