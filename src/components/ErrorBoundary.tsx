import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
          <h2 className="text-xl font-display uppercase tracking-widest text-[#FF4D6A]">
            Something went wrong
          </h2>
          <p className="text-sm text-[#8B7FA6] max-w-md">
            An unexpected error occurred. Try reloading the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] text-sm font-bold uppercase tracking-wider hover:bg-[#00E5FF]/20 transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
