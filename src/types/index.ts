export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  created_at: number;
  updated_at: number;
  usage_count: number;
  is_favorite: boolean;
}

export interface Settings {
  theme: "light" | "dark";
  view_mode: "grid" | "list";
  layout_density: "compact" | "comfortable" | "expanded";
  last_backup: number;
}

export type ModalType =
  | "create"
  | "edit"
  | "delete"
  | "import"
  | "export"
  | null;
export type ViewMode = "grid" | "list";
export type LayoutDensity = "compact" | "comfortable" | "expanded";
export type SortKey = "updated" | "created";

export interface PromptFormData {
  title: string;
  content: string;
  description: string;
  tags: string[];
}

export interface PromptContextType {
  prompts: Prompt[];
  settings: Settings;
  filteredPrompts: Prompt[];
  selectedPrompt: Prompt | null;
  isLoading: boolean;
  mounted: boolean;

  // Filter state
  searchQuery: string;
  selectedTags: string[];
  sortBy: SortKey;
  sortOrder: "asc" | "desc";

  addPrompt: (prompt: PromptFormData) => void;
  updatePrompt: (id: string, prompt: PromptFormData) => void;
  deletePrompt: (id: string) => void;
  toggleFavorite: (id: string) => void;
  incrementUsage: (id: string) => void;
  selectPrompt: (prompt: Prompt | null) => void;

  updateSettings: (settings: Partial<Settings>) => void;

  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSortOptions: (sortBy: SortKey, sortOrder: "asc" | "desc") => void;

  exportData: () => void;
  importData: (file: File) => Promise<void>;
  clearAllData: () => void;
}

export interface PromptFormProps {
  prompt?: Prompt;
  onSubmit: (data: PromptFormData) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface FilterPanelProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  sortBy: SortKey;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: SortKey, sortOrder: "asc" | "desc") => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "half" | "full";
}

// ButtonProps is defined in @/components/ui/button

export interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  type?: "text" | "email" | "password" | "number" | "textarea";
  rows?: number;
  className?: string;
}
