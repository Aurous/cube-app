import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Animated } from 'react-native'
import { ACHIEVEMENTS } from '@/lib/achievements'
import type { AchievementTier } from '@/types/achievements'

interface Notification {
  id: string
  type: 'achievement' | 'personal-best'
  title: string
  subtitle?: string
  tier?: AchievementTier
  progress?: number
  target?: number
}

interface NotificationContextType {
  showAchievement: (achievementId: string, tier: AchievementTier, progress?: number) => void
  showPersonalBest: (time: number, previousBest?: number) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

const NOTIFICATION_DURATION = 5000

function formatTime(ms: number): string {
  const totalSeconds = ms / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = (totalSeconds % 60).toFixed(2)
  return minutes > 0 ? `${minutes}:${seconds.padStart(5, '0')}` : `${seconds}s`
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const showAchievement = useCallback((achievementId: string, tier: AchievementTier, progress?: number) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievement) return

    const tierConfig = achievement.tiers.find(t => t.tier === tier)
    const target = tierConfig?.requirement

    const id = Math.random().toString(36).substring(7)
    setNotifications(prev => [...prev, {
      id,
      type: 'achievement',
      title: achievement.name,
      subtitle: achievement.description,
      tier,
      progress,
      target,
    }])

    setTimeout(() => removeNotification(id), NOTIFICATION_DURATION)
  }, [removeNotification])

  const showPersonalBest = useCallback((time: number, previousBest?: number) => {
    const id = Math.random().toString(36).substring(7)
    const improvement = previousBest ? previousBest - time : undefined
    
    setNotifications(prev => [...prev, {
      id,
      type: 'personal-best',
      title: `New Personal Best: ${formatTime(time)}`,
      subtitle: improvement ? `${formatTime(improvement)} faster!` : 'First recorded solve!',
    }])

    setTimeout(() => removeNotification(id), NOTIFICATION_DURATION)
  }, [removeNotification])

  return (
    <NotificationContext.Provider value={{ 
      showAchievement, 
      showPersonalBest, 
    }}>
      {children}
      <View style={styles.container}>
        {notifications.map(notification => (
          <NotificationItem 
            key={notification.id} 
            notification={notification} 
            onClose={() => removeNotification(notification.id)} 
          />
        ))}
      </View>
    </NotificationContext.Provider>
  )
}

function NotificationItem({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const opacity = new Animated.Value(0)

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <Animated.View style={[styles.notification, { opacity }]}>
      <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
        <Text style={styles.title}>{notification.title}</Text>
        {notification.subtitle && (
          <Text style={styles.subtitle}>{notification.subtitle}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1500,
  },
  notification: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 14,
  },
})

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
