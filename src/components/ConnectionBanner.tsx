import { useEffect, useState } from 'react';
import { useRoom } from '../RoomContext';

/**
 * Floating top-of-screen banner that warns the user when the WebSocket isn't
 * 'open'. Hidden when the room is in the 'lobby'/teacher-creation flow (no
 * code yet) and also suppressed for the very first second of connecting so
 * fresh page loads don't flash a warning.
 */
export default function ConnectionBanner() {
  const room = useRoom();
  const [debouncedShow, setDebouncedShow] = useState(false);

  const shouldShow =
    !!room.code && (room.status === 'closed' || room.status === 'error');

  useEffect(() => {
    if (!shouldShow) {
      setDebouncedShow(false);
      return;
    }
    // Wait 1.5s before showing — short blips during reconnect shouldn't flash
    // the banner for everyone.
    const id = window.setTimeout(() => setDebouncedShow(true), 1500);
    return () => window.clearTimeout(id);
  }, [shouldShow]);

  if (!debouncedShow) return null;

  return (
    <div
      className="fixed top-0 inset-x-0 z-50 pointer-events-none flex justify-center"
      role="alert"
    >
      <div className="pointer-events-auto m-2 max-w-md w-full rounded-xl border border-amber-300/40 bg-amber-500/15 backdrop-blur px-4 py-3 text-amber-100 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl leading-none mt-0.5">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">接続が切れています</p>
            <p className="text-xs text-amber-100/80 mt-0.5">
              自動で再接続を試みています。続かない場合は
              <button
                onClick={() => window.location.reload()}
                className="underline ml-1 font-bold"
              >
                画面を再読み込み
              </button>
              してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
