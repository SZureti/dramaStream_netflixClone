import { useEffect, useId, useRef, useState } from 'react';
import { CloseIcon, FilmIcon } from './Icons.jsx';

/** youtube-nocookie.com is YouTube's privacy-enhanced embed (no cookies until play). */
export function trailerEmbedUrl(key) {
  const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1' });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(key)}?${params}`;
}

/**
 * "Trailer" button that plays the title's official YouTube trailer in a
 * native <dialog>. Renders nothing for titles without one. The iframe only
 * exists while the dialog is open, so closing it (button, Escape, backdrop)
 * stops playback; focus then goes back to the button.
 */
export default function TrailerButton({ title, className = '' }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);
  const headingId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  if (!title.trailer) return null;

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`btn btn--secondary ${className}`}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <FilmIcon size={22} />
        <span>Trailer</span>
      </button>
      {open && (
        <dialog
          ref={dialogRef}
          className="trailer-dialog"
          aria-labelledby={headingId}
          // This dialog can sit inside the title modal: keep its events from
          // reaching the modal's own Escape and backdrop handlers.
          onCancel={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === dialogRef.current) close(); // click on the backdrop
          }}
          onClose={() => {
            setOpen(false);
            buttonRef.current?.focus({ preventScroll: true });
          }}
        >
          <div className="trailer-dialog__bar">
            <h2 id={headingId} className="trailer-dialog__title">
              {title.title} <span className="trailer-dialog__sub">Official Trailer</span>
            </h2>
            <button type="button" className="icon-btn trailer-dialog__close" onClick={close} aria-label="Close trailer">
              <CloseIcon size={22} />
            </button>
          </div>
          <div className="trailer-dialog__frame">
            <iframe
              src={trailerEmbedUrl(title.trailer)}
              title={`${title.title} official trailer (YouTube)`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </dialog>
      )}
    </>
  );
}
