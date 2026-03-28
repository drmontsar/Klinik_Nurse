import { NEWS2Badge } from '@/components/shared/NEWS2Badge'
import { COLORS } from '@/constants/colors'
import type { Patient } from '@/types/Patient'

interface QueuePanelProps {
  patients: Patient[]
  openTaskCountByPatient: Record<string, number>
  onCallNext: (patientId: string) => void
  onOpenTasks: (patientId: string) => void
  onRecordVitals: (patientId: string) => void
}

function getTriageTone(score: number) {
  if (score >= 7) {
    return {
      label: 'Immediate review',
      color: COLORS.red,
      background: COLORS.redBg,
    }
  }

  if (score >= 5) {
    return {
      label: 'Attention soon',
      color: COLORS.amber,
      background: COLORS.amberBg,
    }
  }

  return {
    label: 'Stable queue',
    color: COLORS.brand,
    background: COLORS.brandBg,
  }
}

export function QueuePanel({
  patients,
  openTaskCountByPatient,
  onCallNext,
  onOpenTasks,
  onRecordVitals,
}: QueuePanelProps) {
  return (
    <section
      style={{
        display: 'grid',
        gap: 16,
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
          Queue
        </div>
        <div
          style={{
            color: COLORS.textMuted,
            lineHeight: 1.6,
          }}
        >
          The queue is the home screen. Large buttons here help the nurse move
          straight into the next action without hunting across the app.
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 14,
        }}
      >
        {patients.map((patient) => {
          const triageTone = getTriageTone(patient.news2)
          const openTasks = openTaskCountByPatient[patient.id] ?? 0

          return (
            <div
              key={patient.id}
              style={{
                display: 'grid',
                gap: 14,
                padding: 18,
                borderRadius: 24,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.card,
                boxShadow: `0 14px 32px ${COLORS.shadow}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      color: COLORS.text,
                      fontWeight: 700,
                      fontSize: 18,
                      marginBottom: 4,
                    }}
                  >
                    {patient.name}
                  </div>
                  <div
                    style={{
                      color: COLORS.textMuted,
                      lineHeight: 1.6,
                    }}
                  >
                    Bed {patient.bed} · DOB{' '}
                    {new Date(patient.dateOfBirth).toLocaleDateString()} ·{' '}
                    {patient.diagnosis}
                  </div>
                </div>
                <NEWS2Badge score={patient.news2} />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    borderRadius: 999,
                    padding: '6px 10px',
                    backgroundColor: triageTone.background,
                    color: triageTone.color,
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {triageTone.label}
                </span>
                <span
                  style={{
                    borderRadius: 999,
                    padding: '6px 10px',
                    backgroundColor: COLORS.surface,
                    color: COLORS.textMuted,
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  {openTasks} open task{openTasks === 1 ? '' : 's'}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                }}
              >
                <button
                  onClick={() => onCallNext(patient.id)}
                  style={{
                    border: 0,
                    borderRadius: 18,
                    padding: '16px 18px',
                    backgroundColor: COLORS.brand,
                    color: COLORS.onTone,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: `0 14px 30px ${COLORS.shadowStrong}`,
                  }}
                >
                  Call next
                </button>
                <button
                  onClick={() => onRecordVitals(patient.id)}
                  style={{
                    border: 0,
                    borderRadius: 18,
                    padding: '16px 18px',
                    backgroundColor: COLORS.card,
                    color: COLORS.text,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: `0 10px 24px ${COLORS.shadow}`,
                  }}
                >
                  Record vitals
                </button>
                <button
                  onClick={() => onOpenTasks(patient.id)}
                  style={{
                    border: 0,
                    borderRadius: 18,
                    padding: '16px 18px',
                    backgroundColor: COLORS.card,
                    color: COLORS.text,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: `0 10px 24px ${COLORS.shadow}`,
                  }}
                >
                  Open tasks
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
