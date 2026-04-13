'use client'

interface StickyNoteProps {
  text: string
  sectionTitle: string
  badgeNumber: number
  onDismiss: () => void
}

export function StickyNote({ text, sectionTitle, badgeNumber, onDismiss }: StickyNoteProps) {
  return (
    <div
      className="bg-yellow-50 border border-yellow-300 rounded-lg shadow-sm p-3 relative"
      role="note"
      aria-label={`Tip for ${sectionTitle} section`}
    >
      <div className="flex justify-between items-start gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0A66C2] text-white text-xs font-bold flex items-center justify-center">
            {badgeNumber}
          </span>
          <span className="text-xs font-bold text-yellow-900 uppercase tracking-wide truncate max-w-[140px]">
            {sectionTitle}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-yellow-600 hover:text-yellow-900 text-lg leading-none font-bold min-h-[24px] min-w-[24px] flex items-center justify-center rounded hover:bg-yellow-100"
          aria-label="Dismiss tip"
        >
          ×
        </button>
      </div>
      <p className="text-xs text-yellow-900 leading-relaxed">{text}</p>
    </div>
  )
}
