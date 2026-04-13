'use client'

interface StickyNoteProps {
  text: string
  sectionTitle: string
  onDismiss: () => void
}

export function StickyNote({ text, sectionTitle, onDismiss }: StickyNoteProps) {
  return (
    <div
      className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md p-3 relative"
      style={{ maxWidth: '240px' }}
      role="note"
      aria-label={`Tip for ${sectionTitle} section`}
    >
      <div className="flex justify-between items-start gap-2 mb-1">
        <span className="text-xs font-bold text-yellow-800 uppercase tracking-wide">💡 Tip</span>
        <button
          onClick={onDismiss}
          className="text-yellow-600 hover:text-yellow-900 text-lg leading-none font-bold min-h-[24px] min-w-[24px] flex items-center justify-center"
          aria-label="Dismiss tip"
        >
          ×
        </button>
      </div>
      <p className="text-xs text-yellow-900 leading-relaxed">{text}</p>
    </div>
  )
}
