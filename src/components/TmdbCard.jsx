import SmartImage from './SmartImage.jsx';

/**
 * A title found on TMDB that isn't in the DramaStream catalog. It isn't
 * playable or saveable (no details page yet), so it's a plain card, not a link.
 */
export default function TmdbCard({ hit }) {
  const kind = hit.type === 'tv' ? 'Series' : 'Film';
  return (
    <article className="card card--tmdb">
      <div className="card__frame">
        <div className="card__poster">
          <SmartImage
            src={hit.poster}
            alt=""
            fallbackText={hit.title}
            width="342"
            height="513"
            loading="lazy"
          />
        </div>
        <h3 className="card__title">{hit.title}</h3>
      </div>
      <p className="card__meta">
        <span className="card__category">{kind}</span>
        {hit.year && (
          <>
            <span aria-hidden="true"> · </span>
            <span>{hit.year}</span>
          </>
        )}
        {hit.rating && (
          <>
            <span aria-hidden="true"> · </span>
            <span>
              <span aria-hidden="true">★ </span>
              {hit.rating}
              <span className="sr-only"> out of 10 on TMDB</span>
            </span>
          </>
        )}
      </p>
    </article>
  );
}
