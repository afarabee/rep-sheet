import { ArrowLeft } from 'lucide-react'

export default function MobileBackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="md:hidden flex items-center gap-1.5 px-1 py-2 mb-3 text-xs font-semibold text-[#9B8FB0] hover:text-foreground transition-colors"
    >
      <ArrowLeft size={14} />
      Back
    </button>
  )
}
