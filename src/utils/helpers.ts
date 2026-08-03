import { Prompt, Settings } from "@/types";
import {
  VALIDATION,
  ERROR_MESSAGES,
  DATA_LIMITS,
  DEFAULT_SETTINGS,
} from "@/constants";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const generateId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getDefaultSettings = (): Settings => ({
  theme: DEFAULT_SETTINGS.THEME,
  view_mode: DEFAULT_SETTINGS.VIEW_MODE,
  layout_density: DEFAULT_SETTINGS.LAYOUT_DENSITY,
  last_backup: 0,
});

export const validateSettingsPartial = (
  importedSettings: unknown
): Partial<Settings> => {
  const validSettings: Partial<Settings> = {};

  if (
    !importedSettings ||
    typeof importedSettings !== "object" ||
    Array.isArray(importedSettings)
  ) {
    return validSettings;
  }

  const settingsRecord = importedSettings as Record<string, unknown>;

  if (settingsRecord.theme === "light" || settingsRecord.theme === "dark") {
    validSettings.theme = settingsRecord.theme;
  }

  if (
    settingsRecord.view_mode === "grid" ||
    settingsRecord.view_mode === "list"
  ) {
    validSettings.view_mode = settingsRecord.view_mode;
  }

  if (
    settingsRecord.layout_density === "compact" ||
    settingsRecord.layout_density === "comfortable" ||
    settingsRecord.layout_density === "expanded"
  ) {
    validSettings.layout_density = settingsRecord.layout_density;
  }

  if (
    typeof settingsRecord.last_backup === "number" &&
    Number.isFinite(settingsRecord.last_backup) &&
    settingsRecord.last_backup >= 0
  ) {
    validSettings.last_backup = settingsRecord.last_backup;
  }

  return validSettings;
};

export const sanitizeSettings = (value: unknown): Settings => {
  return { ...getDefaultSettings(), ...validateSettingsPartial(value) };
};

export const isValidJsonImportFile = (file: File): boolean => {
  const isJsonExtension = file.name.toLowerCase().endsWith(".json");
  const isJsonMime =
    file.type === "application/json" || file.type === "text/json";
  const isEmptyMime = file.type === "";

  return isJsonExtension && (isJsonMime || isEmptyMime);
};

export async function parseImportPreview(
  file: File
): Promise<{ promptCount: number }> {
  if (!isValidJsonImportFile(file)) {
    throw new Error(ERROR_MESSAGES.OPERATIONS.INVALID_DATA_FORMAT);
  }

  if (file.size === 0 || file.size > DATA_LIMITS.IMPORT_MAX_FILE_SIZE_BYTES) {
    throw new Error(ERROR_MESSAGES.OPERATIONS.INVALID_DATA_FORMAT);
  }

  const text = await file.text();
  const data: unknown = JSON.parse(text);

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(ERROR_MESSAGES.OPERATIONS.INVALID_DATA_FORMAT);
  }

  const dataRecord = data as Record<string, unknown>;
  if (!Array.isArray(dataRecord.prompts)) {
    throw new Error(ERROR_MESSAGES.OPERATIONS.INVALID_DATA_FORMAT);
  }

  if (dataRecord.prompts.length > DATA_LIMITS.MAX_PROMPTS) {
    throw new Error(ERROR_MESSAGES.OPERATIONS.INVALID_DATA_FORMAT);
  }

  const sanitized = sanitizePrompts(dataRecord.prompts);
  if (sanitized.length !== dataRecord.prompts.length) {
    throw new Error(ERROR_MESSAGES.OPERATIONS.INVALID_DATA_FORMAT);
  }

  return { promptCount: sanitized.length };
}

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
};

const sanitizeString = (value: unknown, maxLength: number): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length > maxLength) return null;
  return trimmed;
};

const sanitizeTimestamp = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
};

export const sanitizePrompt = (value: unknown): Prompt | null => {
  if (!isRecord(value)) return null;

  const id = sanitizeString(value.id, DATA_LIMITS.ID_MAX_LENGTH);
  const title = sanitizeString(value.title, VALIDATION.TITLE.MAX_LENGTH);
  const content = sanitizeString(value.content, VALIDATION.CONTENT.MAX_LENGTH);
  const description = sanitizeString(
    value.description ?? "",
    VALIDATION.DESCRIPTION.MAX_LENGTH
  );
  const createdAt = sanitizeTimestamp(value.created_at);
  const updatedAt = sanitizeTimestamp(value.updated_at);

  if (!id || !title || !content || description === null) return null;
  if (createdAt === null || updatedAt === null) return null;
  if (title.length < VALIDATION.TITLE.MIN_LENGTH) return null;
  if (content.length < VALIDATION.CONTENT.MIN_LENGTH) return null;

  if (!Array.isArray(value.tags)) return null;

  const tags = deduplicateTags(
    value.tags.filter((tag): tag is string => typeof tag === "string")
  );

  if (
    tags.length !== value.tags.length ||
    tags.length > VALIDATION.TAGS.MAX_COUNT ||
    tags.some((tag) => tag.length > VALIDATION.TAGS.MAX_LENGTH)
  ) {
    return null;
  }

  const usageCount =
    typeof value.usage_count === "number" &&
    Number.isFinite(value.usage_count) &&
    value.usage_count >= 0
      ? Math.floor(value.usage_count)
      : 0;

  return {
    id,
    title,
    content,
    description,
    tags,
    created_at: createdAt,
    updated_at: updatedAt,
    usage_count: usageCount,
    is_favorite: value.is_favorite === true,
  };
};

