import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSolveSession } from '@/contexts/SolveSessionContext'
import { useSolves } from '@/hooks/useSolves'
import { useSettings } from '@/hooks/useSettings'
import { useScrambleTracker } from '@/hooks/useScrambleTracker'
import { generateScramble } from '@/lib/cube-state'
import type { Solve } from '@/hooks/useSolves'

function formatTimeDisplay(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const centiseconds = Math.floor((ms % 1000) / 10)

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }
  return `${seconds}.${centiseconds.toString().padStart(2, '0')}`
}

function MoveNotation({ move, status }: { move: string; status: 'pending' | 'current' | 'completed' | 'recovery' }) {
  const isCurrent = status === 'current'
  const isCompleted = status === 'completed'
  const isRecovery = status === 'recovery'
  
  const getColor = () => {
    if (isRecovery) return '#ef4444'
    if (isCurrent) return '#f97316'
    if (isCompleted) return '#f97316'
    return '#fff'
  }

  const getStyle = () => {
    if (isCurrent || isRecovery) {
      return { color: getColor(), fontWeight: 'bold' as const, transform: [{ scale: 1.15 }] }
    }
    return { color: getColor(), opacity: isCompleted ? 0.6 : 0.7 }
  }

  return (
    <Text style={[styles.scrambleMove, getStyle()]}>
      {move}
    </Text>
  )
}

function ScrambleNotation({ 
  trackerState, 
  timerStatus, 
  isManual, 
  manualScramble, 
  isRepeatedScramble,
  inspectionRemaining 
}: {
  trackerState: ReturnType<typeof useScrambleTracker>['state']
  timerStatus: 'idle' | 'inspection' | 'running' | 'stopped'
  isManual?: boolean
  manualScramble?: string
  isRepeatedScramble?: boolean
  inspectionRemaining?: number
}) {
  const { status, moves, originalScramble, recoveryMoves, shouldResetCube } = trackerState
  const isScrambling = status === 'scrambling'
  const isDiverged = status === 'diverged'
  const showScrambleMoves = isScrambling || isDiverged
  const isInspection = timerStatus === 'inspection'
  const hasInspectionCountdown = isInspection && inspectionRemaining && inspectionRemaining > 0
  const inspectionSeconds = inspectionRemaining ? Math.ceil(inspectionRemaining / 1000) : 0
  const isRunning = timerStatus === 'running'
  const isStopped = timerStatus === 'stopped'

  if (isManual && manualScramble) {
    const manualMoves = manualScramble.split(' ').filter(Boolean)
    return (
      <View style={styles.scrambleContainer}>
        {isRepeatedScramble && !isRunning && !isStopped && (
          <Text style={styles.repeatedWarning}>
            ⚠️ Repeated scramble — XP and achievements will not be awarded
          </Text>
        )}
        <View style={styles.scrambleMoves}>
          {manualMoves.map((move, i) => (
            <Text key={i} style={[styles.scrambleMove, styles.scrambleMoveManual]}>
              {move}
            </Text>
          ))}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.scrambleContainer}>
      {isRepeatedScramble && !isRunning && !isStopped && (
        <Text style={styles.repeatedWarning}>
          ⚠️ Repeated scramble — XP and achievements will not be awarded
        </Text>
      )}
      
      {!originalScramble && status === 'idle' && (
        <Text style={styles.generatingText}>generating...</Text>
      )}

      {showScrambleMoves && (
        <View style={styles.scrambleMoves}>
          {isDiverged && !shouldResetCube && recoveryMoves.length > 0 ? (
            <>
              <Text style={styles.recoveryLabel}>undo:</Text>
              {recoveryMoves.map((move, i) => (
                <Text key={`recovery-${i}`} style={[styles.scrambleMove, styles.recoveryMove]}>
                  {move.original}
                </Text>
              ))}
            </>
          ) : (
            moves.map((moveState, i) => (
              <MoveNotation
                key={`move-${i}`}
                move={moveState.move.original}
                status={moveState.status}
              />
            ))
          )}
        </View>
      )}

      {shouldResetCube && (
        <Text style={styles.resetWarning}>
          solve cube to restart scramble
        </Text>
      )}

      {(status === 'completed' || status === 'solving') && isInspection && (
        <View style={styles.inspectionContainer}>
          {hasInspectionCountdown ? (
            <>
              <Text style={[
                styles.inspectionTime,
                inspectionSeconds <= 3 && styles.inspectionTimeRed,
                inspectionSeconds > 3 && inspectionSeconds <= 8 && styles.inspectionTimeOrange,
              ]}>
                {inspectionSeconds}
              </Text>
              <Text style={styles.inspectionHint}>make a move to start</Text>
            </>
          ) : (
            <Text style={styles.inspectionText}>inspecting...</Text>
          )}
        </View>
      )}

      {isRunning && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Solving...</Text>
        </View>
      )}

      {isStopped && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Solved!</Text>
        </View>
      )}
    </View>
  )
}

