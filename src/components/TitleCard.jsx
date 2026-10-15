import { Link, useLocation } from 'react-router-dom';
import { formatLength } from '../data/catalog.js';
import SmartImage from './SmartImage.jsx';
import MyListButton from './MyListButton.jsx';
import { InfoIcon, PlayIcon } from './Icons.jsx';
import ThumbsRating from './ThumbsRating.jsx';
import { useReviews } from '../state/ReviewsContext.jsx';

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
  progress = null, // { position, duration } for Continue Watching
  onRemoveFromRow = null,
  rank, // position in a Top 10 row
}) {
  const { summary, rate } = useReviews();
  const myRating = summary(title.id).myRating;
  const location = useLocation();
  const from = location.pathname + location.search;
  // Details open as a modal over the page underneath (kept when hopping between modals).
  const backgroundLocation = location.state?.backgroundLocation ?? location;
  const Heading = `h${headingLevel}`;
  const detailsPath = `/titles/${title.id}`;
  const length = formatLength(title);
  const pct = progress ? Math.min(100, Math.round((progress.position / progress.duration) * 100)) : null;
  const minutesLeft = progress ? Math.max(1, Math.round((progress.duration - progress.position) / 60)) : null;

  return (
    <article className={`card ${className}`}>
      <div className="card__frame">
        <Link to={detailsPath} state={{ from, backgroundLocation }} className="card__link">
          <div className="card__poster">
            <SmartImage
              src={title.posterSrc}
              srcSet={title.posterSrcSet}
              sizes="(max-width: 600px) 45vw, 240px"
              alt=""
              fallbackText={title.title}
              width="780"
              height="1170"
              loading={eager ? 'eager' : 'lazy'}
            />
            {pct !== null && (
              <div className="card__progress" aria-hidden="true">
                <div className="card__progress-fill" style={{ width: `${pct}%` }} />
              </div>
            )}
          </div>
          <Heading className="card__title">
            {rank && <span className="sr-only">Number {rank}: </span>}
            {title.title}
          </Heading>
        </Link>

        <div className="card__overlay">
          <div className="card__actions">
            <Link
              to={`/watch/${title.id}`}
              state={{ from }}
              className="icon-btn icon-btn--play"
              aria-label={`${progress ? 'Resume' : 'Play'} ${title.title}`}
              title={progress ? 'Resume' : 'Play'}
            >
              <PlayIcon size={18} />
            </Link>
            <MyListButton title={title} variant="icon" />
            <ThumbsRating
              compact
              size={18}
              value={myRating}
              label={`Rate ${title.title}`}
              onChange={(v) => rate(title.id, v)}
            />
            <Link
              to={detailsPath}
              state={{ from, backgroundLocation }}
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
          {title.genres?.length > 0 && (
            <p className="card__overlay-genres" aria-hidden="true">
              {title.genres.join(' • ')}
            </p>
          )}
        </div>
      </div>

      <p className="card__meta">
        {progress ? (
          <span>
            {minutesLeft} min left
            <span className="sr-only"> ({pct}% watched)</span>
          </span>
        ) : showCategory ? (
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
      {onRemoveFromRow && (
        <button type="button" className="link-btn card__hide" onClick={() => onRemoveFromRow(title.id)}>
          Remove from row<span className="sr-only">: {title.title}</span>
        </button>
      )}
    </article>
  );
}
