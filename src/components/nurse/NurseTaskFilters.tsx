import type { CSSProperties } from 'react'
import { COLORS } from '@/constants/colors'
import type {
  TaskCategoryFilter,
  TaskStatusFilter,
} from '@/hooks/useNurseTaskBoard'

interface NurseTaskFiltersProps {
  searchQuery: string
  statusFilter: TaskStatusFilter
  categoryFilter: TaskCategoryFilter
  searchPlaceholder?: string
  showStatusFilter?: boolean
  showCategoryFilter?: boolean
  onSearchChange: (value: string) => void
  onStatusChange: (value: TaskStatusFilter) => void
  onCategoryChange: (value: TaskCategoryFilter) => void
}

const inputStyle: CSSProperties = {
  borderRadius: 14,
  border: `1px solid ${COLORS.border}`,
  backgroundColor: COLORS.card,
  color: COLORS.text,
  padding: '12px 14px',
  minWidth: 0,
  boxSizing: 'border-box',
  outline: 'none',
  boxShadow: `0 8px 22px ${COLORS.shadow}`,
}

export function NurseTaskFilters({
  searchQuery,
  statusFilter,
  categoryFilter,
  searchPlaceholder = 'Search patient, bed, or task',
  showStatusFilter = true,
  showCategoryFilter = true,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
}: NurseTaskFiltersProps) {
  const gridTemplateColumns =
    showStatusFilter || showCategoryFilter
      ? 'repeat(auto-fit, minmax(180px, 1fr))'
      : 'minmax(0, 1fr)'

  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns,
        padding: 14,
        borderRadius: 22,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.surface,
        boxShadow: `0 18px 44px ${COLORS.shadow}`,
      }}
    >
      <input
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        style={inputStyle}
      />
      {showStatusFilter ? (
        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusChange(event.target.value as TaskStatusFilter)
          }
          style={inputStyle}
        >
          <option value="open">Open tasks</option>
          <option value="all">All tasks</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="deferred">Deferred</option>
          <option value="escalated">Escalated</option>
        </select>
      ) : null}
      {showCategoryFilter ? (
        <select
          value={categoryFilter}
          onChange={(event) =>
            onCategoryChange(event.target.value as TaskCategoryFilter)
          }
          style={inputStyle}
        >
          <option value="all">All categories</option>
          <option value="vitals">Vitals</option>
          <option value="medication">Medication</option>
          <option value="nursing">Nursing</option>
          <option value="investigation-followup">Follow-up</option>
        </select>
      ) : null}
    </div>
  )
}
