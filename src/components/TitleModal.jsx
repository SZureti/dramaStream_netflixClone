import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SmartImage, { TitleLogo } from './SmartImage.jsx';
import MetaLine from './MetaLine.jsx';
import MyListButton from './MyListButton.jsx';
import ThumbsRating from './ThumbsRating.jsx';
import TitleCard from './TitleCard.jsx';
import EpisodeList from './EpisodeList.jsx';
import RemindButton from './RemindButton.jsx';
import { CloseIcon, PlayIcon } from './Icons.jsx';
import { getCatalog, getPlayable, getTitleById, isAvailable } from '../data/catalog.js';
import { matchPercent } from '../data/match.js';
import { moodsFor } from '../data/moods.js';
import { similarTitles } from '../data/rows.js';
import { useReviews } from '../state/ReviewsContext.jsx';
import { isResumable, useProgress } from '../state/ProgressContext.jsx';

/**
 * Netflix-style details over the page the viewer came from. A native <dialog>
 * keeps keyboard focus inside and closes on Escape; closing goes Back, so the
 * URL (shareable) and history stay in step.
 */
export default function TitleModal({ title }) {
  const dialogRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { summary, rate, ratings } = useReviews();
  const match = matchPercent(title, ratings, getTitleById);
  const myRating = summary(title.id).myRating;
  const saved = useProgress().getProgress(title.id);
  const resumable = isResumable(saved);
  const playable = getPlayable(title);
  const similar = similarTitles(title, getCatalog(), 6);
  const moods = moodsFor(title);
  const castPreview = title.cast?.slice(0, 3) ?? [];

  useEffect(() => {
    const opener = document.activeElement;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    document.documentElement.classList.add('modal-open');
    return () => {
      document.documentElement.classList.remove('modal-open');
      // Back on the page: return focus to the card or button that opened the modal.
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  // A new title in the same modal (More Like This) starts at the top.
  useEffect(() => {
    dialogRef.current?.scrollTo?.(0, 0);
    dialogRef.current?.querySelector('.title-modal__close')?.focus();
  }, [title.id]);

  const close = () => navigate(-1);
  const watchState = { from: location.pathname };

  return (
    <dialog
      ref={dialogRef}
      className="title-modal"
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) close(); // click on the backdrop
      }}
    >
      <div className="title-modal__panel">
        <button type="button" className="title-modal__close icon-btn" onClick={close} aria-label="Close details">
          <CloseIcon size={22} />
        </button>

        <div className="title-modal__hero">
          <SmartImage
            src={title.heroSrc}
            srcSet={title.heroSrcSet}
            sizes="(max-width: 880px) 100vw, 850px"
            alt=""
            fallbackText=""
            style={{ objectPosition: title.heroPosition }}
          />
          <div className="title-modal__shade" aria-hidden="true" />
          <div className="title-modal__hero-content">
            <TitleLogo title={title} className="title-modal__logo" />
            <h2 id="modal-title" className="sr-only">
              {title.title}
            </h2>
            <div className="title-modal__actions">
              {isAvailable(title) ? (
                <Link to={`/watch/${title.id}`} state={watchState} className="btn btn--primary">
                  <PlayIcon size={24} />
                  <span>
                    {resumable ? 'Resume' : 'Play'}
                    {playable.label && <span className="btn__sub"> {playable.label}</span>}
                  </span>
                </Link>
              ) : (
                <RemindButton title={title} />
              )}
              <MyListButton title={title} variant="icon" className="icon-btn--lg" />
              <ThumbsRating
                compact
                value={myRating}
                label={`Rate ${title.title}`}
                onChange={(v) => rate(title.id, v)}
              />
            </div>
          </div>
        </div>

        <div className="title-modal__body">
          <div className="title-modal__columns">
            <div>
              {match && <p className="match title-modal__match">{match}% Match</p>}
              <MetaLine title={title} showType showEpisodes className="title-modal__meta" />
              <p className="title-modal__synopsis">{title.synopsis}</p>
            </div>
            <dl className="title-modal__tags">
              {castPreview.length > 0 && (
                <div>
                  <dt>{title.castLabel ?? 'Cast'}:</dt>
                  <dd>
                    {castPreview.join(', ')}
                    {title.cast.length > 3 && ', more'}
                  </dd>
                </div>
              )}
              <div>
                <dt>Genres:</dt>
                <dd>{title.genres.join(', ')}</dd>
              </div>
              <div>
                <dt>This {title.type === 'series' ? 'show' : title.type === 'film' ? 'film' : 'documentary'} is:</dt>
                <dd>{moods.join(', ')}</dd>
              </div>
            </dl>
          </div>

          {title.type === 'series' && isAvailable(title) && <EpisodeList title={title} headingLevel={3} />}

          {similar.length > 0 && (
            <section className="title-modal__section" aria-labelledby="more-like-this">
              <h3 id="more-like-this" className="section-title">
                More Like This
              </h3>
              <ul className="card-grid card-grid--three">
                {similar.map((t) => (
                  <li key={t.id}>
                    <TitleCard title={t} headingLevel={4} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="title-modal__section" aria-labelledby="about-modal">
            <h3 id="about-modal" className="section-title">
              About {title.title}
            </h3>
            <dl className="title-modal__about">
              {(title.credits ?? []).map((c) => (
                <div key={c.role}>
                  <dt>{c.role}:</dt>
                  <dd>{c.names.join(', ')}</dd>
                </div>
              ))}
              {title.cast?.length > 0 && (
                <div>
                  <dt>{title.castLabel ?? 'Cast'}:</dt>
                  <dd>{title.cast.join(', ')}</dd>
                </div>
              )}
              <div>
                <dt>Genres:</dt>
                <dd>{title.genres.join(', ')}</dd>
              </div>
              <div>
                <dt>Maturity rating:</dt>
                <dd>
                  <span className="rating-badge">{title.contentRating}</span>
                </dd>
              </div>
            </dl>
            <p className="title-modal__more">
              <Link to={`/titles/${title.id}#reviews-heading`} replace>
                Ratings, reviews and sharing
              </Link>
            </p>
          </section>
        </div>
      </div>
    </dialog>
  );
}
