import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { PromptFormProps } from "@/types";
import { usePromptForm } from "./hooks/usePromptForm";
import { TitleField, ContentField } from "./components/FormFields";
import { TagsInput } from "./components/TagsInput";
import { usePrompts } from "@/contexts/PromptContext";
import { getAllTags } from "@/utils/helpers";
import { AlertCircle } from "lucide-react";

export interface PromptFormRef {
  submit: () => void;
}

interface ExtendedPromptFormProps extends PromptFormProps {
  onFormStateChange?: (state: {
    isFormValid: boolean;
    isSubmitting: boolean;
    submitError?: string;
  }) => void;
}

const PromptForm = forwardRef<PromptFormRef, ExtendedPromptFormProps>(
  ({ prompt, onSubmit, isLoading = false, onFormStateChange }, ref) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { prompts } = usePrompts();
    const formRef = useRef<HTMLFormElement>(null);
    const {
      formData,
      setFormData,
      errors,
      handleInputChange,
      validateForm,
      setError,
      isFormValid,
    } = usePromptForm(
      prompt
        ? {
            title: prompt.title,
            content: prompt.content,
            description: prompt.description,
            tags: [...prompt.tags],
          }
        : undefined
    );

    // Calculate available tags from all prompts
    const availableTags = useMemo(() => {
      return getAllTags(prompts);
    }, [prompts]);

    const handleTagsChange = (tags: string[]) => {
      setFormData((prev) => ({ ...prev, tags }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (isSubmitting) return;

      setIsSubmitting(true);

      try {
        if (!validateForm()) {
          return;
        }

        await onSubmit(formData);
      } catch (error) {
        console.error("Form submission error:", error);
        setError("submit", "Failed to save prompt. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

    // Communicate form state changes to parent
    useEffect(() => {
      if (onFormStateChange) {
        onFormStateChange({
          isFormValid,
          isSubmitting,
          submitError: errors.submit,
        });
      }
    }, [isFormValid, isSubmitting, errors.submit, onFormStateChange]);

    // Expose form submission method to parent
    useImperativeHandle(
      ref,
      () => ({
        submit: () => {
          if (formRef.current) {
            formRef.current.requestSubmit();
          }
        },
      }),
      []
    );

    return (
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="px-3 sm:px-6 pt-3 pb-4 sm:pt-4 sm:pb-6 space-y-3"
        noValidate
      >
        {/* Security notice — prompts are stored unencrypted in localStorage */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-xs leading-relaxed">
            Prompts are saved in your browser&apos;s local storage in plain
            text.{" "}
            <strong>Do not store API keys, passwords, or other secrets</strong>{" "}
            in prompt content.
          </p>
        </div>
        <TitleField
          value={formData.title}
          onChange={(value) => handleInputChange("title", value)}
          error={errors.title}
          disabled={isLoading || isSubmitting}
        />

        <ContentField
          value={formData.content}
          onChange={(value) => handleInputChange("content", value)}
          error={errors.content}
          disabled={isLoading || isSubmitting}
        />

        <TagsInput
          tags={formData.tags}
          onTagsChange={handleTagsChange}
          availableTags={availableTags}
          error={errors.tags}
          disabled={isLoading || isSubmitting}
        />

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-error-background border border-error-border rounded-lg">
            <p className="text-sm text-error-foreground flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.submit}
            </p>
          </div>
        )}
      </form>
    );
  }
);

PromptForm.displayName = "PromptForm";

export default PromptForm;
