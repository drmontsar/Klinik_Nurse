import { COLORS } from '@/constants/colors'
import { NEWS2Badge } from '@/components/shared/NEWS2Badge'
import type { NurseTask } from '@/types/NurseTask'
import type { Patient } from '@/types/Patient'

interface NurseTaskCardProps {
  task: NurseTask
  patient: Patient
  isSelected: boolean
  onSelect: () => void
}

function getPriorityColor(priority: NurseTask['priority']) {
  switch (priority) {
    case 'critical':
      return COLORS.red
    case 'urgent':
      return COLORS.amber
    case 'soon':
      return COLORS.brandLight
    default:
      return COLORS.textMuted
  }
}

export function NurseTaskCard({
  task,
  patient,
  isSelected,
  onSelect,
}: NurseTaskCardProps) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%',
        border: `1px solid ${
          isSelected ? COLORS.brand : COLORS.border
        }`,
        backgroundColor: isSelected ? COLORS.surface : COLORS.card,
        borderRadius: 24,
        padding: 18,
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: isSelected
          ? `0 22px 46px ${COLORS.shadowStrong}`
          : `0 14px 32px ${COLORS.shadow}`,
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          alignItems: 'flex-start',
          marginBottom: 10,
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
          <div style={{ color: COLORS.textMuted, fontSize: 13 }}>
            Bed {patient.bed} · {task.category}
          </div>
        </div>
        <NEWS2Badge score={patient.news2} />
      </div>

      <div
        style={{
          color: COLORS.text,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {task.title}
      </div>

      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 14,
          lineHeight: 1.5,
          marginBottom: 12,
        }}
      >
        {task.description}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            borderRadius: 999,
            padding: '6px 10px',
            backgroundColor: COLORS.brandBg,
            color: getPriorityColor(task.priority),
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {task.priority}
        </span>
        <span
          style={{
            borderRadius: 999,
            padding: '6px 10px',
            backgroundColor: COLORS.surface,
            color: COLORS.textMuted,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Due {task.dueAt}
        </span>
        <span
          style={{
            borderRadius: 999,
            padding: '6px 10px',
            backgroundColor: COLORS.surface,
            color: COLORS.textMuted,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {task.status}
        </span>
      </div>

      <div
        style={{
          marginTop: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          color: isSelected ? COLORS.brand : COLORS.textDim,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.2,
          textTransform: 'uppercase',
        }}
      >
        <span>{isSelected ? 'Task open' : 'Click to open task'}</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: isSelected ? COLORS.brandBg : COLORS.surface,
            color: isSelected ? COLORS.brand : COLORS.textMuted,
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          →
        </span>
      </div>
    </button>
  )
}
