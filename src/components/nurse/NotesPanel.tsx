import { COLORS } from '@/constants/colors'
import type { Patient } from '@/types/Patient'

interface NotesPanelProps {
  patient: Patient | null
  draft: string
  savedAt: string | null
  onDraftChange: (value: string) => void
  onAppendTemplate: (template: string) => void
}

const noteTemplates = [
  'Patient comfortable, no fresh complaints.',
  'Explained plan to patient and family.',
  'Vitals stable and recorded.',
  'Medication given as ordered.',
  'Escalated to doctor for review.',
]

export function NotesPanel({
  patient,
  draft,
  savedAt,
  onDraftChange,
  onAppendTemplate,
}: NotesPanelProps) {
  if (!patient) {
    return (
      <div
        style={{
          borderRadius: 24,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.surface,
          padding: 24,
          color: COLORS.textMuted,
          boxShadow: `0 18px 44px ${COLORS.shadow}`,
        }}
      >
        Select a patient from the queue or task list to start writing notes.
      </div>
    )
  }

  return (
    <section
      style={{
        display: 'grid',
        gap: 16,
        padding: 22,
        borderRadius: 26,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.surface,
        boxShadow: `0 18px 44px ${COLORS.shadow}`,
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: 6,
        }}
      >
        <div
          style={{
            color: COLORS.text,
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          Notes
        </div>
        <div
          style={{
            color: COLORS.textMuted,
            lineHeight: 1.6,
          }}
        >
          Quick-tap templates reduce typing, and the draft autosaves on every
          keystroke for interruptions during a shift.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        {noteTemplates.map((template) => (
          <button
            key={template}
            onClick={() => onAppendTemplate(template)}
            style={{
              border: 0,
              borderRadius: 999,
              padding: '10px 14px',
              backgroundColor: COLORS.brandBg,
              color: COLORS.brand,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {template}
          </button>
        ))}
      </div>

      <textarea
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        rows={10}
        placeholder="Write the nursing note here..."
        style={{
          borderRadius: 18,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.card,
          color: COLORS.text,
          padding: 16,
          resize: 'vertical',
          boxShadow: `0 10px 24px ${COLORS.shadow}`,
          fontSize: 16,
          lineHeight: 1.6,
        }}
      />

      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        {savedAt
          ? `Autosaved locally at ${new Date(savedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}.`
          : 'Autosave starts as soon as you type.'}
      </div>
    </section>
  )
}
