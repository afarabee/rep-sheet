import { useState, useEffect, useRef } from 'react'
import type { TimerState } from '@/hooks/useExerciseTimer'
import { formatTime } from '@/lib/formatters'

interface TimedExerciseInputProps {
  timerState: TimerState
  timerSeconds: number
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  cancelTimer: () => void
  repsInput: string
  setRepsInput: (v: string) => void
}

function decompose(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return { h, m, s }
}

export default function TimedExerciseInput({
  timerState,
  timerSeconds,
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  cancelTimer,
  repsInput,
  setRepsInput,
}: TimedExerciseInputProps) {
  const [inputMode, setInputMode] = useState<'timer' | 'manual'>('timer')
  const [hoursInput, setHoursInput] = useState('')
  const [minutesInput, setMinutesInput] = useState('')
  const [secondsInput, setSecondsInput] = useState('')
  const internalUpdate = useRef(false)

  useEffect(() => {
    if (inputMode !== 'manual') return
    const h = Math.max(0, parseInt(hoursInput) || 0)
    const m = Math.max(0, Math.min(59, parseInt(minutesInput) || 0))
    const s = Math.max(0, Math.min(59, parseInt(secondsInput) || 0))
    const total = h * 3600 + m * 60 + s
    internalUpdate.current = true
    setRepsInput(String(total))
  }, [hoursInput, minutesInput, secondsInput, inputMode, setRepsInput])

  useEffect(() => {
    if (inputMode !== 'manual') return
    if (internalUpdate.current) {
      internalUpdate.current = false
      return
    }

    const total = parseInt(repsInput) || 0
    const { h, m, s } = decompose(total)
    setHoursInput(h > 0 ? String(h) : '')
    setMinutesInput(m > 0 ? String(m) : '')
    setSecondsInput(s > 0 ? String(s) : '')
  }, [repsInput, inputMode])

  function switchToManual() {
    const seconds = timerState === 'stopped'
      ? parseInt(repsInput) || 0
      : timerSeconds

    if (timerState === 'running' || timerState === 'paused') cancelTimer()

    const { h, m, s } = decompose(seconds)
    setHoursInput(h > 0 ? String(h) : '')
    setMinutesInput(m > 0 ? String(m) : '')
    setSecondsInput(s > 0 ? String(s) : '')
    setRepsInput(String(seconds))
    setInputMode('manual')
  }

  function switchToTimer() {
    setInputMode('timer')
  }

  const pillBase = 'px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all'
  const pillActive = 'bg-[#3D2E5C] text-foreground'
  const pillInactive = 'text-[#8B7FA6] hover:text-foreground'

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[16rem]">
      <div className="flex gap-1 bg-[#1A1028] rounded-xl p-1 self-start">
        <button
          onClick={switchToTimer}
          className={`${pillBase} ${inputMode === 'timer' ? pillActive : pillInactive}`}
        >
          Timer
        </button>
        <button
          onClick={switchToManual}
          className={`${pillBase} ${inputMode === 'manual' ? pillActive : pillInactive}`}
        >
          Manual
        </button>
      </div>

      {inputMode === 'timer' ? (
        <>
          <span
            className="font-display text-4xl sm:text-5xl text-center sm:text-left leading-none break-keep"
            style={{
              color: timerState === 'running' ? '#00E5FF' : timerState === 'paused' ? '#FFD700' : '#B8AECE',
              textShadow: timerState === 'running' ? '0 0 20px rgba(0,229,255,0.4)' : 'none',
            }}
          >
            {formatTime(
              timerState === 'idle' || timerState === 'running' || timerState === 'paused'
                ? timerSeconds
                : parseInt(repsInput) || 0
            )}
          </span>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {timerState === 'idle' && (
              <ActionButton tone="primary" onClick={startTimer}>
                Start
              </ActionButton>
            )}
            {timerState === 'running' && (
              <ActionButton tone="warning" onClick={pauseTimer}>
                Pause
              </ActionButton>
            )}
            {timerState === 'paused' && (
              <ActionButton tone="primary" onClick={resumeTimer}>
                Resume
              </ActionButton>
            )}
            {(timerState === 'running' || timerState === 'paused') && (
              <ActionButton tone="secondary" onClick={stopTimer}>
                Stop
              </ActionButton>
            )}
            {timerState !== 'idle' && (
              <ActionButton tone="danger" onClick={cancelTimer}>
                Cancel
              </ActionButton>
            )}
          </div>

          {timerState === 'stopped' && (
            <div className="flex w-full flex-col gap-2 sm:max-w-[10rem]">
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#B8AECE]">
                Adjust (sec)
              </label>
              <input
                type="number"
                value={repsInput}
                onChange={(e) => setRepsInput(e.target.value)}
                placeholder="-"
                className="h-11 w-full min-w-0 rounded-xl bg-background border-2 border-[#3D2E5C] text-foreground text-lg sm:text-xl font-black text-center weight-number outline-none transition-colors focus:border-[#E91E8C]"
                style={{ caretColor: '#E91E8C' }}
                inputMode="numeric"
              />
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
          <TimeField label="Hours" value={hoursInput} onChange={setHoursInput} step={1} max={99} />
          <TimeField label="Min" value={minutesInput} onChange={setMinutesInput} step={1} max={59} />
          <TimeField label="Sec" value={secondsInput} onChange={setSecondsInput} step={5} max={59} />
        </div>
      )}
    </div>
  )
}

function ActionButton({
  children,
  onClick,
  tone,
}: {
  children: string
  onClick: () => void
  tone: 'primary' | 'warning' | 'secondary' | 'danger'
}) {
  const toneClass = {
    primary: 'bg-[#00E5FF] text-[#0F0A1A] hover:brightness-110',
    warning: 'bg-[#FFD700] text-[#0F0A1A] hover:brightness-110',
    secondary: 'border border-[#3D2E5C] text-[#B8AECE] hover:border-[#8B7FA6] hover:text-foreground',
    danger: 'border border-[#3D2E5C] text-[#FF4D6A] hover:border-[#FF4D6A]',
  }[tone]

  return (
    <button
      onClick={onClick}
      className={`min-h-11 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${toneClass}`}
    >
      {children}
    </button>
  )
}

function TimeField({ label, value, onChange, step, max }: {
  label: string
  value: string
  onChange: (v: string) => void
  step: number
  max: number
}) {
  function adjust(delta: number) {
    const current = parseInt(value) || 0
    const next = Math.max(0, Math.min(max, current + delta))
    onChange(String(next))
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#B8AECE]">
        {label}
      </label>
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-1">
        <button
          onClick={() => adjust(-step)}
          aria-label={`Decrease ${label}`}
          className="h-10 rounded-lg bg-[#241838] border border-[#3D2E5C] text-foreground text-lg font-bold flex items-center justify-center hover:border-[#E91E8C] hover:text-[#E91E8C] transition-colors active:scale-95"
        >
          -
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="h-10 min-w-0 rounded-lg bg-background border-2 border-[#3D2E5C] text-foreground text-base sm:text-lg font-black text-center weight-number outline-none transition-colors focus:border-[#E91E8C]"
          style={{ caretColor: '#E91E8C' }}
          inputMode="numeric"
          min={0}
          max={max}
        />
        <button
          onClick={() => adjust(step)}
          aria-label={`Increase ${label}`}
          className="h-10 rounded-lg bg-[#241838] border border-[#3D2E5C] text-foreground text-lg font-bold flex items-center justify-center hover:border-[#E91E8C] hover:text-[#E91E8C] transition-colors active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  )
}
