/**
 * Navigation utilities for cross-platform compatibility
 * Provides a unified API for navigation that works on both web and mobile
 */

import { isWeb } from './platform'

export interface Navigation {
  navigate: (route: string, params?: Record<string, any>) => void
  goBack: () => void
  replace: (route: string, params?: Record<string, any>) => void
}

let navigationInstance: Navigation | null = null

export const setNavigation = (nav: Navigation) => {
  navigationInstance = nav
}

export const getNavigation = (): Navigation | null => {
  return navigationInstance
}

// Web navigation helpers (using react-router-dom)
if (isWeb) {
  // These will be set up when the router is available
  export const useWebNavigation = () => {
    try {
      const { useNavigate, useLocation } = require('react-router-dom')
      const navigate = useNavigate()
      const location = useLocation()

      return {
        navigate: (route: string, params?: Record<string, any>) => {
          navigate(route, { state: params })
        },
        goBack: () => {
          navigate(-1)
        },
        replace: (route: string, params?: Record<string, any>) => {
          navigate(route, { replace: true, state: params })
        },
        currentRoute: location.pathname,
      }
    } catch (e) {
      console.warn('react-router-dom not available')
      return null
    }
  }
}

// Mobile navigation helpers (using React Navigation)
export const useMobileNavigation = () => {
  try {
    const { useNavigation } = require('@react-navigation/native')
    const navigation = useNavigation()

    return {
      navigate: (route: string, params?: Record<string, any>) => {
        // @ts-ignore
        navigation.navigate(route, params)
      },
      goBack: () => {
        navigation.goBack()
      },
      replace: (route: string, params?: Record<string, any>) => {
        // @ts-ignore
        navigation.replace(route, params)
      },
    }
  } catch (e) {
    console.warn('React Navigation not available')
    return null
  }
}

// Unified navigation hook
export const useNavigation = () => {
  if (isWeb) {
    return useWebNavigation()
  } else {
    return useMobileNavigation()
  }
}
