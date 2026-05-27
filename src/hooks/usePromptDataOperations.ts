import { useState, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Prompt, Settings } from "@/types";
import {
  downloadFile,
  sanitizePrompts,
  validateSettingsPartial,
  getDefaultSettings,
  isValidJsonImportFile,
} from "@/utils/helpers";
import { useToast } from "@/components/ui/use-toast";
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  EXPORT,
  DATA_LIMITS,
  STORAGE_KEYS,
} from "@/constants";
// Shared helpers — single source of truth for quota detection and messaging.
import {
  isQuotaError,
  storageErrorMessage,
} from "@/contexts/PromptDataContext";

interface UsePromptDataOperationsProps {
  prompts: Prompt[];
  settings: Settings;
  setPrompts: Dispatch<SetStateAction<Prompt[]>>;
  setSettings: Dispatch<SetStateAction<Settings>>;
}

export const usePromptDataOperations = ({
  prompts,
  settings,
  setPrompts,
  setSettings,
}: UsePromptDataOperationsProps) => {
  const { success, error, warning } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleExportData = useCallback(() => {
    const jsonData = JSON.stringify(
      {
        prompts,
        settings,
        exportDate: new Date().toISOString(),
        version: EXPORT.VERSION,
      },
      null,
      2
    );

    const filename = `${EXPORT.FILENAME_PREFIX}${
      new Date().toISOString().split("T")[0]
    }.json`;

    // Download the file first — this always succeeds regardless of storage state.
    downloadFile(jsonData, filename, EXPORT.MIME_TYPE);

    // Update the backup timestamp. If this fails (storage full) the file has
    // already been downloaded, so we warn rather than claiming full success.
    try {
      setSettings((prev) => ({ ...prev, last_backup: Date.now() }));
      success(SUCCESS_MESSAGES.DATA_EXPORTED);
    } catch (err) {
      console.error("Failed to update backup timestamp:", err);
      warning(
        "Export complete",
        "Your file was downloaded, but the backup timestamp could not be saved (storage full)."
      );
    }
  }, [prompts, settings, setSettings, success, warning]);

  const handleImportData = useCallback(
    async (file: File) => {
      try {
        setIsLoading(true);

        // ── Validation / parse phase ──────────────────────────────────────
        // Errors here mean the file is bad, not that storage is full.
        if (!isValidJsonImportFile(file)) {
          throw new Error(ERROR_MESSAGES.OPERATIONS.INVALID_DATA_FORMAT);
        }

        if (
          file.size === 0 ||
          file.size > DATA_LIMITS.IMPORT_MAX_FILE_SIZE_BYTES
        ) {
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

        // ── Preflight size check ──────────────────────────────────────────
        // Import replaces existing keys, so what matters is the *delta*:
        // bytes-to-add = new payload size − old payload size.
        // Testing the full new payload as an extra key (old approach) would
        // false-positive when the user already has a large dataset and is
        // importing one of similar size — the replace fits, but the probe
        // would need double the space temporarily.
        const promptsJson = JSON.stringify(sanitized);
        const settingsJson = dataRecord.settings
          ? JSON.stringify(validateSettingsPartial(dataRecord.settings))
          : null;

        const oldPromptsSize =
          localStorage.getItem(STORAGE_KEYS.PROMPTS)?.length ?? 0;
        const oldSettingsSize =
          localStorage.getItem(STORAGE_KEYS.SETTINGS)?.length ?? 0;

        const promptsDelta = promptsJson.length - oldPromptsSize;
        const settingsDelta = settingsJson
          ? settingsJson.length - oldSettingsSize
          : 0;
        const totalDelta = promptsDelta + settingsDelta;

        // Only probe when the new data is larger than what it replaces.
        // A zero or negative delta means we are shrinking storage — always safe.
        if (totalDelta > 0) {
          const probeKey = "__promptrium_preflight__";
          try {
            localStorage.setItem(probeKey, "x".repeat(totalDelta));
          } catch (probeErr) {
            localStorage.removeItem(probeKey);
            error(
              isQuotaError(probeErr) ? "Storage full" : "Import failed",
              isQuotaError(probeErr)
                ? "Your browser storage is full. Export your existing data to free up space, then try again."
                : ERROR_MESSAGES.OPERATIONS.IMPORT_FAILED
            );
            return;
          }
          localStorage.removeItem(probeKey);
        }

        // ── Persistence phase ─────────────────────────────────────────────
        // Preflight passed — both payloads fit. Real writes should succeed.
        // A failure here would be a non-quota storage error (e.g. private
        // browsing storage disabled), handled the same way.
        try {
          setPrompts(sanitized);

          if (dataRecord.settings && settingsJson) {
            const validatedSettings = validateSettingsPartial(
              dataRecord.settings
            );
            setSettings((prev) => ({ ...prev, ...validatedSettings }));
          }

          // Only reached when both writes succeeded.
          success(SUCCESS_MESSAGES.DATA_IMPORTED);
        } catch (persistErr) {
          console.error("Failed to persist imported data:", persistErr);
          error(
            isQuotaError(persistErr) ? "Storage full" : "Import failed",
            isQuotaError(persistErr)
              ? "Your browser storage is full. Export your existing data to free up space, then try again."
              : ERROR_MESSAGES.OPERATIONS.IMPORT_FAILED
          );
        }
      } catch {
        // Validation / parse errors land here.
        error(
          ERROR_MESSAGES.OPERATIONS.IMPORT_FAILED,
          "Please check the file format."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setPrompts, setSettings, success, error]
  );

  const clearAllData = useCallback(() => {
    try {
      setPrompts([]);
      setSettings(getDefaultSettings());
      // Only reached when both writes succeeded.
      success(SUCCESS_MESSAGES.ALL_DATA_CLEARED);
    } catch (err) {
      console.error("Failed to clear data:", err);
      error("Clear failed", storageErrorMessage(err));
    }
  }, [setPrompts, setSettings, success, error]);

  return {
    isLoading,
    exportData: handleExportData,
    importData: handleImportData,
    clearAllData,
  };
};
