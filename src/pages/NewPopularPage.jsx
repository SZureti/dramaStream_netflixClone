import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TitleRow from '../components/TitleRow.jsx';
import SmartImage, { TitleLogo } from '../components/SmartImage.jsx';
import MetaLine from '../components/MetaLine.jsx';
import { BellIcon, CheckIcon, InfoIcon } from '../components/Icons.jsx';
import { getCatalog, getComingSoon, getCatalogSnapshot } from '../data/catalog.js';
import { fetchActivity } from '../data/activity.js';
import { buildHomeRows } from '../data/rows.js';
import { useReminders } from '../state/RemindersContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const arrival = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

/** New & Popular: Coming Soon with Remind Me, what's new on DramaStream, and the Top 10. */
export default function NewPopularPage() {
  useDocumentTitle('New & Popular');
  const { isReminded, toggleReminder } = useReminders();
  const [activity, setActivity] = useState(() => new Map());
  useEffect(() => {
    let active = true;
    fetchActivity().then((a) => active && setActivity(a));
    return () => {
      active = false;
    };
  }, []);

  const coming = getComingSoon();
  const catalog = getCatalog();
  const newest = [...catalog]
    .filter((t) => t.addedAt || t.availableFrom)
    .sort((a, b) => ((b.availableFrom ?? b.addedAt) > (a.availableFrom ?? a.addedAt) ? 1 : -1))
    .slice(0, 10);
  const top10 = buildHomeRows({
    catalog,
    featuredId: getCatalogSnapshot().featuredId,
    continueWatching: [],
    myList: [],
    activity,
    categories: [],
    continueHeading: '',
  }).find((r) => r.id === 'top-10');

  return (
    <div className="page new-popular">
      <h1 className="page__title">New &amp; Popular</h1>
      <p className="page__lede">What’s arriving on DramaStream, what just landed, and what everyone’s watching.</p>

      <section className="coming-soon" aria-labelledby="coming-soon-heading">
        <h2 id="coming-soon-heading" className="section-title">
          Coming Soon
        </h2>
        {coming.length === 0 ? (
          <p className="page__lede">Nothing scheduled right now. Check back soon.</p>
        ) : (
          <ul className="coming-soon__list">
            {coming.map((t) => {
              const reminded = isReminded(t.id);
              return (
                <li key={t.id} className="coming-soon__item">
                  <p className="coming-soon__date">
                    <time dateTime={t.availableFrom}>{arrival(t.availableFrom)}</time>
                  </p>
                  <div className="coming-soon__card">
                    <div className="coming-soon__art">
                      <SmartImage
                        src={t.heroSrc}
                        srcSet={t.heroSrcSet}
                        sizes="(max-width: 900px) 100vw, 860px"
                        alt=""
                        fallbackText={t.title}
                        loading="lazy"
                        style={{ objectPosition: t.heroPosition }}
                      />
                    </div>
                    <div className="coming-soon__body">
                      <div className="coming-soon__head">
                        <TitleLogo title={t} as="h3" size="sm" className="coming-soon__logo" />
                        <div className="coming-soon__actions">
                          <button
                            type="button"
                            className={`coming-soon__remind${reminded ? ' coming-soon__remind--on' : ''}`}
                            aria-pressed={reminded}
                            onClick={() => toggleReminder(t.id)}
                          >
                            {reminded ? <CheckIcon size={22} /> : <BellIcon size={22} />}
                            <span>Remind Me</span>
                            <span className="sr-only">: {t.title}</span>
                          </button>
                          <Link to={`/titles/${t.id}`} className="coming-soon__info">
                            <InfoIcon size={22} />
                            <span>Info</span>
                            <span className="sr-only">: {t.title}</span>
                          </Link>
                        </div>
                      </div>
                      <p className="coming-soon__when">Coming to DramaStream {arrival(t.availableFrom)}</p>
                      <MetaLine title={t} showType />
                      <p className="coming-soon__synopsis">{t.synopsis}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="coming-soon__note">Arrival dates are DramaStream’s own schedule for this demo catalog.</p>
      </section>

      {newest.length > 0 && <TitleRow id="new-on-dramastream" heading="New on DramaStream" titles={newest} />}
      {top10 && <TitleRow id="new-top-10" heading={top10.heading} titles={top10.titles} ranked />}
    </div>
  );
}
