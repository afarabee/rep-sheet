import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test explosion')
  return <p>All good</p>
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <p>Hello</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('Hello')).toBeDefined()
  })

  it('renders fallback UI when a child throws', () => {
    // Suppress React error boundary console noise
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/something went wrong/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /try again/i })).toBeDefined()

    spy.mockRestore()
  })

  it('resets error state when Try Again is clicked', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    let shouldThrow = true
    function MaybeThrow() {
      if (shouldThrow) throw new Error('boom')
      return <p>Recovered</p>
    }

    render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/something went wrong/i)).toBeDefined()

    // Stop throwing before clicking retry
    shouldThrow = false
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    expect(screen.getByText('Recovered')).toBeDefined()

    spy.mockRestore()
  })
})
