import { useEffect, useState } from 'react';

interface Props {
  phase: string;
  fallback: React.ReactNode;
}

/**
 * Show /slides/<phase>.png if it exists; otherwise render the fallback node.
 * Detection is done via a HEAD request because the dev server returns 200/html
 * for missing files when SPA fallback is enabled.
 */
export default function SlideImage({ phase, fallback }: Props) {
  const [status, setStatus] = useState<'checking' | 'have' | 'none'>('checking');

  useEffect(() => {
    let cancelled = false;
    setStatus('checking');
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
          className="max-h-[78vh] w-auto max-w-full rounded-2xl shadow-neon border border-white/10"
        />
      </div>
    );
  }
  return <>{fallback}</>;
}
