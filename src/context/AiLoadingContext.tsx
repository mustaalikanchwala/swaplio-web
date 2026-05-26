'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface AiLoadingContextValue {
  registerLoading: (key: string, value: boolean) => void;
  isAnyLoading: boolean;
}

const AiLoadingContext = createContext<AiLoadingContextValue>({
  registerLoading: () => {},
  isAnyLoading: false,
});

export function AiLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const registerLoading = useCallback((key: string, value: boolean) => {
    setLoadingMap((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isAnyLoading = Object.values(loadingMap).some(Boolean);

  return (
    <AiLoadingContext.Provider value={{ registerLoading, isAnyLoading }}>
      {children}
    </AiLoadingContext.Provider>
  );
}

export function useAiLoadingContext() {
  return useContext(AiLoadingContext);
}
