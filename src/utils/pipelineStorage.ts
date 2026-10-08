import { ChannelKey, ChannelPost } from '../components/ChannelTabPanel';

const STORAGE_PREFIX = 'aeobility_pipeline_draft_v1';

export function getDraftStorageKey(nodeId: string): string {
  return `${STORAGE_PREFIX}_${nodeId}`;
}

export function loadDraftFromStorage(
  nodeId: string
): Record<ChannelKey, ChannelPost> | null {
  try {
    const raw = localStorage.getItem(getDraftStorageKey(nodeId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load draft from localStorage:', err);
    return null;
  }
}

export function saveDraftToStorage(
  nodeId: string,
  bundle: Record<ChannelKey, ChannelPost>
): void {
  try {
    // Implement Step 4 Storage Optimizations: Strip out base64 images
    const optimizedBundle = JSON.parse(JSON.stringify(bundle));
    Object.keys(optimizedBundle).forEach((key) => {
      const channel = key as ChannelKey;
      if (optimizedBundle[channel].visuals?.assetUrl?.startsWith('data:image/')) {
        // We strip the base64 string to avoid quota drops
        optimizedBundle[channel].visuals.assetUrl = undefined;
        // Optionally store some structured JSON layers here if needed
      }
    });

    localStorage.setItem(getDraftStorageKey(nodeId), JSON.stringify(optimizedBundle));
  } catch (err) {
    console.warn('Draft autosave failed (storage quota likely exceeded):', err);
  }
}

export function clearDraftStorage(nodeId: string): void {
  try {
    localStorage.removeItem(getDraftStorageKey(nodeId));
  } catch (err) {
    console.warn('Failed to clear stored draft:', err);
  }
}
