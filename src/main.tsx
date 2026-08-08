import React, { Component, type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      staleTime: 15_000,
      refetchOnWindowFocus: false,
    },
  },
});

interface RootProps {
  children: ReactNode;
}
interface RootState {
  hasError: boolean;
  error?: Error;
}

class RootBoundary extends Component<RootProps, RootState> {
  state: RootState = { hasError: false };
  static getDerivedStateFromError(error: Error): RootState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    console.error("Root crash:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-space-bg p-6">
          <div className="glass-panel p-6 max-w-lg text-center">
            <div className="text-sm text-status-critical font-semibold mb-2">Application Error</div>
            <pre className="text-xs text-slate-400 text-left whitespace-pre-wrap break-words mt-2">
              {this.state.error?.message}
              {"\n\n"}
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </RootBoundary>
  </React.StrictMode>
);
