import { useState, useMemo, useCallback } from "react";
import { usePrompts } from "@/contexts/PromptContext";
import { useToast } from "@/components/ui/use-toast";
import { getAllTags, parseImportPreview } from "@/utils/helpers";
import { Prompt, ModalType, PromptFormData, SortKey } from "@/types";

export interface ImportPreview {
  file: File;
  promptCount: number;
  fileName: string;
}

export const usePageLogic = () => {
  const {
    prompts,
    filteredPrompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    incrementUsage,
    exportData,
    importData,
    isLoading,
    mounted,
    // Filter state
    searchQuery,
    selectedTags,
    sortBy,
    sortOrder,
    // Filter actions
    setSearchQuery,
    setSelectedTags,
    setSortOptions,
  } = usePrompts();

  const { toast } = useToast();

  // Local state
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(
    null
  );

  // Get available tags
  const availableTags = useMemo(() => {
    return getAllTags(prompts);
  }, [prompts]);

  // Handle search and filter changes
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      setSelectedTags(tags);
    },
    [setSelectedTags]
  );

  const handleSortChange = useCallback(
    (newSortBy: SortKey, newSortOrder: "asc" | "desc") => {
      setSortOptions(newSortBy, newSortOrder);
    },
    [setSortOptions]
  );

  const closeModal = useCallback(() => {
    setModalType(null);
    setSelectedPrompt(null);
    setImportPreview(null);
  }, []);

  // Import handler — validate file and show confirmation dialog
  const handleImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      try {
        const preview = await parseImportPreview(file);
        setImportPreview({
          file,
          promptCount: preview.promptCount,
          fileName: file.name,
        });
        setModalType("import");
      } catch {
        toast({
          title: "Import failed",
          description:
            "Invalid file. Please select a valid Promptrium JSON export.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const handleConfirmImport = useCallback(async () => {
    if (!importPreview) return;
    await importData(importPreview.file);
    closeModal();
  }, [importPreview, importData, closeModal]);

  const handleExportBackup = useCallback(() => {
    exportData();
  }, [exportData]);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setSelectedPrompt(null);
    setModalType("create");
  }, []);

  const openEditModal = useCallback((prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setModalType("edit");
  }, []);

  const openDeleteModal = useCallback((prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setModalType("delete");
  }, []);

  // Prompt handlers
  const handlePromptSubmit = useCallback(
    (formData: PromptFormData) => {
      if (modalType === "create") {
        addPrompt(formData);
      } else if (modalType === "edit" && selectedPrompt) {
        updatePrompt(selectedPrompt.id, formData);
      }
      closeModal();
    },
    [modalType, selectedPrompt, addPrompt, updatePrompt, closeModal]
  );

  const handlePromptDelete = useCallback(() => {
    if (selectedPrompt) {
      deletePrompt(selectedPrompt.id);
      closeModal();
    }
  }, [selectedPrompt, deletePrompt, closeModal]);

  const handlePromptCopy = useCallback(
    (prompt: Prompt) => {
      incrementUsage(prompt.id);
    },
    [incrementUsage]
  );

  const handlePromptFavorite = useCallback(
    (prompt: Prompt) => {
      toggleFavorite(prompt.id);
    },
    [toggleFavorite]
  );

  return {
    // Data
    prompts,
    filteredPrompts,
    availableTags,
    mounted,

    // State
    selectedPrompt,
    modalType,
    importPreview,
    isImporting: isLoading,
    searchQuery,
    selectedTags,
    sortBy,
    sortOrder,

    // Handlers
    handleSearchChange,
    handleTagsChange,
    handleSortChange,
    handleImport,
    handleConfirmImport,
    handleExportBackup,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    handlePromptSubmit,
    handlePromptDelete,
    handlePromptCopy,
    handlePromptFavorite,
    exportData,
  };
};
