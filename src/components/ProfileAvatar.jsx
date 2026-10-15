/** Netflix-style square avatar: a colored tile with a simple face. Decorative. */
export default function ProfileAvatar({ color = 'red', size = 32, kids = false, className = '' }) {
  return (
    <span
      className={`profile-avatar profile-avatar--${color} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" width="100%" height="100%" focusable="false">
        <circle cx="13.5" cy="15" r="2.6" fill="currentColor" />
        <circle cx="26.5" cy="15" r="2.6" fill="currentColor" />
        <path
          d="M11 24.5c2.4 3.2 5.4 4.8 9 4.8s6.6-1.6 9-4.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
      {kids && <span className="profile-avatar__kids">KIDS</span>}
    </span>
  );
}
