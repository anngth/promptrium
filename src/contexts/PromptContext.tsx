"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { Dispatch, SetStateAction } from "react";
import { Prompt, Settings, PromptContextType, SortKey } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePromptDataOperations } from "@/hooks/usePromptDataOperations";
import { PromptDataProvider, usePromptData } from "./PromptDataContext";
import { sanitizeSettings } from "@/utils/helpers";

import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  SORT_KEYS,
  SORT_ORDER,
} from "@/constants";

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const usePrompts = () => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error("usePrompts must be used within a PromptProvider");
  }
  return context;
};

const defaultSettings: Settings = {
  theme: DEFAULT_SETTINGS.THEME,
  view_mode: DEFAULT_SETTINGS.VIEW_MODE,
  layout_density: DEFAULT_SETTINGS.LAYOUT_DENSITY,
  last_backup: 0, // Will be updated when actually needed
};

// Internal provider that combines all contexts
const InternalPromptProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [storedSettings, setStoredSettings] = useLocalStorage<Settings>(
    STORAGE_KEYS.SETTINGS,
    defaultSettings
  );
  const settings = useMemo(
    () => sanitizeSettings(storedSettings),
    [storedSettings]
  );
  const setSettings: Dispatch<SetStateAction<Settings>> = useCallback(
    (value) => {
      // Intentionally not caught here — callers (exportData, importData,
      // clearAllData) are responsible for handling storage errors and showing
      // the appropriate toast. Swallowing the error here would prevent callers
      // from knowing the write failed.
      setStoredSettings((prev) => {
        const current = sanitizeSettings(prev);
        const next = value instanceof Function ? value(current) : value;
        return sanitizeSettings(next);
      });
    },
    [setStoredSettings]
  );
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  // Filter state
  const [searchQuery, setSearchQueryInternal] = useState("");
  const [selectedTags, setSelectedTagsInternal] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>(SORT_KEYS.UPDATED);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(SORT_ORDER.DESC);

  // Memoize state setters to prevent infinite re-renders
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryInternal(query);
  }, []);

  const setSelectedTags = useCallback((tags: string[]) => {
    setSelectedTagsInternal(tags);
  }, []);

  // Get prompt data operations
  const {
    prompts,
    mounted,
    addPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    incrementUsage,
    setPrompts,
  } = usePromptData();

  // Get filtered prompts
  const filteredPrompts = useMemo(() => {
    if (!Array.isArray(prompts)) return [];

    let filtered = [...prompts];
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    if (normalizedSearchQuery) {
      filtered = filtered.filter((prompt) => {
        return (
          prompt.title.toLowerCase().includes(normalizedSearchQuery) ||
          prompt.content.toLowerCase().includes(normalizedSearchQuery) ||
          prompt.description.toLowerCase().includes(normalizedSearchQuery) ||
          prompt.tags.some((tag) =>
            tag.toLowerCase().includes(normalizedSearchQuery)
          )
        );
      });
    }

    if (selectedTags.length > 0) {
      const requiredTags = Array.from(new Set(selectedTags));
      filtered = filtered.filter(
        (prompt) =>
          prompt.tags.length >= requiredTags.length &&
          requiredTags.every((tag) => prompt.tags.includes(tag))
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case SORT_KEYS.CREATED:
          comparison = a.created_at - b.created_at;
          break;
        case SORT_KEYS.UPDATED:
          comparison = a.updated_at - b.updated_at;
          break;
        default:
          comparison = a.updated_at - b.updated_at;
      }
      return sortOrder === SORT_ORDER.ASC ? comparison : -comparison;
    });

    return filtered;
  }, [prompts, searchQuery, selectedTags, sortBy, sortOrder]);

  const setSortOptions = useCallback(
    (newSortBy: SortKey, newSortOrder: "asc" | "desc") => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
    },
    []
  );

  // Get data operations (export, import, clear)
  const {
    isLoading,
    exportData,
    importData,
    clearAllData: originalClearAllData,
  } = usePromptDataOperations({
    prompts,
    settings,
    setPrompts,
    setSettings,
  });

  // Wrapper for clearAllData that also resets selected prompt and filter state
  const clearAllData = useCallback(() => {
    originalClearAllData();
    setSelectedPrompt(null);
    setSearchQueryInternal("");
    setSelectedTagsInternal([]);
    setSortOptions(SORT_KEYS.UPDATED, SORT_ORDER.DESC);
  }, [originalClearAllData, setSortOptions]);

  const selectPrompt = useCallback((prompt: Prompt | null) => {
    setSelectedPrompt(prompt);
  }, []);

  const updateSettings = useCallback(
    (newSettings: Partial<Settings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    [setSettings]
  );

  const handleDeletePrompt = useCallback(
    (id: string) => {
      deletePrompt(id);
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(null);
      }
    },
    [deletePrompt, selectedPrompt]
  );

  const contextValue: PromptContextType = useMemo(
    () => ({
      prompts,
      settings,
      filteredPrompts,
      selectedPrompt,
      isLoading,
      mounted,
      // Filter state
      searchQuery,
      selectedTags,
      sortBy,
      sortOrder,
      // Actions
      addPrompt,
      updatePrompt,
      deletePrompt: handleDeletePrompt,
      toggleFavorite,
      incrementUsage,
      selectPrompt,
      updateSettings,
      setSearchQuery,
      setSelectedTags,
      setSortOptions,
      exportData,
      importData,
      clearAllData,
    }),
    [
      prompts,
      settings,
      filteredPrompts,
      selectedPrompt,
      isLoading,
      mounted,
      searchQuery,
      selectedTags,
      sortBy,
      sortOrder,
      // Only include stable callback functions in dependencies
      addPrompt,
      updatePrompt,
      handleDeletePrompt,
      toggleFavorite,
      incrementUsage,
      selectPrompt,
      updateSettings,
      setSearchQuery,
      setSelectedTags,
      setSortOptions,
      exportData,
      importData,
      clearAllData,
    ]
  );

  return (
    <PromptContext.Provider value={contextValue}>
      {children}
    </PromptContext.Provider>
  );
};

// Main provider that wraps everything
export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <PromptDataProvider>
      <InternalPromptProvider>{children}</InternalPromptProvider>
    </PromptDataProvider>
  );
};
