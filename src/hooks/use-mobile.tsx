
import * as React from "react"

// Define breakpoints for more granular device detection
const MOBILE_BREAKPOINT = 640
const TABLET_BREAKPOINT = 1024
const DESKTOP_BREAKPOINT = 1280
const LARGE_DESKTOP_BREAKPOINT = 1536

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    window.addEventListener('resize', handleResize)
    handleResize() // Initial check
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return !!isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }
    
    window.addEventListener('resize', handleResize)
    handleResize() // Initial check
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return !!isTablet
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsDesktop(width >= TABLET_BREAKPOINT && width < DESKTOP_BREAKPOINT)
    }
    
    window.addEventListener('resize', handleResize)
    handleResize() // Initial check
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return !!isDesktop
}

export function useIsLargeDesktop() {
  const [isLargeDesktop, setIsLargeDesktop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const handleResize = () => {
      setIsLargeDesktop(window.innerWidth >= DESKTOP_BREAKPOINT)
    }
    
    window.addEventListener('resize', handleResize)
    handleResize() // Initial check
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return !!isLargeDesktop
}

export function useDeviceType() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const isLargeDesktop = useIsLargeDesktop()
  
  return { isMobile, isTablet, isDesktop, isLargeDesktop }
}

// Function to get current device type without hooks (for static contexts)
export function getDeviceType() {
  if (typeof window === 'undefined') return 'unknown'
  
  const width = window.innerWidth
  
  if (width < MOBILE_BREAKPOINT) return 'mobile'
  if (width < TABLET_BREAKPOINT) return 'tablet'
  if (width < DESKTOP_BREAKPOINT) return 'desktop'
  return 'largeDesktop'
}
