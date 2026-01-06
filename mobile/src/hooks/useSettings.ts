import { useState, useEffect, useCallback, useRef } from 'react'
import { applyTheme, type CubeTheme } from '@/lib/themes'
import { storage } from '@/lib/storage'

export type InspectionTime = 'none' | '15' | '30' | '60' | 'custom'
export type TimerLayoutMode = 'minimal' | 'detailed'

export interface AppSettings {
  animationSpeed: number
  gyroEnabled: boolean
  theme: string
  cubeTheme: CubeTheme
  inspectionTime: InspectionTime
  customInspectionTime: number
  holdThreshold: number
  timerLayoutMode: TimerLayoutMode
  showStatsWidget: boolean
}

const STORAGE_KEY = 'cube-settings'

const DEFAULT_SETTINGS: AppSettings = {
  animationSpeed: 15,
  gyroEnabled: true,
  theme: 'kitsune',
  cubeTheme: 'current',
  inspectionTime: 'none',
  customInspectionTime: 15,
  holdThreshold: 300,
  timerLayoutMode: 'detailed',
  showStatsWidget: true,
}

async function loadSettings(): Promise<AppSettings> {
  try {
    const stored = await storage.getItem(STORAGE_KEY)
    if (stored) {
      const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      applyTheme(settings.theme)
      return settings
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
  applyTheme(DEFAULT_SETTINGS.theme)
  return DEFAULT_SETTINGS
}

async function saveSettings(settings: AppSettings) {
  try {
    await storage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const isLocalUpdateRef = useRef(false)

  useEffect(() => {
    loadSettings().then((loaded) => {
      setSettings(loaded)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (isLocalUpdateRef.current && !isLoading) {
      saveSettings(settings)
      isLocalUpdateRef.current = false
    }
  }, [settings, isLoading])

  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      isLocalUpdateRef.current = true
      setSettings((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const resetSettings = useCallback(() => {
    isLocalUpdateRef.current = true
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    settings,
    updateSetting,
    resetSettings,
    isLoading,
  }
}
