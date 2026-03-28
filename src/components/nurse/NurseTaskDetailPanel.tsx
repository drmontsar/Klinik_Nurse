import { useEffect, useState } from 'react'
import { MedicationAdministrationForm } from '@/components/nurse/MedicationAdministrationForm'
import { VitalsEntryForm } from '@/components/nurse/VitalsEntryForm'
import { NEWS2Badge } from '@/components/shared/NEWS2Badge'
import { COLORS } from '@/constants/colors'
import type { NurseTask } from '@/types/NurseTask'
import type { Patient } from '@/types/Patient'
import type { Vitals, VitalsDraft } from '@/types/Vitals'

interface NurseTaskDetailPanelProps {
  task: NurseTask | null
  patient: Patient | null
  latestVitals: Vitals | null
  busy: boolean
  onStartTask: (taskId: string) => Promise<void>
  onCompleteChecklistTask: (taskId: string, note?: string) => Promise<void>
  onRecordVitals: (task: NurseTask, draft: VitalsDraft) => Promise<void>
  onAdministerMedication: (
    task: NurseTask,
    confirmationChecked: boolean,
    note: string,
  ) => Promise<void>
  onDeferTask: (taskId: string, reason: string) => Promise<void>
  onEscalateTask: (taskId: string, reason: string) => Promise<void>
}

