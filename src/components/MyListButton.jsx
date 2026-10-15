import { useMyList } from '../state/MyListContext.jsx';
import { CheckIcon, PlusIcon } from './Icons.jsx';

/**
 * Add/Remove toggle. `variant="full"` shows the text label; `variant="icon"` is a
 * round icon button whose accessible name still says exactly what will happen.
 */
export default function MyListButton({ title, variant = 'full', className = '' }) {
  const { isSaved, toggle } = useMyList();
  const saved = isSaved(title.id);
  const label = saved ? 'Remove from My List' : 'Add to My List';

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={`icon-btn${saved ? ' icon-btn--active' : ''} ${className}`}
        onClick={() => toggle(title.id)}
        aria-label={`${label}: ${title.title}`}
        title={label}
      >
        {saved ? <CheckIcon size={20} /> : <PlusIcon size={20} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`btn btn--secondary${saved ? ' btn--saved' : ''} ${className}`}
      onClick={() => toggle(title.id)}
    >
      {saved ? <CheckIcon size={22} /> : <PlusIcon size={22} />}
      <span>{label}</span>
    </button>
  );
}
