import { useEffect } from 'react';
import { useRoom } from '../RoomContext';

// Order phases by *appearance time in the lesson*, so the next one due is
// fetched before the current one ends. Slides we know are present on disk
// only — listed in PROGRESS.md / public/slides/README.md.
const SLIDE_PHASES = [
  'stage0_title',
  'stage0_rules',
  'stage0_theme',
  'stage0_flow',
  'stage0_work1title',
  'stage0_work1',
  'stage0_1type4',
  'stage1_explain_1',
  'stage1_explain_2',
  'stage1_explain_3',
  'stage1_explain_4',
  'stage1_explain_5',
  'stage1_bridge',
  'stage2_work2title',
  'stage2_work2',
  'stage2_2type4',
  'stage2_explain_1',
  'stage2_explain_2',
  'stage2_explain_3',
  'stage2_explain_4',
  'stage2_explain_5',
  'stage3_type',
  'stage3_share',
  'stage3_comment',
  'stage3_closing',
];

/**
 * Mounted once at the app root. As soon as the student joins a room (or the
 * teacher creates one), kicks off a background sequence of Image() loads
 * for every known slide. The big ones (~2.5MB each) are then sitting in the
 * browser cache by the time the phase actually arrives, so SlideImage's
 * <img src=...> hit is instant instead of a 5-10 second blocking download
 * over crowded classroom Wi-Fi.
 *
 * Loaded serially with a small inter-image delay rather than in parallel
 * to avoid saturating the link with 25 simultaneous 2MB requests.
 */
export default function SlidePreloader() {
  const room = useRoom();
  const isConnected = room.status === 'open' || room.status === 'connecting';

  useEffect(() => {
    if (!isConnected) return;
    let cancelled = false;
    const loaders: HTMLImageElement[] = [];

    function loadOne(i: number) {
      if (cancelled) return;
      if (i >= SLIDE_PHASES.length) return;
      const phase = SLIDE_PHASES[i];
      const img = new Image();
      loaders.push(img);
      const next = () => {
        // 80ms delay between starts — gives the network breathing room while
        // still warming the cache in well under a minute total.
        if (!cancelled) window.setTimeout(() => loadOne(i + 1), 80);
      };
      img.onload = next;
      img.onerror = next;
      // decoding=async + fetchpriority=low so the actual visible slide
      // request, when it happens, still wins priority.
      img.decoding = 'async';
      try {
        // fetchPriority is widely supported (Chromium 102+, Safari 17.2+).
        (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'low';
      } catch {
        // ignore on browsers that don't support it.
      }
      img.src = `/slides/${phase}.png`;
    }

    loadOne(0);

    return () => {
      cancelled = true;
      // Drop refs so GC can collect; cached bytes stay in the HTTP cache.
      loaders.length = 0;
    };
  }, [isConnected]);

  return null;
}
