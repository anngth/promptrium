"use client";

import React, { createContext, useContext, useCallback, useMemo } from "react";
import { Prompt, PromptFormData } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  validatePrompt,
  deduplicateTags,
  sanitizePrompts,
} from "@/utils/helpers";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import {
  STORAGE_KEYS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  DATA_LIMITS,
} from "@/constants";

interface PromptDataContextType {
  prompts: Prompt[];
  mounted: boolean;
  addPrompt: (promptData: PromptFormData) => void;
  updatePrompt: (id: string, promptData: PromptFormData) => void;
  deletePrompt: (id: string) => void;
  toggleFavorite: (id: string) => void;
  incrementUsage: (id: string) => void;
  setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>;
}

const PromptDataContext = createContext<PromptDataContextType | undefined>(
  undefined
);

export const usePromptData = () => {
  const context = useContext(PromptDataContext);
  if (!context) {
    throw new Error("usePromptData must be used within a PromptDataProvider");
  }
  return context;
};

export function isQuotaError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "QuotaExceededError" ||
      err.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

export function storageErrorMessage(err: unknown): string {
  return isQuotaError(err)
    ? "Your browser storage is full. Export your data to free up space, then try again."
    : "Failed to save data. Please try again.";
}

export const PromptDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { success, error } = useToast();
  const [storedPrompts, setStoredPrompts, mounted] = useLocalStorage<Prompt[]>(
    STORAGE_KEYS.PROMPTS,
    []
  );
  const prompts = useMemo(
    () => sanitizePrompts(storedPrompts),
    [storedPrompts]
  );

  // setPrompts: compute next state, persist, then update React state.
  // Throws on storage failure — callers are responsible for catching and
  // deciding what toast to show. No toast is emitted here so bulk operations
  // (import, clear) can show a single, context-appropriate message.
  const setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>> =
    useCallback(
      (value) => {
        setStoredPrompts((prev) => {
          const currentPrompts = sanitizePrompts(prev);
          const nextPrompts =
            value instanceof Function ? value(currentPrompts) : value;
          return sanitizePrompts(nextPrompts);
        });
      },
      [setStoredPrompts]
    );

  const addPrompt = useCallback(
    (promptData: PromptFormData) => {
      if (prompts.length >= DATA_LIMITS.MAX_PROMPTS) {
        error(
          ERROR_MESSAGES.OPERATIONS.VALIDATION_FAILED,
          `Maximum ${DATA_LIMITS.MAX_PROMPTS} prompts allowed`
        );
        return;
      }

      const validation = validatePrompt(promptData);
      if (!validation.isValid) {
        error(
          ERROR_MESSAGES.OPERATIONS.VALIDATION_FAILED,
          validation.errors.join(", ")
        );
        return;
      }

      const newPrompt: Prompt = {
        id: uuidv4(),
        title: promptData.title.trim(),
        content: promptData.content.trim(),
        description: "",
        tags: deduplicateTags(promptData.tags),
        created_at: Date.now(),
        updated_at: Date.now(),
        usage_count: 0,
        is_favorite: false,
      };

      try {
        setPrompts((prev) => [...prev, newPrompt]);
        success(SUCCESS_MESSAGES.PROMPT_CREATED);
      } catch (err) {
        console.error("Error writing localStorage:", err);
        error("Storage full", storageErrorMessage(err));
      }
    },
    [prompts.length, setPrompts, success, error]
  );

  const updatePrompt = useCallback(
    (id: string, promptData: PromptFormData) => {
      const validation = validatePrompt(promptData);
      if (!validation.isValid) {
        error(
          ERROR_MESSAGES.OPERATIONS.VALIDATION_FAILED,
          validation.errors.join(", ")
        );
        return;
      }

      try {
        setPrompts((prev) =>
          prev.map((prompt) =>
            prompt.id === id
              ? {
                  ...prompt,
                  title: promptData.title.trim(),
                  content: promptData.content.trim(),
                  tags: deduplicateTags(promptData.tags),
                  updated_at: Date.now(),
                }
              : prompt
          )
        );
        success(SUCCESS_MESSAGES.PROMPT_UPDATED);
      } catch (err) {
        console.error("Error writing localStorage:", err);
        error("Storage full", storageErrorMessage(err));
      }
    },
    [setPrompts, success, error]
  );

  const deletePrompt = useCallback(
    (id: string) => {
      try {
        setPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
        success(SUCCESS_MESSAGES.PROMPT_DELETED);
      } catch (err) {
        console.error("Error writing localStorage:", err);
        error("Storage full", storageErrorMessage(err));
      }
    },
    [setPrompts, success, error]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      try {
        setPrompts((prev) =>
          prev.map((prompt) =>
            prompt.id === id
              ? { ...prompt, is_favorite: !prompt.is_favorite }
              : prompt
          )
        );
      } catch (err) {
        console.error("Error writing localStorage:", err);
        error("Storage full", storageErrorMessage(err));
      }
    },
    [setPrompts, error]
  );

  const incrementUsage = useCallback(
    (id: string) => {
      try {
        setPrompts((prev) =>
          prev.map((prompt) =>
            prompt.id === id
              ? { ...prompt, usage_count: prompt.usage_count + 1 }
              : prompt
          )
        );
      } catch (err) {
        console.error("Error writing localStorage:", err);
        error("Storage full", storageErrorMessage(err));
      }
    },
    [setPrompts, error]
  );

  const contextValue: PromptDataContextType = useMemo(
    () => ({
      prompts,
      mounted,
      addPrompt,
      updatePrompt,
      deletePrompt,
      toggleFavorite,
      incrementUsage,
      setPrompts,
    }),
    [
      prompts,
      mounted,
      addPrompt,
      updatePrompt,
      deletePrompt,
      toggleFavorite,
      incrementUsage,
      setPrompts,
    ]
  );

  return (
    <PromptDataContext.Provider value={contextValue}>
      {children}
    </PromptDataContext.Provider>
  );
};
