import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSolves } from '@/hooks/useSolves'
import { getImagePicker } from '@/lib/image-picker'
import { useAuth } from '@/contexts/AuthContext'
import { useExperience } from '@/contexts/ExperienceContext'
import { useAchievements } from '@/contexts/AchievementsContext'
import { useToast } from '@/contexts/ToastContext'
import { db, storageInstance as storage, isOfflineMode } from '@/lib/firebase'
import { getLevelTitle } from '@/types/achievements'
import type { Solve } from '@/hooks/useSolves'

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const centiseconds = Math.floor((ms % 1000) / 10)

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }
  return `${seconds}.${centiseconds.toString().padStart(2, '0')}`
}

function calculateStats(solves: Solve[]) {
  if (solves.length === 0) {
    return { ao5: null, ao12: null, ao50: null, ao100: null, mean: null, best: null, count: 0 }
  }

  const validSolves = solves.filter((s) => !s.dnf)
  const times = validSolves.map((s) => (s.plusTwo ? s.time + 2000 : s.time))

  if (times.length === 0) {
    return { ao5: null, ao12: null, ao50: null, ao100: null, mean: null, best: null, count: solves.length }
  }

  const best = Math.min(...times)
  const mean = times.reduce((a, b) => a + b, 0) / times.length

  const calcAo = (n: number) => {
    if (times.length < n) return null
    const lastN = times.slice(0, n)
    const sorted = [...lastN].sort((a, b) => a - b)
    const trimmed = sorted.slice(1, -1)
    return trimmed.reduce((a, b) => a + b, 0) / trimmed.length
  }

  return {
    ao5: calcAo(5),
    ao12: calcAo(12),
    ao50: calcAo(50),
    ao100: calcAo(100),
    mean,
    best,
    count: solves.length,
  }
}

function StatCard({ label, value, highlight }: { label: string; value: string | null; highlight?: boolean }) {
  return (
    <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
      <Text style={[styles.statLabel, highlight && styles.statLabelHighlight]}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value ?? '-'}</Text>
    </View>
  )
}

