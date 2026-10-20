import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import SmartImage, { TitleLogo } from '../components/SmartImage.jsx';
import MetaLine from '../components/MetaLine.jsx';
import MyListButton from '../components/MyListButton.jsx';
import TitleCard from '../components/TitleCard.jsx';
import ShareButton from '../components/ShareButton.jsx';
import ReviewsSection from '../components/ReviewsSection.jsx';
import ThumbsRating from '../components/ThumbsRating.jsx';
import EpisodeList from '../components/EpisodeList.jsx';
import RemindButton from '../components/RemindButton.jsx';
import TrailerButton from '../components/TrailerButton.jsx';
import CatalogCast from '../components/CatalogCast.jsx';
import { RATINGS, useReviews } from '../state/ReviewsContext.jsx';
import { isResumable, useProgress } from '../state/ProgressContext.jsx';
import { ArrowLeftIcon, PlayIcon } from '../components/Icons.jsx';
import {
  formatEpisodes,
  formatRuntime,
  formatSeasons,
  getPlayable,
  getTitleById,
  getTitlesByType,
  isAllowed,
  isAvailable,
} from '../data/catalog.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import NotFoundPage from './NotFoundPage.jsx';
import NotAvailableOnProfile from '../components/NotAvailableOnProfile.jsx';

/** Name the back button after where the viewer came from. */
function backLabelFor(from) {
  if (!from) return 'Home';
  if (from === '/') return 'Back to Home';
  if (from.startsWith('/search')) return 'Back to Search';
  if (from.startsWith('/my-list')) return 'Back to My List';
  return 'Back';
}

export default function TitleDetailsPage() {
  const { titleId } = useParams();
  const title = getTitleById(titleId);
  if (!title) return <NotFoundPage missingTitleId={titleId} />;
  // Search and Browse already hide titles above the profile's maturity level; a direct link must too.
  if (!isAllowed(title)) {
    return (
      <NotAvailableOnProfile>
        <p>
          {title.title} is rated {title.contentRating}, above this profile’s maturity setting.
        </p>
      </NotAvailableOnProfile>
    );
  }
  return <TitleDetails key={title.id} title={title} />;
}

