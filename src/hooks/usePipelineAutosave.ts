import { useState, useEffect, useRef } from 'react';
import { ChannelKey, ChannelPost } from '../components/ChannelTabPanel';
import {
  loadDraftFromStorage,
  saveDraftToStorage,
  clearDraftStorage,
} from '../utils/pipelineStorage';

export function usePipelineAutosave(
  nodeId: string,
  initialBundle: Record<ChannelKey, ChannelPost>,
  debounceMs: number = 800
) {
  // Initialize state from existing draft if present
  const [bundlePosts, setBundlePosts] = useState<Record<ChannelKey, ChannelPost>>(() => {
    return loadDraftFromStorage(nodeId) || initialBundle;
  });

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'pristine'>('pristine');
  const isFirstMount = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. Re-hydrate when selectedNode changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const cached = loadDraftFromStorage(nodeId);
    setBundlePosts(cached || initialBundle);
    setSaveStatus('pristine');
  }, [nodeId]);

  // 2. Debounced save triggered on every bundlePosts change
  useEffect(() => {
    // Skip empty or generating states from triggering dirty saves
    const isPristine = Object.values(bundlePosts).every((p) => p.status === 'empty' || p.status === 'idle');
    if (isPristine) return;

    setSaveStatus('saving');

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      saveDraftToStorage(nodeId, bundlePosts);
      setSaveStatus('saved');
    }, debounceMs);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [bundlePosts, nodeId, debounceMs]);

  const clearCurrentDraft = () => {
    clearDraftStorage(nodeId);
    setBundlePosts(initialBundle);
    setSaveStatus('pristine');
  };

  return {
    bundlePosts,
    setBundlePosts,
    saveStatus,
    clearCurrentDraft,
  };
}
