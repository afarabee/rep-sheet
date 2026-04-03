import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Track listeners so we can simulate resize events
let mediaQueryListeners: Array<(e: MediaQueryListEvent) => void> = []
let currentMatches = false

function mockMatchMedia(matches: boolean) {
  currentMatches = matches
  mediaQueryListeners = []
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: currentMatches,
      media: query,
      addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
        mediaQueryListeners.push(handler)
      },
      removeEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
        mediaQueryListeners = mediaQueryListeners.filter((h) => h !== handler)
      },
    })),
  })
}

function simulateResize(matches: boolean) {
  currentMatches = matches
  mediaQueryListeners.forEach((handler) =>
    handler({ matches } as MediaQueryListEvent)
  )
}

// Re-import the hook fresh for each test to avoid stale matchMedia refs
async function importHook() {
  const mod = await import('./useIsMobile')
  return mod.useIsMobile
}

describe('useIsMobile', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when viewport is below 1024px (mobile)', async () => {
    mockMatchMedia(true)
    const useIsMobile = await importHook()
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('returns false when viewport is 1024px or wider (desktop)', async () => {
    mockMatchMedia(false)
    const useIsMobile = await importHook()
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('updates when viewport crosses the 1024px threshold (desktop → mobile)', async () => {
    mockMatchMedia(false) // start at desktop
    const useIsMobile = await importHook()
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => simulateResize(true)) // shrink to mobile
    expect(result.current).toBe(true)
  })

  it('updates when viewport crosses the 1024px threshold (mobile → desktop)', async () => {
    mockMatchMedia(true) // start at mobile
    const useIsMobile = await importHook()
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)

    act(() => simulateResize(false)) // expand to desktop
    expect(result.current).toBe(false)
  })

  it('cleans up listener on unmount', async () => {
    mockMatchMedia(false)
    const useIsMobile = await importHook()
    const { unmount } = renderHook(() => useIsMobile())
    expect(mediaQueryListeners.length).toBe(1)

    unmount()
    expect(mediaQueryListeners.length).toBe(0)
  })

  // ─── Breakpoint boundary tests ─────────────────────────────────────────

  it('treats exactly 1023px as mobile', async () => {
    // The media query is (max-width: 1023px), so 1023px matches = mobile
    mockMatchMedia(true)
    const useIsMobile = await importHook()
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('treats exactly 1024px as desktop', async () => {
    // At 1024px, (max-width: 1023px) does NOT match = desktop
    mockMatchMedia(false)
    const useIsMobile = await importHook()
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })
})
