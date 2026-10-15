import { useCallback, useEffect, useRef, useState } from 'react';
import TitleCard from './TitleCard.jsx';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx';

/**
 * A labeled category row. On wide screens all four posters fit; on narrower
 * screens the row scrolls horizontally (touch, trackpad, keyboard focus, or the
 * arrow buttons, which only appear when there is somewhere to scroll).
 */
export default function TitleRow({ id, heading, blurb, titles, eager = false }) {
  const trackRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const [focusedArrow, setFocusedArrow] = useState(null);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [measure]);

  const scrollByPage = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' });
  };

  // An arrow hides once the row reaches that edge — unless it has keyboard
  // focus, in which case it stays (dimmed, aria-disabled) until focus moves on,
  // so keyboard users are never dropped back to <body>.
  const arrowProps = (side) => {
    const atEdge = side === 'left' ? edges.start : edges.end;
    return {
      hidden: atEdge && focusedArrow !== side,
      'aria-disabled': atEdge || undefined,
      onClick: () => !atEdge && scrollByPage(side === 'left' ? -1 : 1),
      onFocus: () => setFocusedArrow(side),
      onBlur: () => setFocusedArrow((f) => (f === side ? null : f)),
    };
  };

  const headingId = `${id}-heading`;
  const scrollable = !(edges.start && edges.end);

  return (
    <section className="row" id={id} aria-labelledby={headingId}>
      <div className="row__header">
        <h2 id={headingId} className="row__title">
          {heading}
        </h2>
        {blurb && <p className="row__blurb">{blurb}</p>}
      </div>

      <div className={`row__viewport${scrollable ? ' row__viewport--scrollable' : ''}`}>
        <button
          type="button"
          className="row__arrow row__arrow--left"
          aria-label={`Scroll ${heading} left`}
          {...arrowProps('left')}
        >
          <ChevronLeftIcon size={28} />
        </button>

        <ul className="row__track" ref={trackRef}>
          {titles.map((title) => (
            <li key={title.id} className="row__item">
              <TitleCard title={title} eager={eager} />
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="row__arrow row__arrow--right"
          aria-label={`Scroll ${heading} right`}
          {...arrowProps('right')}
        >
          <ChevronRightIcon size={28} />
        </button>
      </div>
    </section>
  );
}