export const sanitizePrompts = (value: unknown): Prompt[] => {
  if (!Array.isArray(value)) return [];

  const prompts: Prompt[] = [];
  const seenIds = new Set<string>();

  for (const item of value) {
    const prompt = sanitizePrompt(item);
    if (!prompt || seenIds.has(prompt.id)) continue;

    seenIds.add(prompt.id);
    prompts.push(prompt);
  }

  return prompts;
};

export const searchPrompts = (prompts: Prompt[], query: string): Prompt[] => {
  // Ensure prompts is an array before filtering
  if (!Array.isArray(prompts)) {
    return [];
  }

  if (!query.trim()) return prompts;
  const searchTerm = query.trim().toLowerCase();
  return prompts.filter((prompt) => {
    return (
      prompt.title.toLowerCase().includes(searchTerm) ||
      prompt.content.toLowerCase().includes(searchTerm) ||
      prompt.description.toLowerCase().includes(searchTerm) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
  });
};

export const getAllTags = (prompts: Prompt[]): string[] => {
  const tagSet = new Set<string>();

  // Ensure prompts is an array before iterating
  if (!Array.isArray(prompts)) {
    return [];
  }

  prompts.forEach((prompt) => {
    // Ensure prompt.tags is an array before iterating
    if (Array.isArray(prompt.tags)) {
      prompt.tags.forEach((tag) => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
};

export const validatePrompt = (
  prompt: Partial<Prompt>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Normalize and validate title
  const title = prompt.title?.trim() || "";
  if (!title) {
    errors.push(ERROR_MESSAGES.VALIDATION.TITLE_REQUIRED);
  } else if (title.length < VALIDATION.TITLE.MIN_LENGTH) {
    errors.push(ERROR_MESSAGES.VALIDATION.TITLE_TOO_SHORT);
  } else if (title.length > VALIDATION.TITLE.MAX_LENGTH) {
    errors.push(ERROR_MESSAGES.VALIDATION.TITLE_TOO_LONG);
  }

  // Normalize and validate content
  const content = prompt.content?.trim() || "";
  if (!content) {
    errors.push(ERROR_MESSAGES.VALIDATION.CONTENT_REQUIRED);
  } else if (content.length < VALIDATION.CONTENT.MIN_LENGTH) {
    errors.push(ERROR_MESSAGES.VALIDATION.CONTENT_TOO_SHORT);
  } else if (content.length > VALIDATION.CONTENT.MAX_LENGTH) {
    errors.push(ERROR_MESSAGES.VALIDATION.CONTENT_TOO_LONG);
  }

  // Normalize and validate description
  const description = prompt.description?.trim() || "";
  if (description && description.length > VALIDATION.DESCRIPTION.MAX_LENGTH) {
    errors.push(ERROR_MESSAGES.VALIDATION.DESCRIPTION_TOO_LONG);
  }

  // Normalize and validate tags
  const tags = (prompt.tags || [])
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  // Check tag count
  if (tags.length > VALIDATION.TAGS.MAX_COUNT) {
    errors.push(ERROR_MESSAGES.VALIDATION.TAGS_TOO_MANY);
  }

  // Check individual tag lengths
  for (const tag of tags) {
    if (tag.length > VALIDATION.TAGS.MAX_LENGTH) {
      errors.push(ERROR_MESSAGES.VALIDATION.TAGS_TOO_LONG);
      break; // Only show this error once
    }
  }

  return { isValid: errors.length === 0, errors };
};

export const downloadFile = (
  content: string,
  filename: string,
  contentType: string = "application/json"
): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Add timeout to prevent hanging on slow clipboard operations
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Clipboard timeout")), 1000);
      });

      await Promise.race([navigator.clipboard.writeText(text), timeoutPromise]);

      return true;
    } else {
      // Fallback method for non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);

      try {
        textArea.focus();
        textArea.select();

        const success = document.execCommand("copy");
        return success;
      } catch {
        return false;
      } finally {
        // Always remove the textarea, regardless of success or failure
        if (document.body.contains(textArea)) {
          document.body.removeChild(textArea);
        }
      }
    }
  } catch (error) {
    console.warn("Copy to clipboard failed:", error);
    return false;
  }
};

export const debounceString = (
  func: (value: string) => void,
  wait: number
): ((value: string) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (value: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(value), wait);
  };
};

export const deduplicateTags = (tags: string[]): string[] => {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
};
