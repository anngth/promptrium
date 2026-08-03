"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Types
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  resetKeys?: readonly unknown[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// Constants
const ERROR_MESSAGES = {
  title: "Something went wrong",
  description:
    "We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.",
  errorDetails: "Error details",
  tryAgain: "Try Again",
  refreshPage: "Refresh Page",
} as const;

// Error Display Component
const ErrorDisplay: React.FC<{
  error?: Error;
  onReset: () => void;
}> = ({ error, onReset }) => {
  const showErrorDetails = process.env.NODE_ENV !== "production";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-error-background rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-error-foreground" />
        </div>

        {/* Error Title */}
        <h2 className="text-xl font-semibold text-card-foreground mb-2">
          {ERROR_MESSAGES.title}
        </h2>

        {/* Error Description */}
        <p className="text-muted-foreground mb-6">
          {ERROR_MESSAGES.description}
        </p>

        {/* Error Details — hidden in production */}
        {showErrorDetails && error && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              {ERROR_MESSAGES.errorDetails}
            </summary>
            <pre className="mt-2 text-xs text-error-foreground bg-error-background p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={onReset} className="w-full" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            {ERROR_MESSAGES.tryAgain}
          </Button>

          <Button onClick={() => window.location.reload()} className="w-full">
            {ERROR_MESSAGES.refreshPage}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Error Boundary Component
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError) {
      this.checkResetKeys(prevProps);
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  // Private methods
  private checkResetKeys = (prevProps: ErrorBoundaryProps): void => {
    const prevResetKeys = prevProps.resetKeys || [];
    const currentResetKeys = this.props.resetKeys || [];

    const shouldReset =
      prevResetKeys.length !== currentResetKeys.length ||
      prevResetKeys.some((key, index) => key !== currentResetKeys[index]);

    if (shouldReset) {
      this.resetErrorState();
    }
  };

  private resetErrorState = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  // Public methods
  public handleReset = (): void => {
    this.resetErrorState();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render default error display
      return (
        <ErrorDisplay error={this.state.error} onReset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
