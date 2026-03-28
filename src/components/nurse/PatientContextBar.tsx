import { NEWS2Badge } from '@/components/shared/NEWS2Badge'
import { COLORS } from '@/constants/colors'
import type { NurseWorkspaceTab } from '@/hooks/useNurseTaskBoard'
import type { Patient } from '@/types/Patient'
import type { Vitals } from '@/types/Vitals'

interface PatientContextBarProps {
  patient: Patient
  latestVitals: Vitals | null
  openTaskCount: number
  activeTab: NurseWorkspaceTab
  onOpenTasks: () => void
  onOpenVitals: () => void
  onOpenNotes: () => void
}

function quickActionButtonStyle(isActive: boolean) {
  return {
    border: 0,
    borderRadius: 16,
    padding: '12px 16px',
    backgroundColor: isActive ? COLORS.brand : COLORS.card,
    color: isActive ? COLORS.onTone : COLORS.text,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: isActive
      ? `0 12px 28px ${COLORS.shadowStrong}`
      : `0 8px 18px ${COLORS.shadow}`,
    transition: 'background-color 160ms ease, color 160ms ease, box-shadow 160ms ease',
  } as const
}

export function PatientContextBar({
  patient,
  latestVitals,
  openTaskCount,
  activeTab,
  onOpenTasks,
  onOpenVitals,
  onOpenNotes,
}: PatientContextBarProps) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        padding: 18,
        borderRadius: 24,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.surface,
        boxShadow: `0 18px 44px ${COLORS.shadow}`,
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
        <div style={{ display: 'grid', gap: 4 }}>
          <div
            style={{
              color: COLORS.textDim,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            Selected patient
          </div>
          <div
            style={{
              color: COLORS.text,
              fontSize: 22,
              fontWeight: 700,
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
            DOB {new Date(patient.dateOfBirth).toLocaleDateString()} · Bed{' '}
            {patient.bed} · {patient.diagnosis}
          </div>
        </div>
        <NEWS2Badge score={patient.news2} />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            borderRadius: 999,
            padding: '6px 10px',
            backgroundColor: COLORS.brandBg,
            color: COLORS.brand,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {openTaskCount} open task{openTaskCount === 1 ? '' : 's'}
        </span>
        <span
          style={{
            borderRadius: 999,
            padding: '6px 10px',
            backgroundColor: COLORS.card,
            color: COLORS.textMuted,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Latest vitals:{' '}
          {latestVitals?.news2Score !== null &&
          latestVitals?.news2Score !== undefined
            ? `NEWS2 ${latestVitals.news2Score}`
            : 'No bedside vitals saved yet'}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={onOpenTasks}
          style={quickActionButtonStyle(activeTab === 'tasks')}
        >
          Open tasks
        </button>
        <button
          onClick={onOpenVitals}
          style={quickActionButtonStyle(activeTab === 'vitals')}
        >
          Record vitals
        </button>
        <button
          onClick={onOpenNotes}
          style={quickActionButtonStyle(activeTab === 'notes')}
        >
          Open notes
        </button>
      </div>
    </div>
  )
}
