import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SortKey } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
} from "lucide-react";

interface HeaderFiltersProps {
  sortBy: SortKey;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: SortKey, sortOrder: "asc" | "desc") => void;
}

const HeaderFilters: React.FC<HeaderFiltersProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSortChange = (newSortBy: SortKey) => {
    if (sortBy === newSortBy) {
      onSortChange(newSortBy, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(newSortBy, "desc");
    }
  };

  const handleDropdownSortChange = (value: string) => {
    const sortKey = value as SortKey;
    handleSortChange(sortKey);
  };

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "updated", label: "Last Updated" },
    { key: "created", label: "Created Date" },
  ];

  const getSortIcon = (optionKey: SortKey) => {
    if (sortBy !== optionKey) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="default"
          className="border border-border hover:bg-hover transition-all duration-200"
        >
          <Filter className="w-5 h-5 mr-2" />
          Sort
          <ChevronDown
            className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuRadioGroup
          value={sortBy}
          onValueChange={handleDropdownSortChange}
        >
          {sortOptions.map((option) => (
            <DropdownMenuRadioItem
              key={option.key}
              value={option.key}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {getSortIcon(option.key)}
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderFilters;
