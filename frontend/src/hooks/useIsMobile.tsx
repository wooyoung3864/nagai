// src/hooks/useIsMobile.ts
import { useEffect, useState } from 'react';

export default function useIsMobile(maxWidth = 910) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= maxWidth);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= maxWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [maxWidth]);

  return isMobile;
}
