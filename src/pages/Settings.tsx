import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useSettings, type ProgramSettings } from '@/hooks/useSettings'
import { useEquipment, EQUIPMENT_TYPES } from '@/hooks/useEquipment'
import { useIsMobile } from '@/hooks/useIsMobile'
import MobileBackButton from '@/components/layout/MobileBackButton'
import ResizableLayout from '@/components/layout/ResizableLayout'
import { loadNavOrder, saveNavOrder, resetNavOrder, defaultNavItems } from '@/lib/navOrder'
import type { NavItem } from '@/lib/navOrder'
import { Timer, TrendingUp, Dumbbell, Key, Download, Loader2, Package, X, Check, ChevronUp, ChevronDown, RotateCcw, PanelLeft } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Section = 'equipment' | 'rest' | 'increments' | 'weights' | 'apikey' | 'export' | 'nav'

const NAV: Array<{ id: Section; label: string; Icon: React.ElementType }> = [
  { id: 'nav',        label: 'Left-Hand Nav', Icon: PanelLeft   },
  { id: 'equipment',  label: 'Equipment',      Icon: Package    },
  { id: 'rest',       label: 'Rest Timer',     Icon: Timer      },
  { id: 'increments', label: '5×5 Increments', Icon: TrendingUp },
  { id: 'weights',    label: 'Working Weights', Icon: Dumbbell   },
  { id: 'apikey',     label: 'Body Comp API',   Icon: Key        },
  { id: 'export',     label: 'Data Export',     Icon: Download   },
]

// ─── Shared helpers ────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-bold text-foreground mb-1">{title}</h2>
      <p className="text-xs text-[#5E5278]">{subtitle}</p>
    </div>
  )
}

function SavedBadge({ visible }: { visible: boolean }) {
  return (
    <span className={cn(
      'text-xs font-bold text-[#7DFFC4] w-14 transition-opacity duration-300',
      visible ? 'opacity-100' : 'opacity-0'
    )}>
      Saved ✓
    </span>
  )
}

function NumericRow({
  label, fieldKey, value, unit, step = 5, min = 0, savedKey, onBlur,
}: {
  label: string; fieldKey: string; value: number; unit: string
  step?: number; min?: number; savedKey: string | null
  onBlur: (key: string, val: number) => void
}) {
  const [local, setLocal] = useState(String(value))
  return (
    <div className="flex items-center gap-4 py-4 border-b border-[#1A1028]">
      <span className="flex-1 text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={local}
          min={min}
          step={step}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={(e) => {
            const val = parseFloat(e.target.value)
            if (!isNaN(val) && val >= min) onBlur(fieldKey, val)
          }}
          className="w-20 text-right bg-[#1A1028] border border-[#3D2E5C] rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-[#E91E8C]"
        />
        <span className="text-xs text-[#5E5278] w-12">{unit}</span>
        <SavedBadge visible={savedKey === fieldKey} />
      </div>
    </div>
  )
}

// ─── Sections ──────────────────────────────────────────────────────────────────

function RestTimerSection({ settings, onSave }: {
  settings: ProgramSettings
  onSave: (field: keyof ProgramSettings, val: number) => void
}) {
  const [savedKey, setSavedKey] = useState<string | null>(null)
  function handleBlur(key: string, val: number) {
    onSave(key as keyof ProgramSettings, val)
    setSavedKey(key)
    setTimeout(() => setSavedKey(null), 1500)
  }
  return (
    <div>
      <SectionHeader title="Rest Timer" subtitle="Controls the rest timer that starts after each logged set." />
      <NumericRow label="Default Rest" fieldKey="rest_seconds_default" value={settings.rest_seconds_default} unit="seconds" step={5} savedKey={savedKey} onBlur={handleBlur} />
      <NumericRow label="Increment" fieldKey="rest_seconds_increment" value={settings.rest_seconds_increment} unit="seconds" step={5} savedKey={savedKey} onBlur={handleBlur} />
    </div>
  )
}

