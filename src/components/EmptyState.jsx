/** Shared empty / no-results / not-found message block. */
export default function EmptyState({ icon, heading, headingLevel = 2, children, actions, className = '' }) {
  const Heading = `h${headingLevel}`;
  return (
    <div className={`empty-state ${className}`}>
      {icon && (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <Heading className="empty-state__heading">{heading}</Heading>
      {children && <div className="empty-state__body">{children}</div>}
      {actions && <div className="empty-state__actions">{actions}</div>}
    </div>
  );
}
