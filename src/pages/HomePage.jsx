import { useEffect, useState } from 'react';
import FeaturedTitle from '../components/FeaturedTitle.jsx';
import TitleRow from '../components/TitleRow.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { CATEGORIES, getCatalog, getCatalogSnapshot, getTitleById, isAllowed } from '../data/catalog.js';
import { fetchActivity } from '../data/activity.js';
import { pickBillboard } from '../data/billboard.js';
import { buildHomeRows } from '../data/rows.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useMyList } from '../state/MyListContext.jsx';
import { useProgress } from '../state/ProgressContext.jsx';
import { useProfiles } from '../state/ProfileContext.jsx';

export default function HomePage() {
  useDocumentTitle('Home');
  const { current } = useProfiles();
  const { savedIds } = useMyList();
  const { continueWatching, hideFromRow } = useProgress();
  const [activity, setActivity] = useState(() => new Map());

  useEffect(() => {
    let active = true;
    fetchActivity().then((scores) => active && setActivity(scores));
    return () => {
      active = false;
    };
  }, []);

  const catalog = getCatalog(); // already limited to this profile's maturity level
  const featuredId = getCatalogSnapshot().featuredId;
  const billboard = pickBillboard(catalog, featuredId);
  const watching = continueWatching.filter((c) => isAllowed(c.title));
  const progressById = new Map(watching.map((c) => [c.title.id, c.progress]));

  const rows = buildHomeRows({
    catalog,
    featuredId,
    continueWatching: watching,
    myList: savedIds.map(getTitleById).filter((t) => t && isAllowed(t)),
    activity,
    categories: CATEGORIES,
    continueHeading: current ? `Continue Watching for ${current.name}` : 'Continue Watching',
  });

  if (!billboard) {
    return (
      <div className="page">
        <EmptyState heading="Nothing to watch on this profile yet">
          <p>No titles match this profile’s maturity setting. Choose a higher level in Manage Profiles.</p>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="home">
      <FeaturedTitle title={billboard} />
      <div className="home__rows">
        {rows.map((row, i) => (
          <TitleRow
            key={row.id}
            id={row.id}
            heading={row.heading}
            blurb={row.blurb}
            titles={row.titles}
            eager={i === 0}
            ranked={row.kind === 'ranked'}
            cardProps={
              row.kind === 'progress'
                ? (t) => ({ progress: progressById.get(t.id), onRemoveFromRow: hideFromRow })
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