export function NurseTaskDetailPanel({
  task,
  patient,
  latestVitals,
  busy,
  onStartTask,
  onCompleteChecklistTask,
  onRecordVitals,
  onAdministerMedication,
  onDeferTask,
  onEscalateTask,
}: NurseTaskDetailPanelProps) {
  const [completionNote, setCompletionNote] = useState('')
  const [deferReason, setDeferReason] = useState('')
  const [escalateReason, setEscalateReason] = useState('')

  useEffect(() => {
    setCompletionNote('')
    setDeferReason('')
    setEscalateReason('')
  }, [task?.id])

  if (!task || !patient) {
    return (
      <div
        style={{
          borderRadius: 24,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.surface,
          padding: 24,
          color: COLORS.textMuted,
          minHeight: 400,
        }}
      >
        Select a task to review patient details and bedside actions.
      </div>
    )
  }

  const isClosed =
    task.status === 'completed' ||
    task.status === 'deferred' ||
    task.status === 'escalated'

  return (
    <div
      style={{
        borderRadius: 24,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.surface,
        padding: 24,
        display: 'grid',
        gap: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              color: COLORS.text,
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            {patient.name}
          </div>
          <div style={{ color: COLORS.textMuted, lineHeight: 1.6 }}>
            Bed {patient.bed} · {patient.diagnosis}
          </div>
        </div>
        <NEWS2Badge score={patient.news2} />
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        }}
      >
        <div
          style={{
            borderRadius: 16,
            padding: 14,
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ color: COLORS.textDim, marginBottom: 6 }}>Task</div>
          <div style={{ color: COLORS.text, fontWeight: 700 }}>{task.title}</div>
        </div>
        <div
          style={{
            borderRadius: 16,
            padding: 14,
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ color: COLORS.textDim, marginBottom: 6 }}>Due</div>
          <div style={{ color: COLORS.text, fontWeight: 700 }}>{task.dueAt}</div>
        </div>
        <div
          style={{
            borderRadius: 16,
            padding: 14,
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ color: COLORS.textDim, marginBottom: 6 }}>Status</div>
          <div style={{ color: COLORS.text, fontWeight: 700 }}>{task.status}</div>
        </div>
      </div>

      <div
        style={{
          borderRadius: 16,
          padding: 16,
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 8 }}>
          Nurse context
        </div>
        <div style={{ color: COLORS.textMuted, lineHeight: 1.6 }}>
          {task.description}
        </div>
        <div style={{ color: COLORS.textDim, marginTop: 10, lineHeight: 1.6 }}>
          Last nurse note: {patient.lastNurseNote}
        </div>
        {latestVitals ? (
          <div style={{ color: COLORS.textDim, marginTop: 10, lineHeight: 1.6 }}>
            Latest recorded vitals: {new Date(latestVitals.recordedAt).toLocaleString()}
            {' · '}NEWS2 {latestVitals.news2Score ?? 'Incomplete'}
          </div>
        ) : null}
      </div>

      {!isClosed && task.status === 'pending' ? (
        <button
          onClick={() => void onStartTask(task.id)}
          disabled={busy}
          style={{
            border: 0,
            borderRadius: 14,
            padding: '12px 14px',
            backgroundColor: busy ? COLORS.border : COLORS.purple,
            color: COLORS.text,
            fontWeight: 700,
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          Mark in progress
        </button>
      ) : null}

      {!isClosed && task.category === 'vitals' ? (
        <VitalsEntryForm
          busy={busy}
          onSubmit={async (draft) => {
            await onRecordVitals(task, draft)
          }}
        />
      ) : null}

      {!isClosed && task.category === 'medication' ? (
        <MedicationAdministrationForm
          task={task}
          busy={busy}
          onSubmit={async (confirmationChecked, note) => {
            await onAdministerMedication(task, confirmationChecked, note)
          }}
        />
      ) : null}

      {!isClosed &&
      task.category !== 'vitals' &&
      task.category !== 'medication' ? (
        <div style={{ display: 'grid', gap: 12 }}>
          <textarea
            rows={4}
            value={completionNote}
            onChange={(event) => setCompletionNote(event.target.value)}
            placeholder="Optional completion note"
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
            onClick={() =>
              void onCompleteChecklistTask(task.id, completionNote)
            }
            disabled={busy}
            style={{
              border: 0,
              borderRadius: 14,
              padding: '12px 14px',
              backgroundColor: busy ? COLORS.border : COLORS.brand,
              color: COLORS.text,
              fontWeight: 700,
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? 'Saving task...' : 'Complete task'}
          </button>
        </div>
      ) : null}

      {!isClosed ? (
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          <div
            style={{
              borderRadius: 16,
              padding: 14,
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              display: 'grid',
              gap: 10,
            }}
          >
            <div style={{ color: COLORS.text, fontWeight: 700 }}>Defer</div>
            <textarea
              rows={4}
              value={deferReason}
              onChange={(event) => setDeferReason(event.target.value)}
              placeholder="Why is this task being deferred?"
              style={{
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.bg,
                color: COLORS.text,
                padding: 12,
                resize: 'vertical',
              }}
            />
            <button
              disabled={busy || deferReason.trim().length === 0}
              onClick={() => void onDeferTask(task.id, deferReason)}
              style={{
                border: 0,
                borderRadius: 14,
                padding: '12px 14px',
                backgroundColor:
                  busy || deferReason.trim().length === 0
                    ? COLORS.border
                    : COLORS.amber,
                color: COLORS.text,
                fontWeight: 700,
                cursor:
                  busy || deferReason.trim().length === 0
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              Defer with reason
            </button>
          </div>

          <div
            style={{
              borderRadius: 16,
              padding: 14,
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              display: 'grid',
              gap: 10,
            }}
          >
            <div style={{ color: COLORS.text, fontWeight: 700 }}>Escalate</div>
            <textarea
              rows={4}
              value={escalateReason}
              onChange={(event) => setEscalateReason(event.target.value)}
              placeholder="What needs escalation?"
              style={{
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.bg,
                color: COLORS.text,
                padding: 12,
                resize: 'vertical',
              }}
            />
            <button
              disabled={busy || escalateReason.trim().length === 0}
              onClick={() => void onEscalateTask(task.id, escalateReason)}
              style={{
                border: 0,
                borderRadius: 14,
                padding: '12px 14px',
                backgroundColor:
                  busy || escalateReason.trim().length === 0
                    ? COLORS.border
                    : COLORS.red,
                color: COLORS.text,
                fontWeight: 700,
                cursor:
                  busy || escalateReason.trim().length === 0
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              Escalate task
            </button>
          </div>
        </div>
      ) : null}

      <div
        style={{
          borderRadius: 16,
          padding: 16,
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 10 }}>
          Audit trail
        </div>
        {task.auditTrail.length === 0 ? (
          <div style={{ color: COLORS.textMuted }}>
            No actions recorded yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {task.auditTrail.map((entry) => (
              <div
                key={`${entry.actedAt}-${entry.status}`}
                style={{
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: COLORS.bg,
                  color: COLORS.textMuted,
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: COLORS.text, fontWeight: 700 }}>
                  {entry.status}
                </span>
                {' · '}
                {new Date(entry.actedAt).toLocaleString()}
                {' · '}
                {entry.actedBy}
                {entry.note ? ` · ${entry.note}` : ''}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
