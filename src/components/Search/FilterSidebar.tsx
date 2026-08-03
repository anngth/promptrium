import React, { useMemo } from "react";
import { Tag } from "lucide-react";
import { Prompt } from "@/types";

interface FilterSidebarProps {
  availableTags: string[];
  selectedTags: string[];
  prompts: Prompt[];
  onTagsChange: (tags: string[]) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  availableTags,
  selectedTags,
  prompts,
  onTagsChange,
}) => {
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  // Count prompts per tag
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach((prompt) => {
      prompt.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [prompts]);

  const getTagCount = (tag: string) => {
    return tagCounts[tag] || 0;
  };

  return (
    <aside className="w-64 bg-card border border-border p-4 rounded-lg sticky top-4 flex flex-col max-h-[calc(100vh-6rem)]">
      <h2 className="text-lg font-semibold mb-4 text-card-foreground flex-shrink-0">
        Tags
      </h2>

      <div className="space-y-0.5 overflow-y-auto flex-1 pr-2 scrollbar-custom min-h-0">
        {availableTags.length > 0 ? (
          availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            const count = getTagCount(tag);

            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-background text-blue-foreground border border-blue-border"
                    : "text-muted-foreground hover:bg-hover border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm">{tag}</span>
                </div>
                {count > 0 && (
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Tag className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              No tags available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Create prompts with tags to see them here
            </p>
          </div>
        )}
      </div>

      {selectedTags.length > 0 && (
        <button
          onClick={() => onTagsChange([])}
          className="w-full mt-4 px-4 py-2 text-sm text-blue-accent hover:text-blue-accent-hover hover:bg-hover rounded-lg transition-colors flex-shrink-0"
        >
          Clear all filters
        </button>
      )}
    </aside>
  );
};
