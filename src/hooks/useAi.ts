'use client';

import { useState, useEffect, useRef } from 'react';
import {
  suggestPrice,
  generateDescription,
  suggestReplies,
  checkListingQuality,
  PriceSuggestion,
  QualityCheck,
} from '@/lib/api';
import { useAiLoadingContext } from '@/context/AiLoadingContext';

// Stable unique ID for each hook instance so they don't collide in the context map
let instanceCounter = 0;

export function useAi() {
  const instanceId = useRef(`ai-${++instanceCounter}`).current;
  const { registerLoading } = useAiLoadingContext();

  const [priceLoading, setPriceLoading] = useState(false);
  const [descLoading, setDescLoading] = useState(false);
  const [qualityLoading, setQualityLoading] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);

  const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null);
  const [qualityCheck, setQualityCheck] = useState<QualityCheck | null>(null);

  // Sync aggregate loading state to the global context
  useEffect(() => {
    const anyLoading = priceLoading || descLoading || qualityLoading || repliesLoading;
    registerLoading(instanceId, anyLoading);
  }, [priceLoading, descLoading, qualityLoading, repliesLoading, instanceId, registerLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => registerLoading(instanceId, false);
  }, [instanceId, registerLoading]);

  const getSuggestedPrice = async (
    title: string,
    condition: string,
    category: string
  ) => {
    if (!title || !condition || !category) return;
    setPriceLoading(true);
    setPriceSuggestion(null);
    try {
      const result = await suggestPrice(title, condition, category);
      setPriceSuggestion(result);
    } catch (err) {
      console.error('Price suggestion failed:', err);
      throw err; // re-throw so callers can show toast
    } finally {
      setPriceLoading(false);
    }
  };

  const getGeneratedDescription = async (
    title: string,
    condition: string,
    category: string
  ): Promise<string | null> => {
    if (!title || !condition || !category) return null;
    setDescLoading(true);
    try {
      const result = await generateDescription(title, condition, category);
      return result;
    } catch (err) {
      console.error('Description generation failed:', err);
      throw err; // re-throw so callers can show toast
    } finally {
      setDescLoading(false);
    }
  };

  const getQualityCheck = async (title: string, description: string) => {
    if (!title) return;
    setQualityLoading(true);
    setQualityCheck(null);
    try {
      const result = await checkListingQuality(title, description);
      setQualityCheck(result);
    } catch (err) {
      console.error('Quality check failed:', err);
      // silent fail — just hide quality card
    } finally {
      setQualityLoading(false);
    }
  };

  const getReplySuggestions = async (
    recentMessages: string[],
    role: string
  ): Promise<string[]> => {
    setRepliesLoading(true);
    try {
      const result = await suggestReplies(recentMessages, role);
      return result;
    } catch (err) {
      console.error('Reply suggestions failed:', err);
      return []; // silent fail
    } finally {
      setRepliesLoading(false);
    }
  };

  return {
    getSuggestedPrice,
    getGeneratedDescription,
    getQualityCheck,
    getReplySuggestions,
    priceLoading,
    descLoading,
    qualityLoading,
    repliesLoading,
    priceSuggestion,
    qualityCheck,
  };
}
