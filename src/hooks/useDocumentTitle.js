import { useEffect } from 'react';

const APP = 'DramaStream';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP}` : APP;
  }, [title]);
}