function TimerDisplay({ 
  time, 
  status, 
  inspectionRemaining,
  isManual,
}: { 
  time: number
  status: 'idle' | 'inspection' | 'running' | 'stopped' | 'holding' | 'ready'
  inspectionRemaining?: number
  isManual?: boolean
}) {
  const inspectionSeconds = inspectionRemaining ? Math.ceil(inspectionRemaining / 1000) : 0
  const isInspection = status === 'inspection' && inspectionRemaining && inspectionRemaining > 0
  const isHolding = status === 'holding'
  const isReady = status === 'ready'
  
  const getColor = () => {
    if (status === 'running') return '#22c55e'
    if (status === 'stopped') return '#3b82f6'
    if (isHolding) return '#fff'
    if (isReady) return '#f97316'
    if (isInspection) {
      if (inspectionSeconds <= 3) return '#ef4444'
      if (inspectionSeconds <= 8) return '#f97316'
      return '#eab308'
    }
    return '#fff'
  }

  const getStatusText = () => {
    if (isInspection) return 'Make a move to start'
    if (status === 'inspection') return 'Inspecting...'
    if (isHolding) return 'keep holding...'
    if (isReady) return 'release to start!'
    if (status === 'running') return 'Solving...'
    if (status === 'stopped') return 'Solved!'
    return isManual ? 'hold to start' : 'Ready'
  }

  const displayTime = isInspection ? inspectionSeconds.toString() : formatTimeDisplay(time)
  const scale = isHolding ? 1.05 : isReady ? 1.08 : 1

  return (
    <View style={styles.timerDisplayContainer}>
      <Text style={[styles.timerDisplayText, { color: getColor(), transform: [{ scale }] }]}>
        {displayTime}
      </Text>
      <Text style={styles.timerStatusText}>{getStatusText()}</Text>
    </View>
  )
}

function SolveResults({
  time,
  moves,
  onNextScramble,
  onRepeatScramble,
  onViewStats,
  onDelete,
}: {
  time: number
  moves: number
  onNextScramble: () => void
  onRepeatScramble: () => void
  onViewStats: () => void
  onDelete: () => void
}) {
  const tps = time > 0 ? ((moves / time) * 1000).toFixed(2) : '0.00'

  return (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>Solve Complete!</Text>
      <Text style={styles.resultsTime}>{formatTimeDisplay(time)}</Text>
      <View style={styles.resultsStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Moves</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>TPS</Text>
          <Text style={styles.statValue}>{tps}</Text>
        </View>
      </View>
      <View style={styles.resultsActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onNextScramble}>
          <Text style={styles.actionButtonText}>Next Scramble</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]} onPress={onRepeatScramble}>
          <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Repeat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]} onPress={onViewStats}>
          <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonDanger]} onPress={onDelete}>
          <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function StatsWidget({ solves }: { solves: Solve[] }) {
  const stats = useMemo(() => {
    const validSolves = solves.filter(s => !s.dnf)
    if (validSolves.length === 0) {
      return { best: null, ao5: null, ao12: null, count: 0 }
    }

    const times = validSolves.map(s => s.plusTwo ? s.time + 2000 : s.time)
    const sorted = [...times].sort((a, b) => a - b)
    const best = sorted[0]

    const calcAo = (n: number) => {
      if (times.length < n) return null
      const lastN = times.slice(0, n)
      const sorted = [...lastN].sort((a, b) => a - b)
      const trimmed = sorted.slice(1, -1)
      return trimmed.reduce((a, b) => a + b, 0) / trimmed.length
    }

    return {
      best,
      ao5: calcAo(5),
      ao12: calcAo(12),
      count: solves.length,
    }
  }, [solves])

  return (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>PB</Text>
          <Text style={styles.statCardValue}>
            {stats.best ? formatTimeDisplay(stats.best) : '-'}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>ao5</Text>
          <Text style={styles.statCardValue}>
            {stats.ao5 ? formatTimeDisplay(stats.ao5) : '-'}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>ao12</Text>
          <Text style={styles.statCardValue}>
            {stats.ao12 ? formatTimeDisplay(stats.ao12) : '-'}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>Count</Text>
          <Text style={styles.statCardValue}>{stats.count}</Text>
        </View>
      </View>
    </View>
  )
}

