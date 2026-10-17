import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProfiles } from '../state/ProfileContext.jsx';
import { TYPES } from '../data/catalog.js';
import SmartImage, { TitleLogo } from './SmartImage.jsx';
import MetaLine from './MetaLine.jsx';
import MyListButton from './MyListButton.jsx';
import TrailerButton from './TrailerButton.jsx';
import { InfoIcon, MuteIcon, PlayIcon, VolumeIcon } from './Icons.jsx';

/**
 * Home billboard. Like Netflix's autoplaying preview, the still slowly pans
 * and zooms (no video or sound exists); profiles can turn previews off, and
 * reduced-motion settings always stop it.
 */
export default function FeaturedTitle({ title }) {
  const location = useLocation();
  const from = location.pathname + location.search;
  const preview = useProfiles().current?.autoplay_previews ?? true;
  const [muted, setMuted] = useState(true);

  return (
    <section className={`billboard${preview ? ' billboard--preview' : ''}`} aria-labelledby="featured-title">
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
          <TrailerButton title={title} />
          <MyListButton title={title} variant="icon" className="icon-btn--lg" />
        </div>
      </div>

      <div className="billboard__side">
        {preview && (
          <button
            type="button"
            className="icon-btn billboard__mute"
            aria-pressed={!muted}
            aria-label={muted ? 'Turn preview sound on (simulated)' : 'Mute preview (simulated)'}
            onClick={() => setMuted((m) => !m)}
          >
            {muted ? <MuteIcon size={20} /> : <VolumeIcon size={20} />}
          </button>
        )}
        <div className="billboard__rating">
          <span className="sr-only">Rated </span>
          {title.contentRating}
        </div>
      </div>
    </section>
  );
}
