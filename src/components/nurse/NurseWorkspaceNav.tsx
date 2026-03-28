import { COLORS } from '@/constants/colors'
import type { NurseWorkspaceTab } from '@/hooks/useNurseTaskBoard'

interface NurseWorkspaceNavProps {
  currentTab: NurseWorkspaceTab
  onTabChange: (tab: NurseWorkspaceTab) => void
  isMobile: boolean
}

const navItems: Array<{
  id: NurseWorkspaceTab
  label: string
  shortLabel: string
}> = [
  { id: 'queue', label: 'Queue', shortLabel: 'Q' },
  { id: 'tasks', label: 'Tasks', shortLabel: 'T' },
  { id: 'vitals', label: 'Vitals', shortLabel: 'V' },
  { id: 'notes', label: 'Notes', shortLabel: 'N' },
  { id: 'patients', label: 'Patients', shortLabel: 'P' },
]

export function NurseWorkspaceNav({
  currentTab,
  onTabChange,
  isMobile,
}: NurseWorkspaceNavProps) {
  return (
    <nav
      style={{
        position: isMobile ? 'sticky' : 'sticky',
        bottom: isMobile ? 14 : 'auto',
        top: isMobile ? 'auto' : 24,
        zIndex: 4,
        display: 'grid',
        gap: 12,
        alignSelf: 'start',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          gap: 10,
          padding: isMobile ? 10 : 12,
          borderRadius: 24,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: 'rgba(248, 251, 249, 0.94)',
          backdropFilter: 'blur(14px)',
          boxShadow: `0 18px 44px ${COLORS.shadowStrong}`,
          overflowX: isMobile ? 'auto' : 'visible',
        }}
      >
        {navItems.map((item) => {
          const isActive = currentTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                minWidth: isMobile ? 72 : 164,
                border: 0,
                borderRadius: 18,
                padding: isMobile ? '12px 10px' : '14px 16px',
                backgroundColor: isActive ? COLORS.brand : COLORS.card,
                color: isActive ? COLORS.onTone : COLORS.text,
                cursor: 'pointer',
                display: 'grid',
                gap: 4,
                justifyItems: isMobile ? 'center' : 'start',
                textAlign: isMobile ? 'center' : 'left',
                boxShadow: isActive
                  ? `0 12px 28px ${COLORS.shadowStrong}`
                  : `0 8px 18px ${COLORS.shadow}`,
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : COLORS.brandBg,
                  color: isActive ? COLORS.onTone : COLORS.brand,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {item.shortLabel}
              </span>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: 0.2,
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
