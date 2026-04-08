import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import TimedExerciseInput from './TimedExerciseInput'
import type { TimerState } from '@/hooks/useExerciseTimer'

function renderComponent(overrides: Partial<{
  timerState: TimerState
  timerSeconds: number
  repsInput: string
  setRepsInput: (v: string) => void
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  cancelTimer: () => void
}> = {}) {
  const props = {
    timerState: 'idle' as TimerState,
    timerSeconds: 0,
    startTimer: vi.fn(),
    pauseTimer: vi.fn(),
    resumeTimer: vi.fn(),
    stopTimer: vi.fn(),
    cancelTimer: vi.fn(),
    repsInput: '',
    setRepsInput: vi.fn(),
    ...overrides,
  }
  return { ...render(<TimedExerciseInput {...props} />), props }
}

// ─── Mode Toggle ─────────────────────────────────────────────────────────────

describe('TimedExerciseInput mode toggle', () => {
  it('renders Timer and Manual buttons', () => {
    renderComponent()
    expect(screen.getByText('Timer')).toBeDefined()
    expect(screen.getByText('Manual')).toBeDefined()
  })

  it('shows timer display by default', () => {
    renderComponent()
    // Timer mode shows Start button when idle
    expect(screen.getByText('Start')).toBeDefined()
  })

  it('switches to manual mode and shows H/M/S fields', () => {
    renderComponent()
    fireEvent.click(screen.getByText('Manual'))
    expect(screen.getByText('Hours')).toBeDefined()
    expect(screen.getByText('Min')).toBeDefined()
    expect(screen.getByText('Sec')).toBeDefined()
  })

  it('hides timer controls in manual mode', () => {
    renderComponent()
    fireEvent.click(screen.getByText('Manual'))
    expect(screen.queryByText('Start')).toBeNull()
  })

  it('switches back to timer mode', () => {
    renderComponent()
    fireEvent.click(screen.getByText('Manual'))
    fireEvent.click(screen.getByText('Timer'))
    expect(screen.getByText('Start')).toBeDefined()
    expect(screen.queryByText('Hours')).toBeNull()
  })
})

// ─── Timer Mode ──────────────────────────────────────────────────────────────

describe('TimedExerciseInput timer mode', () => {
  it('shows Start button when idle', () => {
    renderComponent({ timerState: 'idle' })
    expect(screen.getByText('Start')).toBeDefined()
  })

  it('shows Pause and Stop when running', () => {
    renderComponent({ timerState: 'running', timerSeconds: 10 })
    expect(screen.getByText('Pause')).toBeDefined()
    expect(screen.getByText('Stop')).toBeDefined()
  })

  it('shows Resume and Stop when paused', () => {
    renderComponent({ timerState: 'paused', timerSeconds: 10 })
    expect(screen.getByText('Resume')).toBeDefined()
    expect(screen.getByText('Stop')).toBeDefined()
  })

  it('shows Cancel when not idle', () => {
    renderComponent({ timerState: 'running', timerSeconds: 5 })
    expect(screen.getByText('Cancel')).toBeDefined()
  })

  it('calls startTimer when Start is clicked', () => {
    const { props } = renderComponent({ timerState: 'idle' })
    fireEvent.click(screen.getByText('Start'))
    expect(props.startTimer).toHaveBeenCalled()
  })

  it('calls pauseTimer when Pause is clicked', () => {
    const { props } = renderComponent({ timerState: 'running', timerSeconds: 5 })
    fireEvent.click(screen.getByText('Pause'))
    expect(props.pauseTimer).toHaveBeenCalled()
  })

  it('calls stopTimer when Stop is clicked', () => {
    const { props } = renderComponent({ timerState: 'running', timerSeconds: 5 })
    fireEvent.click(screen.getByText('Stop'))
    expect(props.stopTimer).toHaveBeenCalled()
  })

  it('shows adjust input when stopped', () => {
    renderComponent({ timerState: 'stopped', repsInput: '60' })
    expect(screen.getByText('Adjust (sec)')).toBeDefined()
  })
})

// ─── Manual Mode ─────────────────────────────────────────────────────────────

describe('TimedExerciseInput manual mode', () => {
  it('calls setRepsInput with total seconds when manual fields change', () => {
    const setRepsInput = vi.fn()
    renderComponent({ setRepsInput })
    fireEvent.click(screen.getByText('Manual'))

    // Find the seconds input (3rd number input) and type a value
    const inputs = screen.getAllByRole('spinbutton')
    // inputs: [Hours, Min, Sec]
    fireEvent.change(inputs[2], { target: { value: '30' } })

    // setRepsInput should be called with '30' (0h 0m 30s = 30 total seconds)
    expect(setRepsInput).toHaveBeenCalledWith('30')
  })

  it('computes total seconds from hours, minutes, and seconds', () => {
    const setRepsInput = vi.fn()
    renderComponent({ setRepsInput })
    fireEvent.click(screen.getByText('Manual'))

    const inputs = screen.getAllByRole('spinbutton')
    // Set 1 hour, 30 minutes, 45 seconds = 5445 total
    fireEvent.change(inputs[0], { target: { value: '1' } })
    fireEvent.change(inputs[1], { target: { value: '30' } })
    fireEvent.change(inputs[2], { target: { value: '45' } })

    expect(setRepsInput).toHaveBeenCalledWith('5445')
  })

  it('cancels running timer when switching to manual', () => {
    const { props } = renderComponent({ timerState: 'running', timerSeconds: 45 })
    fireEvent.click(screen.getByText('Manual'))
    expect(props.cancelTimer).toHaveBeenCalled()
  })

  it('decomposes timer seconds into H/M/S fields when switching from running timer', () => {
    renderComponent({ timerState: 'running', timerSeconds: 150 })
    fireEvent.click(screen.getByText('Manual'))

    const inputs = screen.getAllByRole('spinbutton')
    // 150 seconds = 0h 2m 30s
    expect(inputs[0]).toHaveValue(null) // hours empty (0)
    expect(inputs[1]).toHaveValue(2)    // minutes
    expect(inputs[2]).toHaveValue(30)   // seconds
  })

  it('clamps minutes to 0-59 via +/- buttons', () => {
    const setRepsInput = vi.fn()
    renderComponent({ setRepsInput })
    fireEvent.click(screen.getByText('Manual'))

    const inputs = screen.getAllByRole('spinbutton')
    // Set minutes to 59 manually
    fireEvent.change(inputs[1], { target: { value: '59' } })

    // Click the + button for minutes (Increase Min)
    fireEvent.click(screen.getByLabelText('Increase Min'))

    // Should stay at 59 (clamped)
    expect(inputs[1]).toHaveValue(59)
  })
})
