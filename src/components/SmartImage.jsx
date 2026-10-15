import { useCallback, useState } from 'react';

/**
 * <img> with a graceful fallback: if the artwork fails to load, a neutral
 * placeholder shows the title text instead, so the card or page stays usable.
 * Loaded images fade in rather than popping into place.
 */
export default function SmartImage({ src, alt, fallbackText, className = '', ...imgProps }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const [loadedSrc, setLoadedSrc] = useState(null);

  // Cached images can finish before React attaches onLoad — check on mount too.
  const ref = useCallback(
    (img) => {
      if (img?.complete && img.naturalWidth > 0) setLoadedSrc(img.getAttribute('src'));
    },
    [],
  );

  if (!src || failedSrc === src) {
    return (
      <div
        className={`img-fallback ${className}`}
        {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
      >
        <span>{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={`img-fade${loadedSrc === src ? ' is-loaded' : ''} ${className}`}
      decoding="async"
      onLoad={() => setLoadedSrc(src)}
      onError={() => setFailedSrc(src)}
      {...imgProps}
    />
  );
}

/** Title treatment: the official logo art, or the title in display type if it fails. */
export function TitleLogo({ title, as: Tag = 'h1', className = '', size = 'lg' }) {
  const [failed, setFailed] = useState(false);
  return (
    <Tag className={`title-logo title-logo--${size} ${className}`}>
      {failed ? (
        <span className="title-logo__text">{title.title}</span>
      ) : (
        <img
          className="title-logo__img"
          src={title.logoSrc}
          alt={title.title}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </Tag>
  );
}