function IncrementsSection({ settings, onSave }: {
  settings: ProgramSettings
  onSave: (field: keyof ProgramSettings, val: number) => void
}) {
  const [savedKey, setSavedKey] = useState<string | null>(null)
  function handleBlur(key: string, val: number) {
    onSave(key as keyof ProgramSettings, val)
    setSavedKey(key)
    setTimeout(() => setSavedKey(null), 1500)
  }
  return (
    <div>
      <SectionHeader title="5×5 Increments" subtitle="How much weight to add when you progress a lift." />
      <NumericRow label="Upper Body" fieldKey="increment_upper_lbs" value={settings.increment_upper_lbs} unit="lbs" step={2.5} savedKey={savedKey} onBlur={handleBlur} />
      <NumericRow label="Squat"      fieldKey="increment_squat_lbs" value={settings.increment_squat_lbs} unit="lbs" step={2.5} savedKey={savedKey} onBlur={handleBlur} />
      <NumericRow label="Deadlift"   fieldKey="increment_deadlift_lbs" value={settings.increment_deadlift_lbs} unit="lbs" step={2.5} savedKey={savedKey} onBlur={handleBlur} />
    </div>
  )
}

function WorkingWeightsSection({ workingWeights, onSave }: {
  workingWeights: Array<{ exercise_id: string; name: string; weight_lbs: number | null }>
  onSave: (exerciseId: string, weight: number) => void
}) {
  const [savedId, setSavedId] = useState<string | null>(null)
  const [localValues, setLocalValues] = useState<Record<string, string>>({})

  if (workingWeights.length === 0) {
    return (
      <div>
        <SectionHeader title="Working Weights" subtitle="Your current working weight per exercise." />
        <p className="text-sm text-[#5E5278] mt-4">
          No working weights recorded yet. They'll appear here after your first 5×5 workout.
        </p>
      </div>
    )
  }

  function handleBlur(exerciseId: string, raw: string) {
    const val = parseFloat(raw)
    if (isNaN(val) || val < 0) return
    onSave(exerciseId, val)
    setSavedId(exerciseId)
    setTimeout(() => setSavedId(null), 1500)
  }

  return (
    <div>
      <SectionHeader title="Working Weights" subtitle="Your current working weight per exercise." />
      {workingWeights.map((w) => {
        const local = localValues[w.exercise_id] ?? String(w.weight_lbs ?? '')
        return (
          <div key={w.exercise_id} className="flex items-center gap-4 py-4 border-b border-[#1A1028]">
            <span className="flex-1 text-sm text-foreground">{w.name}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={local}
                min={0}
                step={2.5}
                onChange={(e) => setLocalValues((prev) => ({ ...prev, [w.exercise_id]: e.target.value }))}
                onBlur={(e) => handleBlur(w.exercise_id, e.target.value)}
                placeholder="—"
                className="w-20 text-right bg-[#1A1028] border border-[#3D2E5C] rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-[#3D2E5C] focus:outline-none focus:border-[#E91E8C]"
              />
              <span className="text-xs text-[#5E5278] w-8">lbs</span>
              <SavedBadge visible={savedId === w.exercise_id} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ApiKeySection({ currentKey, onSave }: {
  currentKey: string | null
  onSave: (key: string) => void
}) {
  const [val, setVal] = useState('')
  const [saved, setSaved] = useState(false)
  const maskedKey = currentKey ? `sk-ant-...${currentKey.slice(-4)}` : null

  function handleSave() {
    if (!val.trim()) return
    onSave(val.trim())
    setVal('')
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div>
      <SectionHeader title="Body Comp API Key" subtitle="Your Anthropic API key for parsing Fitdays, DEXA, and Fitnescity uploads." />
      {maskedKey && (
        <div className="flex items-center gap-2 mb-5 py-3 px-4 rounded-xl bg-[#1A1028] border border-[#3D2E5C]">
          <Key size={14} className="text-[#5E5278]" />
          <span className="text-sm text-[#9B8FB0]">Current key:</span>
          <span className="text-sm font-mono text-foreground">{maskedKey}</span>
        </div>
      )}
      <div className="flex gap-3 items-center">
        <input
          type="password"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={maskedKey ? 'Enter new key to replace…' : 'sk-ant-...'}
          className="flex-1 bg-[#1A1028] border border-[#3D2E5C] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-[#3D2E5C] focus:outline-none focus:border-[#E91E8C]"
        />
        <button
          onClick={handleSave}
          disabled={!val.trim()}
          className="px-5 py-2 rounded-lg bg-[#E91E8C] text-white text-sm font-bold disabled:opacity-40 hover:bg-[#C4176F] transition-colors"
        >
          Save
        </button>
        <SavedBadge visible={saved} />
      </div>
    </div>
  )
}

function ExportSection({ onExport }: { onExport: () => Promise<void> }) {
  const [exporting, setExporting] = useState(false)
  async function handleExport() {
    setExporting(true)
    await onExport()
    setExporting(false)
  }
  return (
    <div>
      <SectionHeader title="Data Export" subtitle="Download your full workout history as a CSV file." />
      <p className="text-sm text-[#7A6E90] mb-6">
        Includes all workouts, exercises, sets, weights, reps, and notes.
      </p>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E91E8C] text-white font-bold text-sm disabled:opacity-60 hover:bg-[#C4176F] transition-colors"
        style={{ boxShadow: '0 0 16px rgba(233,30,140,0.4)' }}
      >
        {exporting
          ? <><Loader2 size={16} className="animate-spin" /> Exporting…</>
          : <><Download size={16} /> Export CSV</>
        }
      </button>
    </div>
  )
}

// ─── Nav Order section ─────────────────────────────────────────────────────────

function NavOrderSection() {
  const [items, setItems] = useState<NavItem[]>(loadNavOrder)
  const [saved, setSaved] = useState(false)

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const temp = next[index]
    next[index] = next[target]
    next[target] = temp
    setItems(next)
    saveNavOrder(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function handleReset() {
    resetNavOrder()
    setItems([...defaultNavItems])
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div>
      <SectionHeader
        title="Left-Hand Nav"
        subtitle="Reorder the tabs in the sidebar. Changes apply immediately."
      />

      <div className="flex flex-col gap-0.5 mb-6">
        {items.map((item, i) => (
          <div
            key={item.to}
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#241838] border border-[#2A2040]"
          >
            <item.Icon size={16} className="text-[#9B8FB0] shrink-0" />
            <span className="flex-1 text-sm font-semibold text-foreground">{item.label}</span>
            <div className="flex gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-20 text-[#9B8FB0] hover:bg-[#1A1028] hover:text-[#F0EAF4]"
                aria-label={`Move ${item.label} up`}
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-20 text-[#9B8FB0] hover:bg-[#1A1028] hover:text-[#F0EAF4]"
                aria-label={`Move ${item.label} down`}
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2A2040] text-sm text-[#9B8FB0] hover:bg-[#241838] hover:text-[#F0EAF4] transition-colors"
        >
          <RotateCcw size={14} />
          Reset to default
        </button>
        <SavedBadge visible={saved} />
      </div>
    </div>
  )
}

// ─── Equipment section ─────────────────────────────────────────────────────────

function EquipmentSection() {
  const { equipment, loading, toggleOwned, addCustom, deleteCustom } = useEquipment()
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('other')

  if (loading) return <p className="text-sm text-[#5E5278]">Loading…</p>

  const standard = equipment.filter((e) => !e.is_custom)
  const custom = equipment.filter((e) => e.is_custom)

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    await addCustom(name, newType)
    setNewName('')
    setNewType('other')
  }

  return (
    <div>
      <SectionHeader title="My Equipment" subtitle="Select the equipment you have in your home gym. The exercise picker will use this to filter exercises." />

      {/* Standard items */}
      <div className="mb-6">
        {standard.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleOwned(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3.5 rounded-xl mb-1 text-left transition-all duration-150 border',
              item.is_owned
                ? 'bg-[#241838] border-[#E91E8C]/50 text-foreground'
                : 'bg-transparent border-[#1A1028] text-[#7A6E90] hover:bg-[#1A1028]/60'
            )}
          >
            <div className={cn(
              'w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors',
              item.is_owned ? 'bg-[#E91E8C] border-[#E91E8C]' : 'border-[#3D2E5C]'
            )}>
              {item.is_owned && <Check size={12} className="text-white" strokeWidth={3} />}
            </div>
            <span className="text-sm font-medium">{item.name}</span>
          </button>
        ))}
      </div>

      {/* Custom items */}
      {custom.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-wider text-[#5E5278] mb-2">Custom</p>
          {custom.map((item) => (
            <div key={item.id} className="flex items-center gap-2 mb-1">
              <button
                onClick={() => toggleOwned(item.id)}
                className={cn(
                  'flex-1 flex items-center gap-3 px-3 py-3.5 rounded-xl text-left transition-all duration-150 border',
                  item.is_owned
                    ? 'bg-[#241838] border-[#E91E8C]/50 text-foreground'
                    : 'bg-transparent border-[#1A1028] text-[#7A6E90] hover:bg-[#1A1028]/60'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors',
                  item.is_owned ? 'bg-[#E91E8C] border-[#E91E8C]' : 'border-[#3D2E5C]'
                )}>
                  {item.is_owned && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-sm font-medium">{item.name}</span>
              </button>
              <button
                onClick={() => deleteCustom(item.id)}
                className="p-2 text-[#5E5278] hover:text-[#FF4D6A] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add custom */}
      <div className="pt-4 border-t border-[#1A1028]">
        <p className="text-[10px] uppercase tracking-wider text-[#5E5278] mb-3">Add Custom Equipment</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Equipment name"
            className="flex-1 bg-[#1A1028] border border-[#3D2E5C] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-[#3D2E5C] focus:outline-none focus:border-[#E91E8C]"
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="bg-[#1A1028] border border-[#3D2E5C] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#E91E8C]"
          >
            {EQUIPMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="px-4 py-2 rounded-lg bg-[#E91E8C] text-white text-sm font-bold disabled:opacity-40 hover:bg-[#C4176F] transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function Settings() {
  const { settings, workingWeights, loading, saveSetting, saveWorkingWeight, exportCsv } = useSettings()
  const isMobile = useIsMobile()
  const [activeSection, setActiveSection] = useState<Section>('equipment')
  const [showDetail, setShowDetail] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[#5E5278] text-sm">
        Loading…
      </div>
    )
  }

  function renderSection() {
    switch (activeSection) {
      case 'nav':        return <NavOrderSection />
      case 'equipment':  return <EquipmentSection />
      case 'rest':       return <RestTimerSection settings={settings} onSave={(f, v) => saveSetting(f, v)} />
      case 'increments': return <IncrementsSection settings={settings} onSave={(f, v) => saveSetting(f, v)} />
      case 'weights':    return <WorkingWeightsSection workingWeights={workingWeights} onSave={saveWorkingWeight} />
      case 'apikey':     return <ApiKeySection currentKey={settings.anthropic_api_key} onSave={(k) => saveSetting('anthropic_api_key', k)} />
      case 'export':     return <ExportSection onExport={exportCsv} />
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      <ResizableLayout
        id="settings-layout"
        isMobile={isMobile}
        leftDefault={25}
        leftPanel={
          <div className={cn(
            'w-full flex flex-col border-r border-border h-full',
            isMobile && showDetail && 'hidden'
          )}>
            <div className="px-4 pt-5 pb-4 shrink-0">
              <h1
                className="text-xl font-black tracking-tight"
                style={{ color: '#E91E8C', textShadow: '0 0 12px rgba(233,30,140,0.5)' }}
              >
                Settings
              </h1>
            </div>
            <nav className="flex-1 overflow-y-auto px-2">
              {NAV.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveSection(id); setShowDetail(true) }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-left transition-all duration-150 border-l-2',
                    activeSection === id
                      ? 'bg-[#241838] border-[#E91E8C] text-foreground'
                      : 'border-transparent text-[#5E5278] hover:bg-[#1A1028]/80 hover:text-[#9B8FB0]'
                  )}
                  style={activeSection === id ? { boxShadow: 'inset 0 0 20px rgba(233,30,140,0.06)' } : {}}
                >
                  <Icon size={16} />
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        }
        rightPanel={
          <div className={cn(
            'h-full overflow-y-auto p-4 lg:p-6 max-w-xl',
            isMobile && !showDetail && 'hidden'
          )}>
            {isMobile && showDetail && (
              <MobileBackButton onBack={() => setShowDetail(false)} />
            )}
            {renderSection()}
          </div>
        }
      />
    </div>
  )
}
