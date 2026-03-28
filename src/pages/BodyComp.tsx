import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useBodyComp, type BodyCompEntry } from '@/hooks/useBodyComp'
import { Trash2, Loader2, Key, Camera, ScanLine, Activity, PenLine } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmt(val: number | null | undefined, decimals = 1): string {
  if (val == null) return '—'
  return val.toFixed(decimals)
}

function sourceLabel(source: string | null): string {
  switch (source) {
    case 'fitdays': return 'Fitdays'
    case 'dexa': return 'DEXA'
    case 'fitnescity': return 'Fitnescity'
    case 'manual': return 'Manual'
    default: return ''
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

const FIELDS: Array<{ key: keyof Omit<BodyCompEntry, 'id' | 'recorded_at' | 'source'>; label: string; decimals?: number }> = [
  { key: 'weight_lbs',          label: 'Weight (lbs)',        decimals: 1 },
  { key: 'body_fat_pct',        label: 'Body Fat %',          decimals: 1 },
  { key: 'bmr_kcal',            label: 'BMR (kcal)',          decimals: 0 },
  { key: 'fat_mass_lbs',        label: 'Fat Mass (lbs)',      decimals: 1 },
  { key: 'body_age',            label: 'Body Age',            decimals: 0 },
  { key: 'muscle_mass_lbs',     label: 'Muscle Mass (lbs)',   decimals: 1 },
  { key: 'skeletal_muscle_pct', label: 'Skeletal Muscle %',  decimals: 1 },
  { key: 'subcutaneous_fat_pct',label: 'Subcutaneous Fat %', decimals: 1 },
  { key: 'visceral_fat',        label: 'Visceral Fat',        decimals: 1 },
]

type RightPane = 'idle' | 'selecting' | 'parsing' | 'reviewing'
type LogSource = 'fitdays' | 'dexa' | 'fitnescity' | 'manual'
type Draft = Record<string, string>

// ─── Left pane: entry card ─────────────────────────────────────────────────────

function EntryCard({ entry, isSelected, onClick }: {
  entry: BodyCompEntry
  isSelected: boolean
  onClick: () => void
}) {
  const label = sourceLabel(entry.source)
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl mb-1.5 cursor-pointer transition-all duration-150 border-l-2',
        isSelected
          ? 'bg-[#241838] border-[#E91E8C]'
          : 'border-transparent hover:bg-[#1A1028]/80'
      )}
      style={isSelected ? { boxShadow: 'inset 0 0 20px rgba(233,30,140,0.06)' } : {}}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-[#5E5278]">{formatDate(entry.recorded_at)}</span>
        {label && (
          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#241838] text-[#7A6E90]">
            {label}
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-[#00F5D4] leading-none">
        {entry.weight_lbs != null ? entry.weight_lbs.toFixed(1) : '—'}
        {entry.weight_lbs != null && <span className="text-sm font-normal text-[#5E5278] ml-1">lbs</span>}
      </div>
      <div className="flex gap-3 mt-1 text-xs text-[#7A6E90]">
        {entry.body_fat_pct != null && <span>{entry.body_fat_pct.toFixed(1)}% fat</span>}
        {entry.muscle_mass_lbs != null && <span>{entry.muscle_mass_lbs.toFixed(1)} lbs muscle</span>}
      </div>
    </div>
  )
}

// ─── Right pane: api key banner ────────────────────────────────────────────────

function ApiKeyBanner({ onSave }: { onSave: (key: string) => Promise<void> }) {
  const [val, setVal] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!val.trim()) return
    setSaving(true)
    await onSave(val.trim())
    setSaving(false)
  }

  return (
    <div className="mb-6 p-4 rounded-xl bg-[#1A1028] border border-[#3D2E5C]">
      <div className="flex items-center gap-2 mb-2">
        <Key size={14} className="text-[#E91E8C]" />
        <span className="text-sm font-bold text-foreground">Setup Required</span>
      </div>
      <p className="text-xs text-[#7A6E90] mb-3">
        Enter your Anthropic API key to parse Fitdays screenshots automatically.
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="sk-ant-..."
          className="flex-1 bg-[#0D0A14] border border-[#3D2E5C] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-[#3D2E5C] focus:outline-none focus:border-[#E91E8C]"
        />
        <button
          onClick={handleSave}
          disabled={saving || !val.trim()}
          className="px-4 py-2 rounded-lg bg-[#E91E8C] text-white text-sm font-bold disabled:opacity-40 hover:bg-[#C4176F] transition-colors"
        >
          {saving ? 'Saving…' : 'Save Key'}
        </button>
      </div>
    </div>
  )
}

// ─── Right pane: entry detail ──────────────────────────────────────────────────

function EntryDetail({ entry, onDelete }: { entry: BodyCompEntry; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const label = sourceLabel(entry.source)

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-[#5E5278]">{formatDate(entry.recorded_at)}</span>
          {label && (
            <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#241838] text-[#7A6E90]">
              {label}
            </span>
          )}
        </div>
        <div className="text-5xl font-black text-[#00F5D4] leading-none">
          {entry.weight_lbs != null ? entry.weight_lbs.toFixed(1) : '—'}
          <span className="text-xl font-normal text-[#5E5278] ml-2">lbs</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {FIELDS.filter(f => f.key !== 'weight_lbs').map((f) => (
          <div key={f.key} className="bg-[#1A1028] rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#5E5278] mb-1">{f.label}</div>
            <div className="text-lg font-bold text-foreground">
              {fmt(entry[f.key] as number | null, f.decimals)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        {confirming ? (
          <div className="flex gap-3">
            <button
              onClick={onDelete}
              className="flex-1 py-2.5 rounded-xl border border-[#FF4D6A] text-[#FF4D6A] text-sm font-bold hover:bg-[#FF4D6A]/10 transition-colors"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-2.5 rounded-xl bg-[#241838] text-[#9B8FB0] text-sm font-bold"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-2 text-[#FF4D6A] text-sm font-bold hover:text-[#FF4D6A]/80 transition-colors"
          >
            <Trash2 size={14} />
            Delete Entry
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Right pane: method picker ─────────────────────────────────────────────────

const METHODS: Array<{ source: LogSource; label: string; subtitle: string; Icon: React.ElementType }> = [
  { source: 'fitdays',    label: 'Fitdays Scale', subtitle: 'Upload a screenshot',       Icon: Camera   },
  { source: 'dexa',       label: 'DEXA Scan',     subtitle: 'Upload your scan report',   Icon: ScanLine },
  { source: 'fitnescity', label: 'Fitnescity',    subtitle: 'Upload your results report', Icon: Activity },
  { source: 'manual',     label: 'Manual Entry',  subtitle: 'Type in measurements',       Icon: PenLine  },
]

function MethodPicker({ onSelect, onCancel }: {
  onSelect: (source: LogSource) => void
  onCancel: () => void
}) {
  return (
    <div className="max-w-md">
      <div className="text-lg font-bold text-foreground mb-1">Log Weigh-In</div>
      <div className="text-xs text-[#5E5278] mb-5">Choose how you measured today.</div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {METHODS.map(({ source, label, subtitle, Icon }) => (
          <button
            key={source}
            onClick={() => onSelect(source)}
            className="flex flex-col items-start gap-2 p-4 rounded-xl bg-[#1A1028] border border-[#3D2E5C] hover:border-[#E91E8C] hover:bg-[#241838] transition-all text-left"
          >
            <Icon size={20} className="text-[#E91E8C]" />
            <div>
              <div className="text-sm font-bold text-foreground">{label}</div>
              <div className="text-xs text-[#5E5278] mt-0.5">{subtitle}</div>
            </div>
          </button>
        ))}
      </div>
      <button onClick={onCancel} className="text-sm text-[#5E5278] hover:text-[#9B8FB0] transition-colors">
        Cancel
      </button>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function BodyComp() {
  const { entries, loading, apiKey, saveEntry, deleteEntry, saveApiKey } = useBodyComp()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rightPane, setRightPane] = useState<RightPane>('idle')
  const [logSource, setLogSource] = useState<LogSource | null>(null)
  const [draft, setDraft] = useState<Draft>({})
  const [draftDate, setDraftDate] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedEntry = entries.find((e) => e.id === selectedId) ?? null
  const today = todayStr()

  function openMethodPicker() {
    setSelectedId(null)
    setRightPane('selecting')
  }

  function handleMethodSelect(source: LogSource) {
    setLogSource(source)
    if (source === 'fitdays' || source === 'dexa' || source === 'fitnescity') {
      fileInputRef.current?.click()
    } else {
      setDraft({})
      setDraftDate(today)
      setRightPane('reviewing')
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setRightPane('parsing')
    setDraftDate(today)

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.readAsDataURL(file)
    })

    const { data, error } = await supabase.functions.invoke('parse-fitdays', {
      body: { imageBase64: base64, mimeType: file.type, source: logSource ?? 'fitdays' },
    })

    const parsed: Draft = {}
    if (!error && data && typeof data === 'object') {
      FIELDS.forEach((f) => {
        const val = (data as Record<string, unknown>)[f.key]
        if (val != null && val !== '') parsed[f.key] = String(val)
      })
    }

    setDraft(parsed)
    setRightPane('reviewing')
  }

  function updateDraftField(key: string, val: string) {
    setDraft((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSaveEntry() {
    const numericData = {
      weight_lbs:          draft.weight_lbs          ? parseFloat(draft.weight_lbs)          : null,
      body_fat_pct:        draft.body_fat_pct        ? parseFloat(draft.body_fat_pct)        : null,
      bmr_kcal:            draft.bmr_kcal            ? parseFloat(draft.bmr_kcal)            : null,
      fat_mass_lbs:        draft.fat_mass_lbs        ? parseFloat(draft.fat_mass_lbs)        : null,
      body_age:            draft.body_age            ? parseInt(draft.body_age)              : null,
      muscle_mass_lbs:     draft.muscle_mass_lbs     ? parseFloat(draft.muscle_mass_lbs)     : null,
      skeletal_muscle_pct: draft.skeletal_muscle_pct ? parseFloat(draft.skeletal_muscle_pct) : null,
      subcutaneous_fat_pct:draft.subcutaneous_fat_pct? parseFloat(draft.subcutaneous_fat_pct): null,
      visceral_fat:        draft.visceral_fat        ? parseFloat(draft.visceral_fat)        : null,
    }
    const saved = await saveEntry({
      ...numericData,
      source: logSource ?? 'manual',
      ...(draftDate ? { recorded_at: new Date(draftDate + 'T12:00:00').toISOString() } : {}),
    })
    if (saved) {
      setSelectedId(saved.id)
      setRightPane('idle')
      setDraft({})
      setLogSource(null)
    }
  }

  function handleCancel() {
    setRightPane('idle')
    setDraft({})
    setLogSource(null)
  }

  async function handleDelete() {
    if (!selectedId) return
    await deleteEntry(selectedId)
    setSelectedId(null)
  }

  // ── Right pane content ───────────────────────────────────────────────────────

  function renderRight() {
    if (rightPane === 'selecting') {
      return <MethodPicker onSelect={handleMethodSelect} onCancel={handleCancel} />
    }

    if (rightPane === 'parsing') {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-[#7A6E90]">
          <Loader2 size={32} className="animate-spin text-[#E91E8C]" />
          <span className="text-sm">Parsing screenshot…</span>
        </div>
      )
    }

    if (rightPane === 'reviewing') {
      return (
        <div className="max-w-xl">
          <div className="text-lg font-bold text-foreground mb-1">New Entry</div>
          <div className="text-xs text-[#5E5278] mb-5">
            {logSource ? sourceLabel(logSource) : 'Manual'} measurement
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Date picker — full width */}
            <div className="col-span-2">
              <label className="block text-[10px] uppercase tracking-wider text-[#5E5278] mb-1">Date</label>
              <input
                type="date"
                value={draftDate}
                max={today}
                onChange={(e) => setDraftDate(e.target.value)}
                className="w-full bg-[#1A1028] border border-[#3D2E5C] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#E91E8C]"
              />
            </div>

            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-[10px] uppercase tracking-wider text-[#5E5278] mb-1">{f.label}</label>
                <input
                  type="number"
                  step="any"
                  value={draft[f.key] ?? ''}
                  onChange={(e) => updateDraftField(f.key, e.target.value)}
                  placeholder="—"
                  className="w-full bg-[#1A1028] border border-[#3D2E5C] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-[#3D2E5C] focus:outline-none focus:border-[#E91E8C]"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveEntry}
              className="flex-1 py-3 rounded-xl bg-[#E91E8C] text-white font-bold text-sm hover:bg-[#C4176F] transition-colors"
              style={{ boxShadow: '0 0 16px rgba(233,30,140,0.4)' }}
            >
              Save Entry
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl bg-[#241838] text-[#9B8FB0] font-bold text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )
    }

    // idle
    if (selectedEntry) {
      return <EntryDetail entry={selectedEntry} onDelete={handleDelete} />
    }

    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        {!apiKey && <ApiKeyBanner onSave={saveApiKey} />}
        <button
          onClick={openMethodPicker}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E91E8C] text-white font-bold text-sm hover:bg-[#C4176F] transition-colors"
          style={{ boxShadow: '0 0 16px rgba(233,30,140,0.4)' }}
        >
          + Log Weigh-In
        </button>
        <p className="text-xs text-[#5E5278]">Fitdays, DEXA, Fitnescity, or manual entry</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[#5E5278] text-sm">
        Loading…
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* ── Left pane ── */}
      <div className="w-80 shrink-0 flex flex-col border-r border-border h-full">
        <div className="px-4 pt-5 pb-3 flex items-center justify-between shrink-0">
          <h1
            className="text-xl font-black tracking-tight"
            style={{ color: '#E91E8C', textShadow: '0 0 12px rgba(233,30,140,0.5)' }}
          >
            Body Comp
          </h1>
          <button
            onClick={openMethodPicker}
            className="text-xs font-bold text-[#E91E8C] hover:text-[#C4176F] transition-colors"
          >
            + Log
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {entries.length === 0 ? (
            <p className="text-xs text-[#5E5278] text-center mt-8">No entries yet.</p>
          ) : (
            entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                isSelected={selectedId === entry.id && rightPane === 'idle'}
                onClick={() => {
                  setSelectedId(entry.id)
                  setRightPane('idle')
                  setDraft({})
                  setLogSource(null)
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right pane ── */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderRight()}
      </div>
    </div>
  )
}
