import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const StatusContext = createContext(null);

/**
 * One polite live region for the whole app. Screen readers hear each message,
 * and sighted users see it briefly as a toast.
 */
export function StatusProvider({ children }) {
  const [status, setStatus] = useState({ message: '', id: 0 });
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  const announce = useCallback((message) => {
    clearTimeout(timer.current);
    setStatus((prev) => ({ message, id: prev.id + 1 }));
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), 2600);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <StatusContext.Provider value={value}>
      {children}
      <div className={`toast${visible ? ' toast--visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        {status.message && <span key={status.id}>{status.message}</span>}
      </div>
    </StatusContext.Provider>
  );
}

export function useStatus() {
  const ctx = useContext(StatusContext);
  if (!ctx) throw new Error('useStatus must be used inside <StatusProvider>');
  return ctx;
}
