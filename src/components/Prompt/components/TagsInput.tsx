import React, { useState, useCallback, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, AlertCircle } from "lucide-react";
import { VALIDATION, ERROR_MESSAGES } from "@/constants";

interface TagsInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags?: string[];
  error?: string;
  disabled?: boolean;
}

export const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  onTagsChange,
  availableTags = [],
  error,
  disabled = false,
}) => {
  const [newTag, setNewTag] = useState("");
  const [tagError, setTagError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate unique IDs to prevent conflicts when multiple instances exist
  const baseId = useId();
  const inputId = `tags-${baseId}`;
  const errorId = `tags-error-${baseId}`;
  const helpId = `tags-help-${baseId}`;

  // Reusable scroll function
  const scrollToContainer = useCallback(
    (block: ScrollLogicalPosition = "nearest") => {
      if (containerRef.current) {
        const scrollableParent =
          containerRef.current.closest(".overflow-y-auto");
        if (scrollableParent) {
          containerRef.current.scrollIntoView({
            behavior: "smooth",
            block,
          });
        }
      }
    },
    []
  );

  const scrollToEndAfterRender = useCallback(() => {
    requestAnimationFrame(() => scrollToContainer("end"));
  }, [scrollToContainer]);

  const handleAddTag = useCallback(() => {
    const tag = newTag.trim();
    if (!tag) return;

    if (tag.length > VALIDATION.TAGS.MAX_LENGTH) {
      setTagError(ERROR_MESSAGES.VALIDATION.TAGS_TOO_LONG);
      return;
    }

    if (tags.length >= VALIDATION.TAGS.MAX_COUNT) {
      setTagError(ERROR_MESSAGES.VALIDATION.TAGS_TOO_MANY);
      return;
    }

    if (!tags.includes(tag)) {
      onTagsChange([...tags, tag]);
      setTagError("");
      scrollToEndAfterRender();
      setNewTag("");
    }
  }, [newTag, tags, onTagsChange, scrollToEndAfterRender]);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      onTagsChange(tags.filter((tag) => tag !== tagToRemove));
    },
    [tags, onTagsChange]
  );

  const handleSelectAvailableTag = useCallback(
    (tagToAdd: string) => {
      if (tags.length >= VALIDATION.TAGS.MAX_COUNT) {
        setTagError(ERROR_MESSAGES.VALIDATION.TAGS_TOO_MANY);
        return;
      }
      if (!tags.includes(tagToAdd)) {
        onTagsChange([...tags, tagToAdd]);
        setNewTag("");
        setTagError("");
        scrollToEndAfterRender();
      }
    },
    [tags, onTagsChange, scrollToEndAfterRender]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        // Calculate suggestions on the fly for exact match check
        const currentSuggestions = availableTags.filter(
          (tag) =>
            !tags.includes(tag) &&
            tag.toLowerCase().includes(newTag.toLowerCase()) &&
            newTag.trim().length > 0
        );

        // If there's a matching suggestion, use the exact match
        if (currentSuggestions.length > 0 && newTag.trim().length > 0) {
          const exactMatch = currentSuggestions.find(
            (tag) => tag.toLowerCase() === newTag.toLowerCase()
          );
          if (exactMatch) {
            handleSelectAvailableTag(exactMatch);
            setShowSuggestions(false);
            return;
          }
        }
        handleAddTag();
        setShowSuggestions(false);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [handleAddTag, availableTags, tags, newTag, handleSelectAvailableTag]
  );

  const handleInputFocus = useCallback(() => {
    if (newTag.trim().length > 0) {
      setShowSuggestions(true);
    }
    scrollToContainer("nearest");
  }, [newTag, scrollToContainer]);

  const handleInputBlur = useCallback(() => {
    // Delay hiding suggestions to allow clicks on suggestion items
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  // Helper function to highlight matched text accurately
  const highlightMatch = (text: string, query: string) => {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);

    if (matchIndex === -1) {
      return { before: text, match: "", after: "" };
    }

    return {
      before: text.substring(0, matchIndex),
      match: text.substring(matchIndex, matchIndex + query.length),
      after: text.substring(matchIndex + query.length),
    };
  };

  // Filter available tags based on input for display
  const suggestedTags = availableTags
    .filter(
      (tag) =>
        !tags.includes(tag) && // Not already selected
        tag.toLowerCase().includes(newTag.toLowerCase()) && // Matches input
        newTag.trim().length > 0 // Only show when user is typing
    )
    .slice(0, 5); // Limit to 5 suggestions

  const displayError = error || tagError;

  return (
    <div ref={containerRef} className="space-y-1">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-card-foreground"
      >
        Tags
      </label>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 text-sm bg-blue-tag-bg text-blue-tag-text rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 hover:text-blue-tag-hover focus:outline-none focus:ring-2 focus:ring-blue-primary rounded"
                disabled={disabled}
                aria-label={`Remove tag: ${tag}`}
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex space-x-2">
        <input
          id={inputId}
          type="text"
          value={newTag}
          onChange={(e) => {
            setNewTag(e.target.value);
            setTagError("");
            setShowSuggestions(e.target.value.trim().length > 0);
          }}
          onKeyDown={handleKeyPress}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Add a tag..."
          className={`flex-1 h-10 px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-transparent transition-colors ${
            displayError
              ? "border-error-border focus:ring-error-ring"
              : "border-border"
          }`}
          disabled={disabled}
          aria-describedby={displayError ? errorId : helpId}
          maxLength={VALIDATION.TAGS.MAX_LENGTH}
        />
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={handleAddTag}
          disabled={!newTag.trim() || disabled}
          aria-label="Add tag"
          className="px-3"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Tag Suggestions Dropdown */}
      {showSuggestions && suggestedTags.length > 0 && (
        <div className="relative z-10">
          <div className="absolute top-0 left-0 w-full bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {suggestedTags.map((tag) => {
              const highlight = highlightMatch(tag, newTag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    handleSelectAvailableTag(tag);
                    setNewTag("");
                    setShowSuggestions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-blue-light focus:bg-blue-light focus:outline-none border-b border-border last:border-b-0"
                  disabled={disabled}
                >
                  <span className="text-foreground">{highlight.before}</span>
                  <span className="text-blue-foreground font-medium">
                    {highlight.match}
                  </span>
                  <span className="text-foreground">{highlight.after}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Tags */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Available tags (click to add):
          </p>
          <div className="flex flex-wrap gap-2">
            {availableTags
              .filter((tag) => !tags.includes(tag)) // Only show tags not already selected
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSelectAvailableTag(tag)}
                  disabled={
                    disabled || tags.length >= VALIDATION.TAGS.MAX_COUNT
                  }
                  className="inline-flex items-center px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full hover:bg-blue-light hover:text-blue-foreground focus:outline-none focus:ring-2 focus:ring-blue-primary focus:bg-blue-light focus:text-blue-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Add tag: ${tag}`}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {tag}
                </button>
              ))}
          </div>
        </div>
      )}

      {displayError && (
        <p
          id={errorId}
          className="text-sm text-error-foreground flex items-center"
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          {displayError}
        </p>
      )}

      <p id={helpId} className="text-xs text-muted-foreground">
        Press Enter or comma to add a tag. Click existing tags below or the X to
        remove. Maximum {VALIDATION.TAGS.MAX_COUNT} tags.
      </p>
    </div>
  );
};
