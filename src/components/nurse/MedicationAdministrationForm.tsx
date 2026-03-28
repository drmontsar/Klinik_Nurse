import { useState } from 'react'
import { COLORS } from '@/constants/colors'
import type { MedicationTask } from '@/types/NurseTask'

interface MedicationAdministrationFormProps {
  task: MedicationTask
  busy: boolean
  onSubmit: (confirmationChecked: boolean, note: string) => Promise<void>
}

export function MedicationAdministrationForm({
  task,
  busy,
  onSubmit,
}: MedicationAdministrationFormProps) {
  const [confirmationChecked, setConfirmationChecked] = useState(false)
  const [note, setNote] = useState('')

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div
        style={{
          borderRadius: 16,
          padding: 14,
          backgroundColor: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          color: COLORS.text,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          {task.medicationOrder.name}
        </div>
        <div style={{ color: COLORS.textMuted, lineHeight: 1.5 }}>
          {task.medicationOrder.dose} · {task.medicationOrder.route} ·{' '}
          {task.medicationOrder.schedule}
        </div>
        <div style={{ color: COLORS.amber, marginTop: 10, lineHeight: 1.5 }}>
          {task.medicationOrder.safetyNote}
        </div>
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          color: COLORS.text,
        }}
      >
        <input
          type="checkbox"
          checked={confirmationChecked}
          onChange={(event) => setConfirmationChecked(event.target.checked)}
          style={{ marginTop: 3 }}
        />
        <span>
          I have confirmed the right patient, drug, dose, route, and timing.
        </span>
      </label>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={4}
        placeholder="Optional administration note"
        style={{
          borderRadius: 14,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.bg,
          color: COLORS.text,
          padding: 12,
          resize: 'vertical',
        }}
      />

      <button
        disabled={busy || !confirmationChecked}
        onClick={() => void onSubmit(confirmationChecked, note)}
        style={{
          border: 0,
          borderRadius: 14,
          padding: '12px 14px',
          backgroundColor:
            busy || !confirmationChecked ? COLORS.border : COLORS.brand,
          color: COLORS.text,
          fontWeight: 700,
          cursor: busy || !confirmationChecked ? 'not-allowed' : 'pointer',
        }}
      >
        {busy ? 'Saving administration...' : 'Confirm administration'}
      </button>
    </div>
  )
}