function TitleDetails({ title }) {
  useDocumentTitle(title.title);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const hasHistory = location.key !== 'default';
  const playable = getPlayable(title);
  const reviewsApi = useReviews();
  const rated = reviewsApi.summary(title.id);
  const saved = useProgress().getProgress(title.id);
  const resumable = isResumable(saved);
  const minutesLeft = resumable ? Math.max(1, Math.round((saved.duration - saved.position) / 60)) : 0;
  const watchedPct = resumable ? Math.round((saved.position / saved.duration) * 100) : 0;
  const related = getTitlesByType(title.type)
    .filter((t) => t.id !== title.id)
    .slice(0, 6);

  const goBack = () => (hasHistory && from ? navigate(-1) : navigate('/'));

  const facts = [
    { term: 'Category', detail: title.category },
    { term: 'Genres', detail: title.genres?.join(', ') },
    { term: 'Released', detail: title.releaseYear },
    { term: 'Rating', detail: title.contentRating },
    title.type === 'series'
      ? { term: 'Seasons', detail: [formatSeasons(title), formatEpisodes(title)].filter(Boolean).join(' · ') }
      : { term: 'Runtime', detail: formatRuntime(title.runtimeMinutes) },
    ...(title.credits ?? []).map((c) => ({ term: c.role, detail: c.names.join(', ') })),
    title.cast?.length ? { term: title.castLabel ?? 'Cast', detail: title.cast.join(', ') } : null,
  ].filter((f) => f && f.detail !== undefined && f.detail !== null && f.detail !== '');

  return (
    <div className="details">
      <section className="details-hero" aria-labelledby="details-title">
        <div className="details-hero__art" aria-hidden="true">
          <SmartImage
            src={title.heroSrc}
            srcSet={title.heroSrcSet}
            sizes="100vw"
            alt=""
            fallbackText=""
            fetchPriority="high"
            style={{ objectPosition: title.heroPosition }}
          />
        </div>
        <div className="details-hero__shade" aria-hidden="true" />

        <div className="details-hero__inner">
          <button type="button" className="back-btn" onClick={goBack}>
            <ArrowLeftIcon size={22} />
            <span>{backLabelFor(hasHistory ? from : null)}</span>
          </button>

          <div className="details-hero__grid">
            <div className="details-hero__poster">
              <SmartImage
                src={title.posterSrc}
                srcSet={title.posterSrcSet}
                sizes="(max-width: 700px) 60vw, 320px"
                alt={`Poster for ${title.title}`}
                fallbackText={title.title}
                width="780"
                height="1170"
              />
            </div>

            <div className="details-hero__info">
              <p className="details-hero__eyebrow">{title.category}</p>
              <TitleLogo title={title} className="details-hero__logo" />
              <span id="details-title" className="sr-only">
                {title.title}
              </span>
              <MetaLine title={title} showType showEpisodes className="details-hero__meta" />
              {title.genres?.length > 0 && (
                <p className="details-hero__genres">
                  {title.genres.map((g, i) => (
                    <span key={g}>
                      {i > 0 && <span aria-hidden="true"> • </span>}
                      {g}
                    </span>
                  ))}
                </p>
              )}
              {rated.myRating && (
                <p className="details-hero__rating">{RATINGS.find((r) => r.value === rated.myRating).mine}</p>
              )}
              <p className="details-hero__synopsis">{title.synopsis}</p>
              {resumable && (
                <p className="details-hero__progress">
                  <span className="details-hero__progress-track" aria-hidden="true">
                    <span
                      className="details-hero__progress-fill"
                      style={{ width: `${watchedPct}%`, display: 'block' }}
                    />
                  </span>
                  <span>
                    {minutesLeft} min left<span className="sr-only"> ({watchedPct}% watched)</span>
                  </span>
                </p>
              )}

              <div className="details-hero__actions">
                {isAvailable(title) ? (
                  <Link
                    to={`/watch/${title.id}`}
                    state={{ from: location.pathname }}
                    className="btn btn--primary btn--lg"
                  >
                    <PlayIcon size={26} />
                    <span>
                      {resumable ? 'Resume' : 'Play'}
                      {playable.label && <span className="btn__sub"> {playable.label}</span>}
                    </span>
                  </Link>
                ) : (
                  <RemindButton title={title} className="btn--lg" />
                )}
                {resumable && (
                  <Link
                    to={`/watch/${title.id}?t=0`}
                    state={{ from: location.pathname }}
                    className="btn btn--secondary btn--lg"
                  >
                    Start Over
                  </Link>
                )}
                <TrailerButton title={title} className="btn--lg" />
                <MyListButton title={title} className="btn--lg" />
                <ThumbsRating
                  compact
                  value={rated.myRating}
                  label={`Rate ${title.title}`}
                  onChange={(v) => reviewsApi.rate(title.id, v)}
                />
                <ShareButton title={title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="details-body">
        {title.type === 'series' && isAvailable(title) && <EpisodeList title={title} />}

        <section className="details-facts" aria-labelledby="about-heading">
          <h2 id="about-heading" className="section-title">
            About {title.title}
          </h2>
          <dl className="fact-list">
            {facts.map((f) => (
              <div key={f.term} className="fact-list__row">
                <dt>{f.term}</dt>
                <dd>{f.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <CatalogCast title={title} />

        <ReviewsSection title={title} />

        <section className="details-related" aria-labelledby="related-heading">
          <h2 id="related-heading" className="section-title">
            More {title.category}
          </h2>
          <ul className="card-grid card-grid--three">
            {related.map((t) => (
              <li key={t.id}>
                <TitleCard title={t} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
