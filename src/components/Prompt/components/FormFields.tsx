import React from "react";
import { AlertCircle } from "lucide-react";
import { VALIDATION } from "@/constants";

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  type?: "input" | "textarea";
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  type = "input",
  rows = 3,
  maxLength,
  showCharCount = false,
}) => {
  const InputComponent = type === "textarea" ? "textarea" : "input";

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-card-foreground"
      >
        {label} {required && "*"}
      </label>
      <InputComponent
        id={id}
        type={type === "input" ? "text" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={type === "textarea" ? rows : undefined}
        className={`w-full ${type === "input" ? "h-10" : ""} px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-transparent transition-colors ${
          error ? "border-error-border focus:ring-error-ring" : "border-border"
        }`}
        disabled={disabled}
        required={required}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
        maxLength={maxLength}
      />
      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-error-foreground flex items-center"
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
      {showCharCount && maxLength && (
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxLength} characters
        </p>
      )}
    </div>
  );
};

export const TitleField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}> = ({ value, onChange, error, disabled }) => (
  <FormField
    id="title"
    label="Title"
    value={value}
    onChange={onChange}
    placeholder="Enter prompt title..."
    error={error}
    disabled={disabled}
    required
    maxLength={VALIDATION.TITLE.MAX_LENGTH}
    showCharCount
  />
);

export const ContentField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}> = ({ value, onChange, error, disabled }) => (
  <FormField
    id="content"
    label="Content"
    value={value}
    onChange={onChange}
    placeholder="Enter your prompt content here..."
    error={error}
    disabled={disabled}
    required
    type="textarea"
    rows={12}
  />
);
