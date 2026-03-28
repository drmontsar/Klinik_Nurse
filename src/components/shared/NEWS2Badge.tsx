import { COLORS } from '@/constants/colors'

interface NEWS2BadgeProps {
  score: number
}

function getNews2Colors(score: number) {
  if (score >= 7) {
    return { background: COLORS.redBg, color: COLORS.red }
  }

  if (score >= 5) {
    return { background: COLORS.amberBg, color: COLORS.amber }
  }

  if (score >= 1) {
    return { background: COLORS.yellowBg, color: COLORS.yellow }
  }

  return { background: COLORS.greenBg, color: COLORS.green }
}

export function NEWS2Badge({ score }: NEWS2BadgeProps) {
  const badgeColors = getNews2Colors(score)

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        borderRadius: 999,
        padding: '7px 11px',
        backgroundColor: badgeColors.background,
        color: badgeColors.color,
        fontWeight: 700,
        fontSize: 12,
        border: `1px solid ${badgeColors.color}22`,
      }}
    >
      NEWS2 {score}
    </span>
  )
}
