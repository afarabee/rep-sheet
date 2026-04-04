import { Separator } from 'react-resizable-panels'

export default function ResizeHandle() {
  return (
    <Separator className="group relative w-1.5 shrink-0 bg-transparent hover:bg-[#E91E8C]/10 active:bg-[#E91E8C]/20 transition-colors duration-150 cursor-col-resize">
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border group-hover:bg-[#E91E8C]/50 group-active:bg-[#E91E8C] transition-colors" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-0.5 h-0.5 rounded-full bg-[#E91E8C]" />
        <div className="w-0.5 h-0.5 rounded-full bg-[#E91E8C]" />
        <div className="w-0.5 h-0.5 rounded-full bg-[#E91E8C]" />
      </div>
    </Separator>
  )
}
