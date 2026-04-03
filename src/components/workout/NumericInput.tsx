interface NumericInputProps {
  label: string
  value: string
  onChange: (v: string) => void
  step: number
  placeholder?: string
}

export default function NumericInput({ label, value, onChange, step, placeholder }: NumericInputProps) {
  function adjust(delta: number) {
    const current = parseFloat(value) || 0
    const next = Math.max(0, current + delta)
    onChange(step % 1 === 0 ? String(next) : next.toFixed(1))
  }

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#B8AECE]">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => adjust(-step)}
          aria-label={`Decrease ${label}`}
          className="w-10 h-11 rounded-xl bg-[#241838] border border-[#3D2E5C] text-foreground text-xl font-bold flex items-center justify-center hover:border-[#E91E8C] hover:text-[#E91E8C] transition-colors active:scale-95"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-24 h-11 rounded-xl bg-background border-2 border-[#3D2E5C] text-foreground text-xl font-black text-center weight-number outline-none transition-colors focus:border-[#E91E8C]"
          style={{ caretColor: '#E91E8C' }}
          inputMode="decimal"
        />
        <button
          onClick={() => adjust(step)}
          aria-label={`Increase ${label}`}
          className="w-10 h-11 rounded-xl bg-[#241838] border border-[#3D2E5C] text-foreground text-xl font-bold flex items-center justify-center hover:border-[#E91E8C] hover:text-[#E91E8C] transition-colors active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  )
}
