import { TYPES, formatEpisodes, formatLength } from '../data/catalog.js';

/** "2008 · [TV-MA] · 5 Seasons · Series" — rating is a bordered badge, not color-only. */
export default function MetaLine({ title, showType = true, showEpisodes = false, className = '' }) {
  const length = formatLength(title);
  const episodes = showEpisodes ? formatEpisodes(title) : null;
  return (
    <p className={`meta-line ${className}`}>
      <span>{title.releaseYear}</span>
      <span className="rating-badge" title={`Rated ${title.contentRating}`}>
        <span className="sr-only">Rated </span>
        {title.contentRating}
      </span>
      {length && <span>{length}</span>}
      {episodes && <span>{episodes}</span>}
      {showType && <span className="meta-line__type">{TYPES[title.type].label}</span>}
    </p>
  );
}
