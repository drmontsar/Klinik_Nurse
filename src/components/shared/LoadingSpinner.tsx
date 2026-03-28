import { COLORS } from '@/constants/colors'

export function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        color: COLORS.textMuted,
      }}
    >
      Loading nurse board...
    </div>
  )
}
