import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 1024

export function useViewportMode() {
  const [isMobile, setIsMobile] = useState(
    typeof window === 'undefined'
      ? false
      : window.innerWidth < MOBILE_BREAKPOINT,
  )

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return { isMobile }
}
