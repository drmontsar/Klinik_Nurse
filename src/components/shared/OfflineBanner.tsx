import { COLORS } from '@/constants/colors'

interface OfflineBannerProps {
  isOnline: boolean
}

export function OfflineBanner({ isOnline }: OfflineBannerProps) {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: '14px 18px',
        backgroundColor: isOnline ? COLORS.greenBg : COLORS.amberBg,
        border: `1px solid ${isOnline ? COLORS.green : COLORS.amber}`,
        color: COLORS.text,
        boxShadow: `0 14px 30px ${COLORS.shadow}`,
      }}
    >
      {isOnline
        ? 'Connected. Actions feel instant and stay safely recorded.'
        : 'Offline mode. Actions stay local on this device and can sync when connectivity returns.'}
    </div>
  )
}
