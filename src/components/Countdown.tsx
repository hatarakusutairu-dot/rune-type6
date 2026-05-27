import { useEffect, useState } from 'react';

interface Props {
  seconds: number;
  className?: string;
  /** Called once when reaching 0. */
  onDone?: () => void;
}

export function useCountdown(seconds: number, onDone?: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    setRemaining(seconds);
    const start = Date.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, seconds - Math.floor((Date.now() - start) / 1000));
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(id);
        onDone?.();
      }
    }, 250);
    return () => window.clearInterval(id);
    // onDone intentionally not tracked: stable reference assumed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);
  return remaining;
}

export default function Countdown({ seconds, className, onDone }: Props) {
  const remaining = useCountdown(seconds, onDone);
  const danger = remaining <= 10;
  return (
    <span
      className={`tabular-nums font-black ${danger ? 'text-rose-300' : 'text-white'} ${className ?? ''}`}
    >
      {remaining}s
    </span>
  );
}
