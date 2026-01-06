import { isWeb } from '@/lib/platform'

// Platform-specific routing
let AppRootComponent: () => JSX.Element

if (isWeb) {
  // Web: Use react-router-dom
  const { Routes, Route, Navigate } = require('react-router-dom')
  const { LandingPage } = require('@/pages/LandingPage')
  const { InProgressPage } = require('@/pages/InProgressPage')
  const { TimerApp } = require('@/App')

  function SolveRedirect() {
    const path = window.location.pathname.replace(/^\/solve/, '/app/solve')
    return <Navigate to={path} replace />
  }

  AppRootComponent = function AppRoot() {
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
} else {
  // Mobile: Use React Navigation
  const { AppNavigator } = require('@/navigation/AppNavigator')

  AppRootComponent = function AppRoot() {
    return <AppNavigator />
  }
}

export const AppRoot = AppRootComponent
