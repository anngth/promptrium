import { useState, useCallback } from "react";
import { PromptFormData } from "@/types";
import { VALIDATION, ERROR_MESSAGES } from "@/constants";
import { validatePrompt } from "@/utils/helpers";

export const usePromptForm = (initialData?: PromptFormData) => {
  const [formData, setFormData] = useState<PromptFormData>(
    initialData || {
      title: "",
      content: "",
      description: "",
      tags: [],
    }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = useCallback(
    (field: keyof PromptFormData, value: string | string[]) => {
      const fieldErrors: { [key: string]: string } = {};

      if (field === "title") {
        const trimmedValue = (value as string).trim();
        if (!trimmedValue) {
          fieldErrors.title = ERROR_MESSAGES.VALIDATION.TITLE_REQUIRED;
        } else if (trimmedValue.length < VALIDATION.TITLE.MIN_LENGTH) {
          fieldErrors.title = ERROR_MESSAGES.VALIDATION.TITLE_TOO_SHORT;
        } else if (trimmedValue.length > VALIDATION.TITLE.MAX_LENGTH) {
          fieldErrors.title = ERROR_MESSAGES.VALIDATION.TITLE_TOO_LONG;
        }
      }

      if (field === "content") {
        const trimmedValue = (value as string).trim();
        if (!trimmedValue) {
          fieldErrors.content = ERROR_MESSAGES.VALIDATION.CONTENT_REQUIRED;
        } else if (trimmedValue.length < VALIDATION.CONTENT.MIN_LENGTH) {
          fieldErrors.content = ERROR_MESSAGES.VALIDATION.CONTENT_TOO_SHORT;
        }
      }

      if (field === "description") {
        const trimmedValue = (value as string).trim();
        if (
          trimmedValue &&
          trimmedValue.length > VALIDATION.DESCRIPTION.MAX_LENGTH
        ) {
          fieldErrors.description =
            ERROR_MESSAGES.VALIDATION.DESCRIPTION_TOO_LONG;
        }
      }

      if (field === "tags") {
        const tags = value as string[];
        if (tags.length > VALIDATION.TAGS.MAX_COUNT) {
          fieldErrors.tags = ERROR_MESSAGES.VALIDATION.TAGS_TOO_MANY;
        } else {
          for (const tag of tags) {
            if (tag.trim().length > VALIDATION.TAGS.MAX_LENGTH) {
              fieldErrors.tags = ERROR_MESSAGES.VALIDATION.TAGS_TOO_LONG;
              break;
            }
          }
        }
      }

      return fieldErrors;
    },
    []
  );

  const handleInputChange = (
    field: keyof PromptFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field-specific error and submit error when user starts typing
    // and perform real-time validation in a single state update
    setErrors((prev) => {
      const newErrors = { ...prev };

      // Clear the specific field error
      if (newErrors[field]) {
        newErrors[field] = "";
      }

      // Clear submit error to allow resubmission
      if (newErrors.submit) {
        newErrors.submit = "";
      }

      // Real-time validation for all fields
      const fieldErrors = validateField(field, value);
      return { ...newErrors, ...fieldErrors };
    });
  };

  const validateForm = () => {
    const validation = validatePrompt(formData);

    if (!validation.isValid) {
      const fieldErrors: { [key: string]: string } = {};

      // Map error messages to field names using a lookup approach
      const errorFieldMap: { [key: string]: string } = {
        Title: "title",
        Content: "content",
        Description: "description",
        Tag: "tags",
      };

      validation.errors.forEach((error) => {
        // Find the first matching field keyword in the error message
        for (const [keyword, fieldName] of Object.entries(errorFieldMap)) {
          if (error.includes(keyword)) {
            fieldErrors[fieldName] = error;
            break; // Only assign to the first matching field
          }
        }
      });

      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const setError = (field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearErrors = () => setErrors({});

  const hasErrors = Object.entries(errors).some(
    ([key, value]) => key !== "submit" && !!value
  );

  const isFormValid = !!(
    formData.title.trim() &&
    formData.content.trim() &&
    !hasErrors
  );

  return {
    formData,
    setFormData,
    errors,
    handleInputChange,
    validateForm,
    setError,
    clearErrors,
    isFormValid,
    hasErrors,
  };
};
