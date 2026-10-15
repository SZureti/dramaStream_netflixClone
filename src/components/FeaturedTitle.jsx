import { Link, useLocation } from 'react-router-dom';
import { TYPES } from '../data/catalog.js';
import SmartImage, { TitleLogo } from './SmartImage.jsx';
import MetaLine from './MetaLine.jsx';
import MyListButton from './MyListButton.jsx';
import { InfoIcon, PlayIcon } from './Icons.jsx';

/** Home billboard. Static artwork only — no autoplaying media. */
export default function FeaturedTitle({ title }) {
  const location = useLocation();
  const from = location.pathname + location.search;

  return (
    <section className="billboard" aria-labelledby="featured-title">
      <div className="billboard__art" aria-hidden="true">
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
      <div className="billboard__shade" aria-hidden="true" />

      <div className="billboard__content">
        <p className="billboard__eyebrow">
          <span className="brand-mark" aria-hidden="true">
            D
          </span>
          Featured {TYPES[title.type].label}
        </p>
        <TitleLogo title={title} className="billboard__logo" />
        <span id="featured-title" className="sr-only">
          Featured: {title.title}
        </span>
        <MetaLine title={title} showType={false} className="billboard__meta" />
        <p className="billboard__synopsis">{title.synopsis}</p>
        <div className="billboard__actions">
          <Link to={`/watch/${title.id}`} state={{ from }} className="btn btn--primary">
            <PlayIcon size={24} />
            <span>Play</span>
          </Link>
          <Link
            to={`/titles/${title.id}`}
            state={{ from, backgroundLocation: location }}
            className="btn btn--secondary"
          >
            <InfoIcon size={24} />
            <span>More Info</span>
          </Link>
          <MyListButton title={title} variant="icon" className="icon-btn--lg" />
        </div>
      </div>

      <div className="billboard__rating" aria-hidden="true">
        {title.contentRating}
      </div>
    </section>
  );
}