function RecentSolves({ solves }: { solves: Solve[] }) {
  const recent = useMemo(() => solves.slice(0, 5), [solves])

  if (recent.length === 0) return null

  return (
    <View style={styles.recentContainer}>
      <Text style={styles.recentTitle}>Recent</Text>
      {recent.map((solve, i) => (
        <View key={solve.id} style={styles.recentItem}>
          <Text style={styles.recentNumber}>#{solves.length - i}</Text>
          <Text style={styles.recentTime}>{formatTimeDisplay(solve.time)}</Text>
          {solve.isManual && (
            <Text style={styles.manualBadge}>M</Text>
          )}
        </View>
      ))}
    </View>
  )
}

export default function TimerScreen() {
  const navigation = useNavigation()
  const { 
    timer, 
    manualTimer,
    scramble,
    lastSolveTime,
    lastMoveCount,
    lastScramble,
    isRepeatedScramble,
    manualTimerEnabled,
    setScramble,
    setRepeatedScramble,
    resetSolveSession,
    saveSolve,
  } = useSolveSession()
  const { solves, deleteSolve } = useSolves()
  const { settings } = useSettings()
  const { state: scrambleState, setScramble: setTrackerScramble } = useScrambleTracker()
  
  const [manualScramble, setManualScramble] = useState('')
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartTimeRef = useRef<number>(0)

  const activeTimer = manualTimerEnabled ? manualTimer : timer
  const showResults = (timer.status === 'stopped' || manualTimer.status === 'stopped') && lastSolveTime > 0

  // Generate initial scramble
  useEffect(() => {
    const initScramble = async () => {
      const scrambleAlg = await generateScramble()
      setScramble(scrambleAlg)
      setTrackerScramble(scrambleAlg)
      setManualScramble(scrambleAlg)
    }
    if (!scramble) {
      initScramble()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle scramble trigger
  useEffect(() => {
    const handleNewScramble = async () => {
      setRepeatedScramble(false)
      resetSolveSession()
      const scrambleAlg = await generateScramble()
      setScramble(scrambleAlg)
      setTrackerScramble(scrambleAlg)
      setManualScramble(scrambleAlg)
    }
    if (scrambleState.status === 'idle' && !scramble) {
      handleNewScramble()
    }
  }, [scramble, setScramble, setTrackerScramble, setRepeatedScramble, resetSolveSession, scrambleState.status])

  // Handle manual timer completion
  useEffect(() => {
    if (manualTimer.status === 'stopped' && manualTimerEnabled && manualScramble && !showResults) {
      saveSolve({
        time: manualTimer.time,
        scramble: manualScramble,
        solution: [],
        isManual: true,
      })
    }
  }, [manualTimer.status, manualTimer.time, manualTimerEnabled, manualScramble, showResults, saveSolve])

  // Handle scramble completion -> start inspection
  useEffect(() => {
    if (scrambleState.status === 'completed' && timer.status === 'idle') {
      timer.startInspection()
    }
  }, [scrambleState.status, timer])

  const handleNewScramble = useCallback(async () => {
    setRepeatedScramble(false)
    resetSolveSession()
    const scrambleAlg = await generateScramble()
    setScramble(scrambleAlg)
    setTrackerScramble(scrambleAlg)
    setManualScramble(scrambleAlg)
  }, [setScramble, setTrackerScramble, setRepeatedScramble, resetSolveSession])

  const handleRepeatScramble = useCallback(() => {
    if (!lastScramble) return
    setRepeatedScramble(true)
    resetSolveSession()
    setScramble(lastScramble)
    setTrackerScramble(lastScramble)
    setManualScramble(lastScramble)
  }, [lastScramble, setScramble, setTrackerScramble, setRepeatedScramble, resetSolveSession])

  const handleViewStats = useCallback(() => {
    if (solves.length > 0) {
      // @ts-expect-error - navigation type issue
      navigation.navigate('SolveDetail', { solveId: solves[0].id })
    }
  }, [navigation, solves])

  const handleDelete = useCallback(() => {
    if (solves.length > 0) {
      Alert.alert(
        'Delete Solve',
        'Are you sure you want to delete this solve?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteSolve(solves[0].id)
              handleNewScramble()
            },
          },
        ]
      )
    }
  }, [solves, deleteSolve, handleNewScramble])

  // Manual timer touch handlers
  const handleTouchStart = useCallback(() => {
    if (!manualTimerEnabled) return
    
    const currentStatus = manualTimer.status
    
    if (currentStatus === 'idle') {
      touchStartTimeRef.current = Date.now()
      holdTimeoutRef.current = setTimeout(() => {
        // Status will be updated by the hook
      }, settings.holdThreshold || 300)
    } else if (currentStatus === 'inspection') {
      touchStartTimeRef.current = Date.now()
      holdTimeoutRef.current = setTimeout(() => {
        // Status will be updated by the hook
      }, settings.holdThreshold || 300)
    } else if (currentStatus === 'running') {
      // Stop will be handled by the hook
    } else if (currentStatus === 'stopped') {
      handleNewScramble()
    }
  }, [manualTimerEnabled, manualTimer.status, settings.holdThreshold, handleNewScramble])

  const handleTouchEnd = useCallback(() => {
    if (!manualTimerEnabled) return
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current)
      holdTimeoutRef.current = null
    }
  }, [manualTimerEnabled])

  // Normal timer - start on any touch during inspection
  const handleTimerTouch = useCallback(() => {
    if (manualTimerEnabled) return
    
    if (timer.status === 'inspection') {
      timer.startTimer()
    } else if (timer.status === 'running') {
      timer.stopTimer()
    }
  }, [timer, manualTimerEnabled])

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.touchArea}
        onPress={handleTimerTouch}
        onPressIn={handleTouchStart}
        onPressOut={handleTouchEnd}
        disabled={showResults}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={showResults}
        >
          {showResults ? (
            <SolveResults
              time={lastSolveTime}
              moves={lastMoveCount}
              onNextScramble={handleNewScramble}
              onRepeatScramble={handleRepeatScramble}
              onViewStats={handleViewStats}
              onDelete={handleDelete}
            />
          ) : (
            <>
              <ScrambleNotation
                trackerState={scrambleState}
                timerStatus={activeTimer.status === 'holding' || activeTimer.status === 'ready' ? 'idle' : activeTimer.status}
                isManual={manualTimerEnabled}
                manualScramble={manualScramble}
                isRepeatedScramble={isRepeatedScramble}
                inspectionRemaining={activeTimer.inspectionRemaining}
              />
              
              <TimerDisplay
                time={activeTimer.time}
                status={activeTimer.status}
                inspectionRemaining={activeTimer.inspectionRemaining}
                isManual={manualTimerEnabled}
              />

              {manualTimerEnabled && (
                <View style={styles.manualTimerNote}>
                  <Text style={styles.manualTimerNoteText}>
                    Hold screen to start, release to begin solving
                  </Text>
                </View>
              )}

              <StatsWidget solves={solves} />
              <RecentSolves solves={solves} />
            </>
          )}
        </ScrollView>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  touchArea: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
    justifyContent: 'center',
  },
  scrambleContainer: {
    marginBottom: 24,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatedWarning: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  generatingText: {
    fontSize: 18,
    color: '#999',
    letterSpacing: 4,
  },
  scrambleMoves: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  scrambleMove: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'monospace',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    minWidth: 40,
    textAlign: 'center',
  },
  scrambleMoveManual: {
    fontWeight: 'bold',
    color: '#f97316',
  },
  recoveryLabel: {
    fontSize: 12,
    color: '#ef4444',
    marginRight: 4,
  },
  recoveryMove: {
    color: '#ef4444',
    fontWeight: 'bold',
    transform: [{ scale: 1.15 }],
  },
  resetWarning: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
  },
  inspectionContainer: {
    alignItems: 'center',
    gap: 8,
  },
  inspectionTime: {
    fontSize: 64,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#eab308',
  },
  inspectionTimeRed: {
    color: '#ef4444',
  },
  inspectionTimeOrange: {
    color: '#f97316',
  },
  inspectionHint: {
    fontSize: 14,
    color: '#999',
  },
  inspectionText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#f97316',
    letterSpacing: 2,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 20,
    color: '#fff',
  },
  timerDisplayContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerDisplayText: {
    fontSize: 72,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  timerStatusText: {
    fontSize: 14,
    color: '#999',
  },
  manualTimerNote: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  manualTimerNoteText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  resultsContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
  },
  resultsTime: {
    fontSize: 64,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#3b82f6',
    marginBottom: 24,
  },
  resultsStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultsActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  actionButtonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtonTextSecondary: {
    color: '#999',
  },
  actionButtonTextDanger: {
    color: '#ef4444',
  },
  statsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statCardLabel: {
    fontSize: 10,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  recentContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  recentNumber: {
    fontSize: 12,
    color: '#999',
    width: 40,
  },
  recentTime: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#fff',
  },
  manualBadge: {
    fontSize: 10,
    color: '#999',
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
})
