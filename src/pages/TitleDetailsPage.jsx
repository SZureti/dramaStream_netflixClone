import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import SmartImage, { TitleLogo } from '../components/SmartImage.jsx';
import MetaLine from '../components/MetaLine.jsx';
import MyListButton from '../components/MyListButton.jsx';
import TitleCard from '../components/TitleCard.jsx';
import ShareButton from '../components/ShareButton.jsx';
import ReviewsSection from '../components/ReviewsSection.jsx';
import { StarDisplay } from '../components/StarRating.jsx';
import { useReviews } from '../state/ReviewsContext.jsx';
import { ArrowLeftIcon, PlayIcon } from '../components/Icons.jsx';
import {
  formatEpisodes,
  formatRuntime,
  formatSeasons,
  getPlayable,
  getTitleById,
  getTitlesByType,
} from '../data/catalog.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import NotFoundPage from './NotFoundPage.jsx';

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
  return <TitleDetails key={title.id} title={title} />;
}

function TitleDetails({ title }) {
  useDocumentTitle(title.title);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const hasHistory = location.key !== 'default';
  const playable = getPlayable(title);
  const rated = useReviews().summary(title.id);
  const related = getTitlesByType(title.type).filter((t) => t.id !== title.id).slice(0, 6);

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
              {rated.count > 0 && (
                <p className="details-hero__rating">
                  <StarDisplay value={rated.average} size={18} />
                  <span>
                    {rated.average.toFixed(1)} · {rated.count} {rated.count === 1 ? 'rating' : 'ratings'}
                  </span>
                </p>
              )}
              <p className="details-hero__synopsis">{title.synopsis}</p>

              <div className="details-hero__actions">
                <Link
                  to={`/watch/${title.id}`}
                  state={{ from: location.pathname }}
                  className="btn btn--primary btn--lg"
                >
                  <PlayIcon size={26} />
                  <span>
                    Play
                    {playable.label && <span className="btn__sub"> {playable.label}</span>}
                  </span>
                </Link>
                <MyListButton title={title} className="btn--lg" />
                <ShareButton title={title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="details-body">
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
