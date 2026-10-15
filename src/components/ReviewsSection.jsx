import { useId, useState } from 'react';
import { useReviews } from '../state/ReviewsContext.jsx';
import { StarDisplay, StarInput } from './StarRating.jsx';
import { TrashIcon } from './Icons.jsx';

const MIN_LENGTH = 10;
const MAX_LENGTH = 600;

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

/** Ratings & reviews for one title: your rating, a review form, and the list. */
export default function ReviewsSection({ title }) {
  const { summary, rate, addReview, removeReview } = useReviews();
  const { average, count, myRating, reviews } = summary(title.id);

  const [name, setName] = useState('');
  const [rating, setRating] = useState(myRating ?? 0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const ids = { name: useId(), text: useId(), err: useId(), count: useId() };

  const submit = (e) => {
    e.preventDefault();
    if (!rating) return setError('Choose a star rating before posting.');
    if (text.trim().length < MIN_LENGTH) return setError(`Write at least ${MIN_LENGTH} characters.`);
    addReview(title.id, { name, rating, text });
    setText('');
    setError('');
  };

  return (
    <section className="reviews" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="section-title">
        Ratings &amp; Reviews
      </h2>

      <div className="reviews__grid">
        <div className="reviews__summary">
          {count ? (
            <>
              <p className="reviews__avg">
                {average.toFixed(1)}
                <span>/5</span>
              </p>
              <StarDisplay value={average} size={20} />
              <p className="reviews__count">
                {count} {count === 1 ? 'rating' : 'ratings'} on this device
              </p>
            </>
          ) : (
            <p className="reviews__empty-summary">No ratings yet. Be the first to rate {title.title}.</p>
          )}

          <div className="reviews__quick">
            <StarInput
              legend="Your rating"
              value={myRating ?? 0}
              onChange={(n) => {
                rate(title.id, n);
                setRating(n);
              }}
            />
            {myRating && (
              <button type="button" className="link-btn" onClick={() => rate(title.id, null)}>
                Clear rating
              </button>
            )}
          </div>
        </div>

        <form className="review-form" onSubmit={submit} noValidate>
          <h3 className="review-form__title">Write a review</h3>
          <StarInput legend="Rating for this review" value={rating} onChange={setRating} size={26} />

          <label htmlFor={ids.name} className="field-label">
            Display name <span className="field-optional">(optional)</span>
          </label>
          <input
            id={ids.name}
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Anonymous viewer"
            autoComplete="off"
          />

          <label htmlFor={ids.text} className="field-label">
            Your review
          </label>
          <textarea
            id={ids.text}
            className="field field--area"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_LENGTH}
            rows={4}
            placeholder={`What did you think of ${title.title}?`}
            aria-describedby={`${ids.count}${error ? ` ${ids.err}` : ''}`}
            aria-invalid={Boolean(error) || undefined}
          />
          <p id={ids.count} className="field-hint">
            {text.length}/{MAX_LENGTH} · Reviews are saved in this browser only.
          </p>
          {error && (
            <p id={ids.err} className="field-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn--primary">
            Post Review
          </button>
        </form>
      </div>

      {reviews.length > 0 ? (
        <ul className="review-list">
          {reviews.map((r) => (
            <li key={r.id} className="review">
              <div className="review__head">
                <span className="review__avatar" aria-hidden="true">
                  {r.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="review__name">{r.name}</p>
                  <p className="review__meta">
                    <StarDisplay value={r.rating} size={14} /> <time dateTime={r.createdAt}>{formatDate(r.createdAt)}</time>
                  </p>
                </div>
                <button
                  type="button"
                  className="review__delete"
                  onClick={() => removeReview(title.id, r.id)}
                  aria-label={`Delete review by ${r.name}`}
                  title="Delete review"
                >
                  <TrashIcon size={18} />
                </button>
              </div>
              <p className="review__text">{r.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="reviews__none">No reviews yet for {title.title}.</p>
      )}
    </section>
  );
}
