import { COLORS } from '@/constants/colors'

interface OfflineBannerProps {
  isOnline: boolean
}

export function OfflineBanner({ isOnline }: OfflineBannerProps) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: '12px 16px',
        backgroundColor: isOnline ? COLORS.greenBg : COLORS.amberBg,
        border: `1px solid ${isOnline ? COLORS.green : COLORS.amber}`,
        color: COLORS.text,
      }}
    >
      {isOnline
        ? 'Connected. Task actions are saved immediately.'
        : 'Offline mode. Actions stay local on this device and can sync when connectivity returns.'}
    </div>
  )
}
