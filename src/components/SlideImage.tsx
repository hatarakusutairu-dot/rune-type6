import { useEffect, useRef, useState } from 'react';

interface Props {
  phase: string;
  fallback: React.ReactNode;
}

/**
 * Show /slides/<phase>.png if it exists; otherwise render the fallback node.
 * Detection is done by attempting an Image() load — the same URL hits the
 * cache when the real <img> below mounts, so there's no double download.
 */
export default function SlideImage({ phase, fallback }: Props) {
  const [status, setStatus] = useState<'checking' | 'have' | 'none'>('checking');
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('checking');
    startedAtRef.current = Date.now();
    const src = `/slides/${phase}.png`;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setStatus('have');
    };
    img.onerror = () => {
      if (!cancelled) setStatus('none');
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [phase]);

  if (status === 'checking') {
    return fallback ? <div className="opacity-0">{fallback}</div> : null;
  }
  if (status === 'have') {
    return (
      <div className="flex items-center justify-center">
        <img
          src={`/slides/${phase}.png`}
          alt={phase}
          decoding="async"
          className="max-h-[78vh] w-auto max-w-full rounded-2xl shadow-neon border border-white/10 animate-[fadein_300ms_ease-out]"
          // @ts-expect-error fetchpriority is valid HTML but not yet typed
          fetchpriority="high"
        />
      </div>
    );
  }
  return <>{fallback}</>;
}
