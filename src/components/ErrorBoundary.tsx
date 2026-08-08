import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="w-full h-full flex items-center justify-center text-center p-6">
            <div>
              <div className="text-xs text-slate-500 tracking-widest uppercase mb-2">3D Scene Unavailable</div>
              <div className="text-sm text-slate-400">Telemetry data is still live below.</div>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
