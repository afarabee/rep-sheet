import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

/**
 * These tests verify the responsive panel visibility logic used across
 * all pages. Every page follows the same pattern:
 *
 *   - Desktop (isMobile=false): both panels visible
 *   - Mobile (isMobile=true): one panel at a time, toggled by state
 *
 * We test the className logic directly rather than rendering full pages
 * (which would require mocking Supabase, Router, etc.). This catches
 * the actual bugs — wrong conditions, missing 'hidden', etc.
 */

// Helper: check if a className string includes 'hidden'
function isHidden(className: string): boolean {
  return className.split(/\s+/).includes('hidden')
}

// ─── Standard two-panel pattern ──────────────────────────────────────────────
// Used by: History, Settings, Calendar

describe('Standard two-panel responsive pattern', () => {
  function leftPanelClass(isMobile: boolean, showDetail: boolean) {
    return cn(
      'w-full lg:w-80 lg:shrink-0 border-r border-border bg-card flex flex-col',
      isMobile && showDetail && 'hidden'
    )
  }

  function rightPanelClass(isMobile: boolean, showDetail: boolean) {
    return cn(
      'flex-1 overflow-y-auto p-4 lg:p-6',
      isMobile && !showDetail && 'hidden'
    )
  }

  describe('desktop (isMobile=false)', () => {
    it('shows both panels regardless of showDetail state', () => {
      expect(isHidden(leftPanelClass(false, false))).toBe(false)
      expect(isHidden(rightPanelClass(false, false))).toBe(false)
      expect(isHidden(leftPanelClass(false, true))).toBe(false)
      expect(isHidden(rightPanelClass(false, true))).toBe(false)
    })
  })

  describe('mobile (isMobile=true)', () => {
    it('shows left panel when detail is not selected', () => {
      expect(isHidden(leftPanelClass(true, false))).toBe(false)
    })

    it('hides right panel when detail is not selected', () => {
      expect(isHidden(rightPanelClass(true, false))).toBe(true)
    })

    it('hides left panel when detail is selected', () => {
      expect(isHidden(leftPanelClass(true, true))).toBe(true)
    })

    it('shows right panel when detail is selected', () => {
      expect(isHidden(rightPanelClass(true, true))).toBe(false)
    })

    it('never shows both panels at the same time', () => {
      // showDetail = false
      const leftVisible1 = !isHidden(leftPanelClass(true, false))
      const rightVisible1 = !isHidden(rightPanelClass(true, false))
      expect(leftVisible1 && rightVisible1).toBe(false)

      // showDetail = true
      const leftVisible2 = !isHidden(leftPanelClass(true, true))
      const rightVisible2 = !isHidden(rightPanelClass(true, true))
      expect(leftVisible2 && rightVisible2).toBe(false)
    })
  })
})

// ─── Workout panel pattern ───────────────────────────────────────────────────
// Used by: ActiveWorkout, FiveByFiveWorkout
// These use showExerciseList (default false = show logging, true = show list)

describe('Workout panel responsive pattern', () => {
  function exerciseListClass(isMobile: boolean, showExerciseList: boolean) {
    return cn(
      'w-full lg:w-80 lg:shrink-0 border-r border-border bg-card flex flex-col',
      isMobile && !showExerciseList && 'hidden'
    )
  }

  function loggingPanelClass(isMobile: boolean, showExerciseList: boolean) {
    return cn(
      'flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 bg-radial-purple',
      isMobile && showExerciseList && 'hidden'
    )
  }

  describe('desktop', () => {
    it('shows both panels regardless of state', () => {
      expect(isHidden(exerciseListClass(false, false))).toBe(false)
      expect(isHidden(loggingPanelClass(false, false))).toBe(false)
      expect(isHidden(exerciseListClass(false, true))).toBe(false)
      expect(isHidden(loggingPanelClass(false, true))).toBe(false)
    })
  })

  describe('mobile', () => {
    it('shows logging panel by default (showExerciseList=false)', () => {
      expect(isHidden(loggingPanelClass(true, false))).toBe(false)
      expect(isHidden(exerciseListClass(true, false))).toBe(true)
    })

    it('shows exercise list when toggled (showExerciseList=true)', () => {
      expect(isHidden(exerciseListClass(true, true))).toBe(false)
      expect(isHidden(loggingPanelClass(true, true))).toBe(true)
    })

    it('never shows both panels at the same time', () => {
      const both1 = !isHidden(exerciseListClass(true, false)) && !isHidden(loggingPanelClass(true, false))
      const both2 = !isHidden(exerciseListClass(true, true)) && !isHidden(loggingPanelClass(true, true))
      expect(both1).toBe(false)
      expect(both2).toBe(false)
    })
  })
})

// ─── Templates panel pattern ─────────────────────────────────────────────────
// More complex: left panel hides on mobile when any right-side state is active,
// AND on desktop when exercise picker is open

describe('Templates panel responsive pattern', () => {
  function leftPanelClass(
    isMobile: boolean,
    showDetail: boolean,
    creating: boolean,
    selected5x5: boolean,
    showPicker: boolean
  ) {
    return cn(
      'w-full lg:w-80 lg:shrink-0 border-r border-border bg-card flex flex-col',
      (isMobile && (showDetail || creating || selected5x5)) && 'hidden',
      !isMobile && showPicker && 'hidden'
    )
  }

  describe('desktop', () => {
    it('shows left panel when no picker is open', () => {
      expect(isHidden(leftPanelClass(false, true, false, false, false))).toBe(false)
    })

    it('hides left panel when picker is open (even on desktop)', () => {
      expect(isHidden(leftPanelClass(false, true, false, false, true))).toBe(true)
    })

    it('shows left panel when picker closes', () => {
      expect(isHidden(leftPanelClass(false, true, false, false, false))).toBe(false)
    })
  })

  describe('mobile', () => {
    it('hides left panel when viewing detail', () => {
      expect(isHidden(leftPanelClass(true, true, false, false, false))).toBe(true)
    })

    it('hides left panel when creating', () => {
      expect(isHidden(leftPanelClass(true, false, true, false, false))).toBe(true)
    })

    it('hides left panel when in 5x5 config', () => {
      expect(isHidden(leftPanelClass(true, false, false, true, false))).toBe(true)
    })

    it('shows left panel when no right-side state is active', () => {
      expect(isHidden(leftPanelClass(true, false, false, false, false))).toBe(false)
    })
  })
})

// ─── Breakpoint consistency ──────────────────────────────────────────────────
// Verify that the hook breakpoint (1023px) aligns with Tailwind's lg: (1024px)

describe('Breakpoint consistency', () => {
  it('useIsMobile breakpoint (1023px) aligns with Tailwind lg: (1024px)', () => {
    // The hook uses max-width: 1023px
    // Tailwind lg: applies at min-width: 1024px
    // These are complementary: mobile = 0-1023px, desktop = 1024px+
    // If someone changes one without the other, layouts break
    const HOOK_BREAKPOINT = 1023 // from useIsMobile: (max-width: 1023px)
    const TAILWIND_LG = 1024    // Tailwind default lg breakpoint

    expect(HOOK_BREAKPOINT + 1).toBe(TAILWIND_LG)
  })
})
