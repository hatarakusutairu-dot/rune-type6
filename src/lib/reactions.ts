export interface ReactionItem {
  /** Unicode emoji string, OR a key matching public/reactions/<key>.png */
  key: string;
  /** Optional label shown in the panel. Defaults to the emoji itself. */
  label?: string;
}

export interface ReactionManifest {
  items: ReactionItem[];
}

/** Hard-coded set of built-in unicode reactions. Always available. */
export const BUILTIN_REACTIONS: ReactionItem[] = [
  { key: '👏', label: '拍手' },
  { key: '🔥', label: '燃える' },
  { key: '😂', label: '笑い' },
  { key: '❤️', label: 'いいね' },
  { key: '🎉', label: 'お祝い' },
  { key: '😮', label: 'びっくり' },
];

/** Returns true if a key looks like a custom image key (lowercase + digits + - _). */
export function isImageKey(key: string): boolean {
  return /^[a-z0-9_-]+$/.test(key);
}

/** Returns the image URL for a custom reaction key. */
export function imageUrlFor(key: string): string {
  return `/reactions/${key}.png`;
}

/** Fetches the custom reaction manifest. Returns empty array on failure. */
export async function loadCustomReactions(): Promise<ReactionItem[]> {
  try {
    const res = await fetch('/reactions/manifest.json', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = (await res.json()) as ReactionManifest;
    return (data.items ?? []).filter((it) => isImageKey(it.key));
  } catch {
    return [];
  }
}
