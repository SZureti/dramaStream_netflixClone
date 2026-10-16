import { useEffect, useId, useRef, useState } from 'react';
import { useStatus } from '../state/StatusContext.jsx';
import { LinkIcon, MailIcon, ShareIcon } from './Icons.jsx';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers/contexts without the async clipboard API.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/**
 * Share a title. On phones (and browsers with the Web Share API) this opens the
 * system share sheet; elsewhere it opens a small menu: copy link, X, Facebook,
 * WhatsApp, or email. Nothing is posted automatically — the viewer chooses.
 */
export default function ShareButton({ title, className = '' }) {
  const [open, setOpen] = useState(false);
  const { announce } = useStatus();
  const menuId = useId();
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  const url = `${window.location.origin}/titles/${title.id}`;
  const text = `Watch “${title.title}” (${title.releaseYear}) on DramaStream`;
  const enc = encodeURIComponent;

  const targets = [
    { label: 'X (Twitter)', href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: 'WhatsApp', href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
  ];

  // Close on outside click or Escape (returning focus to the button).
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !wrapRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onShare = async () => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (navigator.share && coarse) {
      try {
        await navigator.share({ title: title.title, text, url });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return; // viewer closed the sheet
      }
    }
    setOpen((o) => !o);
  };

  const onCopy = async () => {
    const ok = await copyText(url);
    announce(ok ? 'Link copied to clipboard' : 'Couldn’t copy the link');
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div className={`share ${className}`} ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn--secondary btn--lg"
        onClick={onShare}
        aria-expanded={open}
        aria-controls={menuId}
      >
        <ShareIcon size={22} />
        <span>Share</span>
      </button>

      <div id={menuId} className="share__menu" hidden={!open}>
        <p className="share__heading">Share “{title.title}”</p>
        <ul className="share__list">
          <li>
            <button type="button" className="share__item" onClick={onCopy}>
              <LinkIcon size={18} />
              Copy link
            </button>
          </li>
          {targets.map((t) => (
            <li key={t.label}>
              <a
                className="share__item"
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
              >
                <ShareIcon size={18} />
                {t.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
          <li>
            <a
              className="share__item"
              href={`mailto:?subject=${enc(title.title)}&body=${enc(`${text}\n${url}`)}`}
              onClick={() => setOpen(false)}
            >
              <MailIcon size={18} />
              Email
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
