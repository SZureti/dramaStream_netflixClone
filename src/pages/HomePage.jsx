import FeaturedTitle from '../components/FeaturedTitle.jsx';
import TitleRow from '../components/TitleRow.jsx';
import { CATEGORIES, getFeaturedTitle, getTitlesByType } from '../data/catalog.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function HomePage() {
  useDocumentTitle('Home');
  const featured = getFeaturedTitle();

  return (
    <div className="home">
      <FeaturedTitle title={featured} />
      <div className="home__rows">
        {CATEGORIES.map((category, i) => (
          <TitleRow
            key={category.type}
            id={category.anchor}
            heading={category.title}
            blurb={category.blurb}
            titles={getTitlesByType(category.type)}
            eager={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
