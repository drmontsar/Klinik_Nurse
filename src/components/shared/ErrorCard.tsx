import { COLORS } from '@/constants/colors'

interface ErrorCardProps {
  message: string
  onRetry?: () => void
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div
      style={{
        border: `1px solid ${COLORS.red}`,
        backgroundColor: COLORS.redBg,
        borderRadius: 18,
        padding: 16,
        color: COLORS.text,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        Something needs attention
      </div>
      <div style={{ color: COLORS.textMuted, marginBottom: onRetry ? 12 : 0 }}>
        {message}
      </div>
      {onRetry ? (
        <button
          onClick={onRetry}
          style={{
            border: 0,
            borderRadius: 999,
            padding: '10px 14px',
            backgroundColor: COLORS.red,
            color: COLORS.text,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}
