import { useState, useEffect, useCallback } from 'react'
import { db, isOfflineMode } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { storage } from '@/lib/storage'
import type { Solve } from '@/types'

export type { Solve }

const STORAGE_KEY = 'cube-solves'

async function loadLocalSolves(): Promise<Solve[]> {
  try {
    const stored = await storage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load solves from storage:', e)
  }
  return []
}

async function saveLocalSolves(solves: Solve[]) {
  try {
    await storage.setItem(STORAGE_KEY, JSON.stringify(solves))
  } catch (e) {
    console.error('Failed to save solves to storage:', e)
  }
}

function calculateStats(solves: Solve[]) {
  const validSolves = solves.filter((s) => !s.dnf)
  if (validSolves.length === 0) {
    return { best: null, worst: null, average: null, ao5: null, ao12: null }
  }

  const times = validSolves.map((s) => (s.plusTwo ? s.time + 2000 : s.time))
  const sorted = [...times].sort((a, b) => a - b)

  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  const average = times.reduce((a, b) => a + b, 0) / times.length

  const calcAverage = (count: number) => {
    if (validSolves.length < count) return null
    const recent = times.slice(0, count)
    const sortedRecent = [...recent].sort((a, b) => a - b)
    const trimmed = sortedRecent.slice(1, -1)
    return trimmed.reduce((a, b) => a + b, 0) / trimmed.length
  }

  return {
    best,
    worst,
    average,
    ao5: calcAverage(5),
    ao12: calcAverage(12),
  }
}

export function useSolves() {
  const { user } = useAuth()
  const [solves, setSolves] = useState<Solve[]>([])
  const [loading, setLoading] = useState(true)

  const useLocalStorage = isOfflineMode || !user || !db

  useEffect(() => {
    if (useLocalStorage) {
      loadLocalSolves().then((loaded) => {
        setSolves(loaded)
        setLoading(false)
      })
      return
    }

    if (!db) {
      setLoading(false)
      return
    }

    const solvesRef = db.collection('users').doc(user!.uid).collection('solves')
    const unsubscribe = solvesRef
      .orderBy('date', 'desc')
      .onSnapshot(
        (snapshot) => {
          const newSolves = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Solve[]
          setSolves(newSolves)
          setLoading(false)
        },
        (error) => {
          console.error('Failed to fetch solves from Firestore:', error)
          loadLocalSolves().then((loaded) => {
            setSolves(loaded)
            setLoading(false)
          })
        }
      )

    return () => unsubscribe()
  }, [user, useLocalStorage])

  useEffect(() => {
    if (useLocalStorage && !loading) {
      saveLocalSolves(solves)
    }
  }, [solves, useLocalStorage, loading])

  const addSolve = useCallback(
    async (solve: Omit<Solve, 'id' | 'date'>) => {
      const newSolveData = {
        ...solve,
        date: new Date().toISOString(),
      }

      const cleanData = Object.fromEntries(
        Object.entries(newSolveData).filter(([_, v]) => v !== undefined)
      )

      if (useLocalStorage || !db) {
        const newSolve: Solve = {
          ...newSolveData,
          id: Math.random().toString(36).substring(7),
        }
        setSolves((prev) => [newSolve, ...prev])
        return newSolve
      }

      try {
        const solvesRef = db!.collection('users').doc(user!.uid).collection('solves')
        const newDocRef = solvesRef.doc()
        const solveWithId = { ...cleanData, solveId: newDocRef.id }
        await newDocRef.set(solveWithId)
        return { ...newSolveData, id: newDocRef.id } as Solve
      } catch (error) {
        console.error('Failed to save solve to Firestore:', error)
        const newSolve: Solve = {
          ...newSolveData,
          id: Math.random().toString(36).substring(7),
        }
        setSolves((prev) => [newSolve, ...prev])
        return newSolve
      }
    },
    [user, useLocalStorage]
  )

  const deleteSolve = useCallback(
    async (id: string) => {
      if (useLocalStorage || !db) {
        setSolves((prev) => prev.filter((s) => s.id !== id))
        return
      }

      try {
        const solveRef = db!.collection('users').doc(user!.uid).collection('solves').doc(id)
        await solveRef.delete()
      } catch (error) {
        console.error('Failed to delete solve from Firestore:', error)
        setSolves((prev) => prev.filter((s) => s.id !== id))
      }
    },
    [user, useLocalStorage]
  )

  const updateSolve = useCallback(
    async (id: string, updates: Partial<Solve>) => {
      if (useLocalStorage || !db) {
        setSolves((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
        )
        return
      }

      try {
        const solveRef = db!.collection('users').doc(user!.uid).collection('solves').doc(id)
        await solveRef.update(updates)
      } catch (error) {
        console.error('Failed to update solve in Firestore:', error)
        setSolves((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
        )
      }
    },
    [user, useLocalStorage]
  )

  const migrateLocalToCloud = useCallback(async () => {
    if (!user || useLocalStorage || !db) return

    const localSolves = await loadLocalSolves()
    if (localSolves.length === 0) return

    try {
      const batch = db!.batch()
      const solvesRef = db!.collection('users').doc(user.uid).collection('solves')

      localSolves.forEach((solve) => {
        const docRef = solvesRef.doc(solve.id)
        batch.set(docRef, solve)
      })

      await batch.commit()
      await storage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to migrate solves to cloud:', error)
      throw error
    }
  }, [user, useLocalStorage])

  const stats = calculateStats(solves)
  const isCloudSync = !useLocalStorage

  return {
    solves,
    loading,
    addSolve,
    deleteSolve,
    updateSolve,
    migrateLocalToCloud,
    stats,
    isCloudSync,
  }
}
