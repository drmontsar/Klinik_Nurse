import { NEWS2Badge } from '@/components/shared/NEWS2Badge'
import { COLORS } from '@/constants/colors'
import type { Patient } from '@/types/Patient'
import type { Vitals } from '@/types/Vitals'

interface PatientRosterPanelProps {
  patients: Patient[]
  latestVitalsByPatient: Record<string, Vitals | null>
  openTaskCountByPatient: Record<string, number>
  onFocusPatientTasks: (patientId: string) => void
}

export function PatientRosterPanel({
  patients,
  latestVitalsByPatient,
  openTaskCountByPatient,
  onFocusPatientTasks,
}: PatientRosterPanelProps) {
  return (
    <section
      style={{
        display: 'grid',
        gap: 16,
        padding: 20,
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
          Ward roster
        </div>
        <div
          style={{
            color: COLORS.textMuted,
            lineHeight: 1.6,
            maxWidth: 720,
          }}
        >
          Kept below the active task workspace so task execution stays primary,
          while patient context is still one quick glance away when needed.
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
        }}
      >
        {patients.map((patient) => {
          const openTasks = openTaskCountByPatient[patient.id] ?? 0
          const latestVitals = latestVitalsByPatient[patient.id]

          return (
            <div
              key={patient.id}
              style={{
                display: 'grid',
                gap: 12,
                padding: 16,
                borderRadius: 20,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.card,
                boxShadow: `0 10px 24px ${COLORS.shadow}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      color: COLORS.text,
                      fontWeight: 700,
                      fontSize: 16,
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
                    Bed {patient.bed} · {patient.diagnosis}
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
                    backgroundColor: COLORS.brandBg,
                    color: COLORS.brand,
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {openTasks} open task{openTasks === 1 ? '' : 's'}
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
                  Latest vitals:{' '}
                  {latestVitals?.news2Score !== null &&
                  latestVitals?.news2Score !== undefined
                    ? `NEWS2 ${latestVitals.news2Score}`
                    : 'Not recorded in this session'}
                </span>
              </div>

              <div
                style={{
                  color: COLORS.textDim,
                  lineHeight: 1.6,
                }}
              >
                Last nurse note: {patient.lastNurseNote}
              </div>

              <div>
                <button
                  disabled={openTasks === 0}
                  onClick={() => onFocusPatientTasks(patient.id)}
                  style={{
                    border: 0,
                    borderRadius: 14,
                    padding: '10px 14px',
                    backgroundColor:
                      openTasks === 0 ? COLORS.border : COLORS.brand,
                    color:
                      openTasks === 0 ? COLORS.textMuted : COLORS.onTone,
                    fontWeight: 700,
                    cursor: openTasks === 0 ? 'not-allowed' : 'pointer',
                    boxShadow:
                      openTasks === 0
                        ? 'none'
                        : `0 12px 28px ${COLORS.shadowStrong}`,
                  }}
                >
                  {openTasks === 0 ? 'No active task' : 'Focus patient tasks'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
