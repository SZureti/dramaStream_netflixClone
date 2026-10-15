import { BellIcon, CheckIcon } from './Icons.jsx';
import { useReminders } from '../state/RemindersContext.jsx';

const arrival = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

/** Stands in for Play on a Coming Soon title: "Remind Me", with the arrival date. */
export default function RemindButton({ title, className = '' }) {
  const { isReminded, toggleReminder } = useReminders();
  const on = isReminded(title.id);
  return (
    <button
      type="button"
      className={`btn ${on ? 'btn--saved' : 'btn--primary'} ${className}`}
      aria-pressed={on}
      onClick={() => toggleReminder(title.id)}
    >
      {on ? <CheckIcon size={24} /> : <BellIcon size={24} />}
      <span>
        Remind Me<span className="btn__sub"> · Coming {arrival(title.availableFrom)}</span>
      </span>
    </button>
  );
}
