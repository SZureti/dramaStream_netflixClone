import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchForm from '../components/SearchForm.jsx';
import TitleCard from '../components/TitleCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SearchIcon } from '../components/Icons.jsx';
import { catalog, searchCatalog } from '../data/catalog.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const SUGGESTIONS = ['Breaking Bad', 'Moonlight', 'The Crown', 'Free Solo', 'Whiplash', 'Succession'];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get('q') ?? '';
  // The field is driven by local state so typing stays instant and the caret
  // never jumps; the URL (?q=) is a mirror that lets the query survive
  // navigating to a title and back.
  const [query, setQueryState] = useState(urlQuery);
  const trimmed = query.trim();
  const results = searchCatalog(query);
  const inputRef = useRef(null);
  const lastPushed = useRef(urlQuery);

  // Pick up URL changes that didn't come from typing here (e.g. a "Search"
  // link while already on this page). Echoes of our own updates are ignored.
  useEffect(() => {
    if (urlQuery === lastPushed.current) return;
    lastPushed.current = urlQuery;
    setQueryState(urlQuery);
  }, [urlQuery]);

  useDocumentTitle(trimmed ? `Search: ${trimmed}` : 'Search');

  // Land in the search field when the screen opens.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const setQuery = (next) => {
    setQueryState(next);
    lastPushed.current = next;
    setParams(next ? { q: next } : {}, { replace: true });
  };

  const clear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="page search-page">
      <h1 className="page__title">Search</h1>
      <SearchForm ref={inputRef} value={query} onChange={setQuery} onClear={clear} />

      <p className="sr-only" role="status" aria-live="polite">
        {trimmed ? `${results.length} ${results.length === 1 ? 'title' : 'titles'} found` : ''}
      </p>

      {!trimmed && (
        <>
          <div className="search-prompt">
            <p className="search-prompt__text">
              Search all 12 drama films, series, and documentaries by title. Partial titles work too.
            </p>
            <div className="search-prompt__chips">
              <span className="search-prompt__label" id="suggestions-label">
                Try:
              </span>
              <ul className="chip-list" aria-labelledby="suggestions-label">
                {SUGGESTIONS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      className="chip"
                      onClick={() => {
                        setQuery(s);
                        // The chips disappear once there's a query; keep focus in the field.
                        inputRef.current?.focus();
                      }}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <section className="results" aria-labelledby="browse-all-heading">
            <h2 id="browse-all-heading" className="section-title">
              Browse the full catalog
            </h2>
            <ul className="card-grid">
              {catalog.map((t) => (
                <li key={t.id}>
                  <TitleCard title={t} showCategory />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {trimmed && results.length > 0 && (
        <section className="results" aria-labelledby="results-heading">
          <h2 id="results-heading" className="section-title">
            {results.length} {results.length === 1 ? 'result' : 'results'} for{' '}
            <span className="results__query">“{trimmed}”</span>
          </h2>
          <ul className="card-grid">
            {results.map((t) => (
              <li key={t.id}>
                <TitleCard title={t} showCategory eager />
              </li>
            ))}
          </ul>
        </section>
      )}

      {trimmed && results.length === 0 && (
        <EmptyState
          icon={<SearchIcon size={44} />}
          heading="No titles found"
          actions={
            <button type="button" className="btn btn--primary" onClick={clear}>
              Clear Search
            </button>
          }
        >
          <p>
            Nothing in the catalog matches <strong className="results__query">“{trimmed}”</strong>.
          </p>
          <p>Check the spelling, or try a shorter part of the title.</p>
        </EmptyState>
      )}
    </div>
  );
}
