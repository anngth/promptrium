// Storage keys
export const STORAGE_KEYS = {
  PROMPTS: "promptrium_prompts",
  SETTINGS: "promptrium_settings",
} as const;

// Validation constants
export const VALIDATION = {
  TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  CONTENT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 20000,
  },
  DESCRIPTION: {
    MAX_LENGTH: 200,
  },
  TAGS: {
    MAX_COUNT: 10,
    MAX_LENGTH: 20,
  },
} as const;

export const DATA_LIMITS = {
  IMPORT_MAX_FILE_SIZE_BYTES: 1024 * 1024,
  MAX_PROMPTS: 1000,
  ID_MAX_LENGTH: 100,
} as const;

// UI constants
export const UI = {
  DEBOUNCE_DELAY: 300,
  COPY_RESET_DELAY: 2000,
  SKELETON_COUNT: 3,
} as const;

// Default settings
export const DEFAULT_SETTINGS = {
  THEME: "light",
  VIEW_MODE: "grid",
  LAYOUT_DENSITY: "comfortable",
} as const;

// Sort keys
export const SORT_KEYS = {
  UPDATED: "updated",
  CREATED: "created",
} as const;

// Sort options
export const SORT_OPTIONS = [
  { key: SORT_KEYS.UPDATED, label: "Last Updated" },
  { key: SORT_KEYS.CREATED, label: "Created Date" },
] as const satisfies ReadonlyArray<{
  key: (typeof SORT_KEYS)[keyof typeof SORT_KEYS];
  label: string;
}>;

// Sort order
export const SORT_ORDER = {
  ASC: "asc",
  DESC: "desc",
} as const;

// Export constants
export const EXPORT = {
  VERSION: "1.1.0",
  FILENAME_PREFIX: "promptrium-export-",
  MIME_TYPE: "application/json",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  VALIDATION: {
    TITLE_REQUIRED: "Title is required",
    TITLE_TOO_SHORT: `Title must be at least ${VALIDATION.TITLE.MIN_LENGTH} characters`,
    TITLE_TOO_LONG: `Title must be less than ${VALIDATION.TITLE.MAX_LENGTH} characters`,
    CONTENT_REQUIRED: "Content is required",
    CONTENT_TOO_SHORT: `Content must be at least ${VALIDATION.CONTENT.MIN_LENGTH} characters`,
    CONTENT_TOO_LONG: `Content must be less than ${VALIDATION.CONTENT.MAX_LENGTH} characters`,
    DESCRIPTION_TOO_LONG: `Description must be less than ${VALIDATION.DESCRIPTION.MAX_LENGTH} characters`,
    TAGS_TOO_LONG: `Tag must be less than ${VALIDATION.TAGS.MAX_LENGTH} characters`,
    TAGS_TOO_MANY: `Maximum ${VALIDATION.TAGS.MAX_COUNT} tags allowed`,
  },
  OPERATIONS: {
    CREATE_FAILED: "Failed to create prompt. Please try again.",
    UPDATE_FAILED: "Failed to update prompt. Please try again.",
    DELETE_FAILED: "Failed to delete prompt. Please try again.",
    COPY_FAILED: "Copy failed",
    IMPORT_FAILED: "Failed to import data. Please check the file format.",
    EXPORT_FAILED: "Failed to export data. Please try again.",
    VALIDATION_FAILED: "Validation failed",
    INVALID_DATA_FORMAT: "Invalid data format",
    FAVORITE_STATUS_UPDATE_FAILED: "Failed to update favorite status.",
    USAGE_COUNT_UPDATE_FAILED: "Failed to update usage count.",
  },
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PROMPT_CREATED: "Prompt created successfully!",
  PROMPT_UPDATED: "Prompt updated successfully!",
  PROMPT_DELETED: "Prompt deleted successfully!",
  PROMPT_COPIED: "Copied to clipboard!",
  DATA_EXPORTED: "Data exported successfully!",
  DATA_IMPORTED: "Data imported successfully!",
  FAVORITE_UPDATED: "Favorite status updated!",
  USAGE_UPDATED: "Usage count updated!",
  ALL_DATA_CLEARED: "All data cleared successfully!",
} as const;
