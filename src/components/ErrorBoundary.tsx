"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Minimal client error boundary. Used around the risky/isolated parts of the
 * public page (3D hero, portal preview, estimator, admin link) so a single
 * component failure degrades to a fallback instead of blanking the page.
 */
type Props = { children: ReactNode; fallback: ReactNode; name?: string };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[${this.props.name ?? "ErrorBoundary"}]`, error, info.componentStack ?? "");
    }
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
