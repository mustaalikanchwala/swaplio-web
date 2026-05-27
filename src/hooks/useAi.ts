'use client';

import { useState, useEffect, useRef } from 'react';
import {
  suggestPrice,
  generateDescription,
  suggestReplies,
  PriceSuggestion,
} from '@/lib/api';
import { useAiLoadingContext } from '@/context/AiLoadingContext';

// Stable unique ID for each hook instance so they don't collide in the context map
let instanceCounter = 0;

export function useAi() {
  const instanceId = useRef(`ai-${++instanceCounter}`).current;
  const { registerLoading } = useAiLoadingContext();

  const [priceLoading, setPriceLoading] = useState(false);
  const [descLoading, setDescLoading] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);

  const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null);

  // Sync aggregate loading state to the global context
  useEffect(() => {
    const anyLoading = priceLoading || descLoading || repliesLoading;
    registerLoading(instanceId, anyLoading);
  }, [priceLoading, descLoading, repliesLoading, instanceId, registerLoading]);

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
    getReplySuggestions,
    priceLoading,
    descLoading,
    repliesLoading,
    priceSuggestion,
  };
}
