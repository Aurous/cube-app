import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { db, isOfflineMode } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { storage } from '@/lib/storage'
import {
  type CFOPGoals,
  type GoalCheckResult,
  DEFAULT_GOALS,
  GOAL_PRESETS,
} from '@/types/goals'

const STORAGE_KEY = 'cube-cfop-goals'

interface GoalsContextType {
  goals: CFOPGoals
  preset: string | null
  totalTime: number | null
  loading: boolean
  setGoals: (goals: CFOPGoals, preset?: string | null, totalTime?: number | null) => Promise<void>
  applyPreset: (presetName: string) => Promise<void>
  checkPhaseGoal: (phase: keyof CFOPGoals, moves: number, time: number) => GoalCheckResult
  checkTotalTimeGoal: (time: number) => boolean
}

const GoalsContext = createContext<GoalsContextType | null>(null)

async function loadLocalGoals(): Promise<{ goals: CFOPGoals; preset: string | null; totalTime: number | null }> {
  try {
    const stored = await storage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { 
        goals: parsed.goals || DEFAULT_GOALS, 
        preset: parsed.preset || null,
        totalTime: parsed.totalTime ?? null,
      }
    }
  } catch {
    console.error('Failed to load goals from storage')
  }
  return { goals: DEFAULT_GOALS, preset: 'intermediate', totalTime: null }
}

async function saveLocalGoals(goals: CFOPGoals, preset: string | null, totalTime: number | null) {
  try {
    await storage.setItem(STORAGE_KEY, JSON.stringify({ goals, preset, totalTime }))
  } catch {
    console.error('Failed to save goals to storage')
  }
}

export function GoalsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [goals, setGoalsState] = useState<CFOPGoals>(DEFAULT_GOALS)
  const [preset, setPreset] = useState<string | null>('intermediate')
  const [totalTime, setTotalTime] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const isGuest = isOfflineMode || !user || !db

  useEffect(() => {
    if (isGuest || !db) {
      loadLocalGoals().then((local) => {
        setGoalsState(local.goals)
        setPreset(local.preset)
        setTotalTime(local.totalTime)
        setLoading(false)
      })
      return
    }

    const userDocRef = db.collection('users').doc(user!.uid)

    const unsubscribe = userDocRef.onSnapshot(
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          if (data?.cfopGoals) {
            setGoalsState(data.cfopGoals.goals || DEFAULT_GOALS)
            setPreset(data.cfopGoals.preset || null)
            setTotalTime(data.cfopGoals.totalTime ?? null)
          }
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error listening to goals:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, isGuest, db])

  const setGoals = useCallback(
    async (newGoals: CFOPGoals, newPreset: string | null = null, newTotalTime: number | null = null) => {
      setGoalsState(newGoals)
      setPreset(newPreset)
      setTotalTime(newTotalTime)

      if (isGuest || !db) {
        await saveLocalGoals(newGoals, newPreset, newTotalTime)
        return
      }

      try {
        const userDocRef = db.collection('users').doc(user!.uid)
        await userDocRef.update({
          cfopGoals: { goals: newGoals, preset: newPreset, totalTime: newTotalTime },
        })
      } catch (error) {
        console.error('Failed to save goals to Firebase:', error)
        await saveLocalGoals(newGoals, newPreset, newTotalTime)
      }
    },
    [user, isGuest, db]
  )

  const applyPreset = useCallback(
    async (presetName: string) => {
      const presetGoals = GOAL_PRESETS[presetName]
      if (presetGoals) {
        await setGoals(presetGoals, presetName)
      }
    },
    [setGoals]
  )

  const checkPhaseGoal = useCallback(
    (phase: keyof CFOPGoals, moves: number, time: number): GoalCheckResult => {
      const goal = goals[phase]
      const movesMet = moves <= goal.moves
      const timeMet = time <= goal.time
      return {
        movesMet,
        timeMet,
        eitherMet: movesMet || timeMet,
      }
    },
    [goals]
  )

  const checkTotalTimeGoal = useCallback(
    (time: number): boolean => {
      if (totalTime === null) return false
      return time <= totalTime
    },
    [totalTime]
  )

  return (
    <GoalsContext.Provider
      value={{
        goals,
        preset,
        totalTime,
        loading,
        setGoals,
        applyPreset,
        checkPhaseGoal,
        checkTotalTimeGoal,
      }}
    >
      {children}
    </GoalsContext.Provider>
  )
}

export function useGoals() {
  const context = useContext(GoalsContext)
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider')
  }
  return context
}