function ProfileHeader() {
  const { user } = useAuth()
  const { getXPData, loading: xpLoading } = useExperience()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || 'Guest')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const xpData = getXPData()

  const handleSave = async () => {
    if (!user || !displayName.trim()) return

    const trimmedName = displayName.trim()

    if (trimmedName.length > 20) {
      showToast(`Name must be 20 characters or less`, 'error')
      return
    }

    setIsSaving(true)
    try {
      if (user.updateProfile) {
        await user.updateProfile({ displayName: trimmedName })
      }
      if (db && !isOfflineMode) {
        await db.collection('users').doc(user.uid).update({ displayName: trimmedName })
      }
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update display name:', error)
      showToast('Failed to update name', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoUpload = async () => {
    const ImagePicker = getImagePicker()
    if (!user || !storage || isOfflineMode || !ImagePicker) {
      Alert.alert('Not Available', 'Photo upload is not available in this build.')
      return
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need access to your photos to upload a profile picture.')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (result.canceled || !result.assets[0]) return

      setIsUploadingPhoto(true)
      try {
        if (storage) {
          const reference = storage().ref(`profile-photos/${user.uid}`)
          await reference.putFile(result.assets[0].uri)
          const photoURL = await reference.getDownloadURL()
          
          if (user.updateProfile) {
            await user.updateProfile({ photoURL })
          }
          if (db && !isOfflineMode) {
            await db.collection('users').doc(user.uid).update({ photoURL })
          }
        }
      } catch (error) {
        console.error('Failed to upload photo:', error)
        showToast('Failed to upload photo', 'error')
      } finally {
        setIsUploadingPhoto(false)
      }
    } catch (error) {
      console.error('ImagePicker error:', error)
      Alert.alert('Error', 'Failed to open image picker')
    }
  }

  return (
    <View style={styles.profileHeader}>
      <View style={styles.profileTop}>
        <TouchableOpacity onPress={handlePhotoUpload} disabled={isUploadingPhoto || isOfflineMode}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            {user && !isOfflineMode && (
              <View style={styles.cameraButton}>
                {isUploadingPhoto ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.cameraIcon}>📷</Text>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.nameInput}
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
                editable={!isSaving}
              />
              <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                <Text style={styles.saveButton}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setDisplayName(user?.displayName || 'Guest')
                setIsEditing(false)
              }} disabled={isSaving}>
                <Text style={styles.cancelButton}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{displayName}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.email}>{user?.email || 'Not signed in'}</Text>
        </View>

        <View style={styles.levelBadge}>
          {xpLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.levelText}>{xpData.level}</Text>
          )}
        </View>
      </View>

      <View style={styles.xpContainer}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpLabel}>Level {xpLoading ? '-' : xpData.level}</Text>
          <Text style={styles.xpLabel}>
            {xpLoading ? '-' : xpData.currentXP} / {xpLoading ? '-' : xpData.xpForNextLevel} XP
          </Text>
        </View>
        <View style={styles.xpBar}>
          <View
            style={[
              styles.xpBarFill,
              { width: `${Math.min(xpData.progress * 100, 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.xpTotal}>Total: {xpLoading ? '-' : xpData.totalXP} XP</Text>
      </View>
    </View>
  )
}

function StreakWidget() {
  const { streak, prestige } = useAchievements()
  const { getXPData } = useExperience()
  const xpData = getXPData()

  return (
    <View style={styles.streakWidget}>
      <View style={styles.streakGrid}>
        <View style={styles.streakItem}>
          <Text style={styles.streakValue}>{streak.currentStreak}</Text>
          <Text style={styles.streakLabel}>🔥 Day Streak</Text>
        </View>
        <View style={styles.streakItem}>
          <Text style={styles.streakValue}>{streak.longestStreak}</Text>
          <Text style={styles.streakLabel}>🎯 Best Streak</Text>
        </View>
        <View style={styles.streakItem}>
          <Text style={[styles.streakValue, styles.streakValueAccent]}>
            {((streak.streakMultiplier - 1) * 100).toFixed(0)}%
          </Text>
          <Text style={styles.streakLabel}>⚡ XP Bonus</Text>
        </View>
        <View style={styles.streakItem}>
          <Text style={styles.streakValue}>
            {getLevelTitle(xpData.level, prestige.stars).split(' ')[0]}
          </Text>
          <Text style={styles.streakLabel}>
            {prestige.stars > 0 ? `⭐ ${prestige.stars} Star${prestige.stars > 1 ? 's' : ''}` : '🎮 Title'}
          </Text>
        </View>
      </View>
      <Text style={styles.streakHint}>Solve at least 5 times daily to maintain your streak</Text>
    </View>
  )
}

export default function AccountScreen() {
  const navigation = useNavigation()
  const { solves, deleteSolve } = useSolves()
  const verifiedSolves = useMemo(() => solves.filter(s => !s.isManual), [solves])
  const hasVerifiedSolves = verifiedSolves.length > 0
  const [verifiedOnly, setVerifiedOnly] = useState(hasVerifiedSolves)

  const statsSolves = useMemo(() => verifiedOnly ? verifiedSolves : solves, [verifiedOnly, verifiedSolves, solves])
  const stats = useMemo(() => calculateStats(statsSolves), [statsSolves])

  const handleViewSolve = (solve: Solve) => {
    // @ts-expect-error - navigation type issue
    navigation.navigate('SolveDetail', { solveId: solve.id })
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete Solve', 'Are you sure you want to delete this solve?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSolve(id),
      },
    ])
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Verified only</Text>
          <Switch
            value={verifiedOnly}
            onValueChange={setVerifiedOnly}
            trackColor={{ false: '#333', true: '#f97316' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <ProfileHeader />
      <StreakWidget />

      <View style={styles.statsGrid}>
        <StatCard label="PB" value={stats.best ? formatTime(stats.best) : null} highlight />
        <StatCard label="ao5" value={stats.ao5 ? formatTime(stats.ao5) : null} />
        <StatCard label="ao12" value={stats.ao12 ? formatTime(stats.ao12) : null} />
        <StatCard label="ao50" value={stats.ao50 ? formatTime(stats.ao50) : null} />
        <StatCard label="ao100" value={stats.ao100 ? formatTime(stats.ao100) : null} />
        <StatCard label="Mean" value={stats.mean ? formatTime(stats.mean) : null} />
      </View>

      <View style={styles.solvesSection}>
        <Text style={styles.sectionTitle}>Solve History ({solves.length} total)</Text>
        {solves.length === 0 ? (
          <Text style={styles.emptyText}>No solves yet. Start solving to see your history!</Text>
        ) : (
          solves.slice(0, 50).map((solve) => (
            <TouchableOpacity
              key={solve.id}
              style={styles.solveItem}
              onPress={() => handleViewSolve(solve)}
            >
              <View style={styles.solveLeft}>
                <Text style={styles.solveTime}>{formatTime(solve.time)}</Text>
                <Text style={styles.solveDate}>
                  {new Date(solve.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.solveRight}>
                {solve.isManual && <Text style={styles.manualBadge}>Manual</Text>}
                <TouchableOpacity
                  onPress={() => handleDelete(solve.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 12,
    color: '#999',
  },
  profileHeader: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 14,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  editIcon: {
    fontSize: 16,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    padding: 8,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#f97316',
  },
  saveButton: {
    fontSize: 20,
    color: '#f97316',
  },
  cancelButton: {
    fontSize: 20,
    color: '#ef4444',
  },
  email: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  xpContainer: {
    marginTop: 8,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 12,
    color: '#999',
  },
  xpBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 4,
  },
  xpTotal: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
  },
  streakWidget: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  streakGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  streakItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  streakValueAccent: {
    color: '#f97316',
  },
  streakLabel: {
    fontSize: 10,
    color: '#999',
    textTransform: 'uppercase',
  },
  streakHint: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statCardHighlight: {
    backgroundColor: '#f97316',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statLabelHighlight: {
    color: '#000',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  statValueHighlight: {
    color: '#000',
  },
  solvesSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    padding: 32,
  },
  solveItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  solveLeft: {
    flex: 1,
  },
  solveTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'monospace',
  },
  solveDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  solveRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  manualBadge: {
    fontSize: 10,
    color: '#999',
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 18,
  },
})
