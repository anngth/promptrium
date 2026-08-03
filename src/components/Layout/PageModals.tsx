"use client";

import React, { useRef, useState } from "react";
import PromptForm, { PromptFormRef } from "@/components/Prompt/PromptForm";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Prompt, ModalType, PromptFormData } from "@/types";
import { Trash2, Upload } from "lucide-react";
import type { ImportPreview } from "@/hooks/usePageLogic";

interface PageModalsProps {
  modalType: ModalType;
  selectedPrompt: Prompt | null;
  importPreview: ImportPreview | null;
  isImporting: boolean;
  currentPromptCount: number;
  onCloseModal: () => void;
  onSubmitPrompt: (formData: PromptFormData) => void;
  onDeletePrompt: () => void;
  onConfirmImport: () => void;
  onExportBackup: () => void;
}

export const PageModals: React.FC<PageModalsProps> = ({
  modalType,
  selectedPrompt,
  importPreview,
  isImporting,
  currentPromptCount,
  onCloseModal,
  onSubmitPrompt,
  onDeletePrompt,
  onConfirmImport,
  onExportBackup,
}) => {
  const formRef = useRef<PromptFormRef>(null);
  const [formState, setFormState] = useState<{
    isFormValid: boolean;
    isSubmitting: boolean;
    submitError?: string;
  }>({
    isFormValid: false,
    isSubmitting: false,
    submitError: undefined,
  });

  const handleFormSubmit = () => {
    if (formRef.current && formState.isFormValid && !formState.isSubmitting) {
      formRef.current.submit();
    }
  };
  return (
    <>
      {/* Create/Edit Dialog */}
      <Dialog
        open={modalType === "create" || modalType === "edit"}
        onOpenChange={(open) => {
          if (!open) onCloseModal();
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[65vw] max-h-[90vh] flex flex-col !p-0">
          <DialogHeader className="sticky top-0 z-10 bg-card border-b border-border px-4 sm:px-6 py-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <DialogTitle>
                {modalType === "create" ? "Create New Prompt" : "Edit Prompt"}
              </DialogTitle>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCloseModal}
                  disabled={formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFormSubmit}
                  disabled={!formState.isFormValid || formState.isSubmitting}
                  className="min-w-[100px]"
                >
                  {formState.isSubmitting ? (
                    <div className="flex items-center">
                      <Loading size="sm" variant="spinner" />
                      <span className="ml-1">
                        {modalType === "edit" ? "Updating..." : "Creating..."}
                      </span>
                    </div>
                  ) : modalType === "edit" ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <PromptForm
              key={selectedPrompt?.id ?? "create"}
              ref={formRef}
              prompt={selectedPrompt || undefined}
              onSubmit={onSubmitPrompt}
              onFormStateChange={setFormState}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={modalType === "delete"}
        onOpenChange={(open) => {
          if (!open) onCloseModal();
        }}
      >
        <DialogContent className="sm:max-w-lg md:max-w-xl">
          <DialogHeader>
            <DialogTitle>Delete Prompt</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-error-background rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-error-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-card-foreground">
                Delete &ldquo;{selectedPrompt?.title}&rdquo;
              </h3>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseModal}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDeletePrompt}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Import Confirmation Dialog */}
      <Dialog
        open={modalType === "import"}
        onOpenChange={(open) => {
          if (!open) onCloseModal();
        }}
      >
        <DialogContent className="sm:max-w-lg md:max-w-xl">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-light rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-card-foreground">
                Replace existing data?
              </h3>
              <p className="text-sm text-muted-foreground">
                Importing &ldquo;{importPreview?.fileName}&rdquo; will replace
                your {currentPromptCount} current prompt
                {currentPromptCount === 1 ? "" : "s"} with{" "}
                {importPreview?.promptCount ?? 0} prompt
                {(importPreview?.promptCount ?? 0) === 1 ? "" : "s"}. This
                action cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={onExportBackup}
              disabled={isImporting}
              className="sm:mr-auto"
            >
              Export backup first
            </Button>
            <Button
              variant="outline"
              onClick={onCloseModal}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button onClick={onConfirmImport} disabled={isImporting}>
              {isImporting ? (
                <div className="flex items-center">
                  <Loading size="sm" variant="spinner" />
                  <span className="ml-1">Importing...</span>
                </div>
              ) : (
                "Import"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
