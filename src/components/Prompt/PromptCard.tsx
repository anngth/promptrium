"use client";

import React, { useState, useRef, useEffect } from "react";
import { Prompt } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePromptCard } from "./hooks/usePromptCard";
import { PromptCardActions } from "./components/PromptCardActions";
import { PromptCardTags } from "./components/PromptCardTags";

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onCopy: (prompt: Prompt) => void;
  onToggleFavorite: (prompt: Prompt) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onEdit,
  onDelete,
  onCopy,
  onToggleFavorite,
}) => {
  const { copied, handleCopy } = usePromptCard({
    prompt,
    onCopy,
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const [showGradient, setShowGradient] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const isScrollable = scrollHeight > clientHeight;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 1;
        setShowGradient(isScrollable && !isAtBottom);
      }
    };

    checkScroll();
    const element = contentRef.current;
    if (element) {
      element.addEventListener("scroll", checkScroll);
      return () => element.removeEventListener("scroll", checkScroll);
    }
  }, [prompt.content, prompt.description]);

  return (
    <TooltipProvider>
      <div className="bg-card border border-border rounded-lg transition-all duration-200 h-full flex flex-col p-4">
        <div className="mb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 cursor-pointer">
                {prompt.title}
              </h3>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{prompt.title}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div
          ref={contentRef}
          className="overflow-y-auto max-h-[168px] scrollbar-custom relative pr-2 mb-3"
        >
          <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">
            {prompt.content}
          </p>
          {prompt.description && (
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
              {prompt.description}
            </p>
          )}
          {/* Gradient fade indicator at bottom - only show when scrollable and not at bottom */}
          {showGradient && (
            <div className="sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none -mt-8"></div>
          )}
        </div>

        <div className="mt-auto space-y-3">
          <PromptCardTags tags={prompt.tags} className="" />

          <PromptCardActions
            prompt={prompt}
            copied={copied}
            onCopy={handleCopy}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
            variant="grid"
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

PromptCard.displayName = "PromptCard";

export default React.memo(PromptCard);
