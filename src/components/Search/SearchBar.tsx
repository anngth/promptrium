import React, { useState, useRef, useEffect } from "react";
import { SearchBarProps } from "@/types";
import { Search, X } from "lucide-react";

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search prompts...",
  className = "",
}) => {
  // localValue drives the visible input — updated instantly on every keystroke.
  // prevParentValue lets us detect when the *parent* resets `value` externally
  // (e.g. "clear all filters") so we can mirror that reset locally.
  // Both are plain useState — no refs, no effects — following React's
  // "derived state during render" pattern (same technique as getDerivedStateFromProps).
  const [localValue, setLocalValue] = useState(value);
  const [prevParentValue, setPrevParentValue] = useState(value);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup: cancel any pending debounce when the component unmounts so we
  // never call onChange on an unmounted parent. This effect only touches the
  // timer ref — it never calls setState — so it does not violate
  // react-hooks/no-set-state-in-effect.
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // When the parent changes `value` externally, sync local state during render.
  // This is safe: React re-renders immediately with the corrected state.
  if (value !== prevParentValue) {
    setPrevParentValue(value);
    setLocalValue(value);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue); // instant — no lag while typing

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onChange(newValue); // debounced propagation to parent / filter logic
    }, 300);
  };

  const handleClear = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setLocalValue("");
    onChange("");
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-icon" />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="block w-full h-10 pl-10 pr-10 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
