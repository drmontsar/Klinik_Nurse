import { COLORS } from '@/constants/colors'

interface OfflineBannerProps {
  isOnline: boolean
  compact?: boolean
}

export function OfflineBanner({
  isOnline,
  compact = false,
}: OfflineBannerProps) {
  const accentColor = isOnline ? COLORS.green : COLORS.amber
  const accentBackground = isOnline ? COLORS.greenBg : COLORS.amberBg

  return (
    <div
      style={{
        borderRadius: 20,
        padding: compact ? '9px 12px' : '14px 18px',
        backgroundColor: accentBackground,
        border: `1px solid ${accentColor}`,
        color: COLORS.text,
        boxShadow: `0 14px 30px ${COLORS.shadow}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        maxWidth: compact ? 'fit-content' : '100%',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: accentColor,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontWeight: 700,
          fontSize: compact ? 12 : 14,
          letterSpacing: compact ? 0.2 : 0,
          color: COLORS.text,
        }}
      >
        {isOnline ? 'Connected' : 'Offline'}
      </span>
      {!compact ? (
        <span style={{ color: COLORS.textMuted }}>
          {isOnline
            ? 'Actions feel instant and stay safely recorded.'
            : 'Actions stay local on this device and can sync when connectivity returns.'}
        </span>
      ) : null}
    </div>
  )
}
