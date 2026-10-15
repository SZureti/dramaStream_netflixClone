import FaqList from '../components/FaqList.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function HelpPage() {
  useDocumentTitle('Help');
  return (
    <div className="page help-page">
      <h1 className="page__title">Help</h1>
      <p className="page__lede">Answers to the questions people ask most.</p>
      <FaqList />
    </div>
  );
}
