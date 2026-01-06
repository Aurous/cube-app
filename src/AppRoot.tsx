import { isWeb } from '@/lib/platform'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { InProgressPage } from '@/pages/InProgressPage'
import { TimerApp } from '@/App'
// Import AppNavigator - Vite will alias this to .web.tsx on web builds
// Metro will use the regular .tsx file for mobile builds
import { AppNavigator } from '@/navigation/AppNavigator'

// Platform-specific routing
function SolveRedirect() {
  if (typeof window === 'undefined') return null
  const path = window.location.pathname.replace(/^\/solve/, '/app/solve')
  return <Navigate to={path} replace />
}

export function AppRoot() {
  // On web, use react-router-dom
  if (isWeb) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<InProgressPage />} />
        <Route path="/terms" element={<InProgressPage />} />
        <Route path="/changelog" element={<InProgressPage />} />
        <Route path="/docs" element={<InProgressPage />} />
        <Route path="/solve/*" element={<SolveRedirect />} />
        <Route path="/app/*" element={<TimerApp />} />
      </Routes>
    )
  }

  // On mobile, use React Navigation
  // The AppNavigator import will resolve to the full implementation on mobile
  // and to the web stub on web (via Vite alias)
  return <AppNavigator />
}
