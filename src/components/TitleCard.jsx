import { Link, useLocation } from 'react-router-dom';
import { formatLength } from '../data/catalog.js';
import SmartImage from './SmartImage.jsx';
import MyListButton from './MyListButton.jsx';
import { InfoIcon, PlayIcon } from './Icons.jsx';

/**
 * Poster card used by Browse, Search, My List, and "More Like This".
 * The poster + title is one link to the details page; quick actions sit beside
 * it (never nested inside the link) and appear on hover or keyboard focus.
 */
export default function TitleCard({
  title,
  headingLevel = 3,
  showCategory = false,
  showRemove = false,
  eager = false,
  className = '',
}) {
  const location = useLocation();
  const from = location.pathname + location.search;
  const Heading = `h${headingLevel}`;
  const detailsPath = `/titles/${title.id}`;
  const length = formatLength(title);

  return (
    <article className={`card ${className}`}>
      <div className="card__frame">
        <Link to={detailsPath} state={{ from }} className="card__link">
          <div className="card__poster">
            <SmartImage
              src={title.posterSrc}
              alt=""
              fallbackText={title.title}
              width="780"
              height="1170"
              loading={eager ? 'eager' : 'lazy'}
            />
          </div>
          <Heading className="card__title">{title.title}</Heading>
        </Link>

        <div className="card__overlay">
          <div className="card__actions">
            <Link
              to={`/watch/${title.id}`}
              state={{ from }}
              className="icon-btn icon-btn--play"
              aria-label={`Play ${title.title}`}
              title="Play"
            >
              <PlayIcon size={18} />
            </Link>
            <MyListButton title={title} variant="icon" />
            <Link
              to={detailsPath}
              state={{ from }}
              className="icon-btn card__info-btn"
              aria-label={`More info: ${title.title}`}
              title="More info"
            >
              <InfoIcon size={20} />
            </Link>
          </div>
          <p className="card__overlay-meta" aria-hidden="true">
            <span className="rating-badge rating-badge--sm">{title.contentRating}</span>
            {length && <span>{length}</span>}
          </p>
        </div>
      </div>

      <p className="card__meta">
        {showCategory ? (
          <>
            <span className="card__category">{title.category}</span>
            <span aria-hidden="true"> · </span>
            <span>{title.releaseYear}</span>
          </>
        ) : (
          <>
            <span>{title.releaseYear}</span>
            {length && (
              <>
                <span aria-hidden="true"> · </span>
                <span>{length}</span>
              </>
            )}
          </>
        )}
      </p>

      {showRemove && <MyListButton title={title} className="card__remove btn--sm" />}
    </article>
  );
}
