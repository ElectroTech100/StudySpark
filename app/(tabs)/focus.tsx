import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, RotateCcw, Settings, Clock, TrendingUp } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TimerSettingsModal from '@/components/TimerSettingsModal';

export default function FocusScreen() {
  const { user, updateUser } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [customTimes, setCustomTimes] = useState({
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [time, setTime] = useState(customTimes.focus * 60);
  const [mode, setMode] = useState<'focus' | 'short-break' | 'long-break'>('focus');
  const [sessionCount, setSessionCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const getModes = () => ({
    focus: { duration: customTimes.focus * 60, label: 'Focus Time', color: '#8B5CF6' },
    'short-break': { duration: customTimes.shortBreak * 60, label: 'Short Break', color: '#10B981' },
    'long-break': { duration: customTimes.longBreak * 60, label: 'Long Break', color: '#3B82F6' },
  });

  const modes = getModes();

  const updateTimerSettings = (newTimes: typeof customTimes) => {
    setCustomTimes(newTimes);
    // Reset current timer if not running
    if (!isRunning) {
      const newModes = {
        focus: { duration: newTimes.focus * 60, label: 'Focus Time', color: '#8B5CF6' },
        'short-break': { duration: newTimes.shortBreak * 60, label: 'Short Break', color: '#10B981' },
        'long-break': { duration: newTimes.longBreak * 60, label: 'Long Break', color: '#3B82F6' },
      };
      setTime(newModes[mode].duration);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      // Handle session completion
      if (mode === 'focus') {
        setSessionCount(sessionCount + 1);
        
        // Award points and update stats for completed focus session
        if (user) {
          updateUser({
            points: user.points + 50, // 50 points per focus session
            focusSessions: user.focusSessions + 1,
            totalStudyTime: Math.round((user.totalStudyTime + (customTimes.focus / 60)) * 10) / 10,
          });
        }
        
        // Auto-switch to break
        if (sessionCount % 4 === 3) {
          setMode('long-break');
          setTime(getModes()['long-break'].duration);
        } else {
          setMode('short-break');
          setTime(getModes()['short-break'].duration);
        }
      } else {
        setMode('focus');
        setTime(getModes().focus.duration);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, time, mode, sessionCount, customTimes, user, updateUser]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(modes[mode].duration);
  };

  const switchMode = (newMode: 'focus' | 'short-break' | 'long-break') => {
    setMode(newMode);
    setTime(getModes()[newMode].duration);
    setIsRunning(false);
  };

  const progress = ((modes[mode].duration - time) / modes[mode].duration) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Focus Timer</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
            <Settings size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          {Object.entries(getModes()).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.modeButton,
                mode === key && { backgroundColor: value.color }
              ]}
              onPress={() => switchMode(key as any)}
            >
              <Text style={[
                styles.modeButtonText,
                mode === key && styles.activeModeButtonText
              ]}>
                {value.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <View style={[styles.progressRing, { borderColor: modes[mode].color + '20' }]}>
            <View style={[
              styles.progressIndicator,
              {
                borderColor: modes[mode].color,
                transform: [{ rotate: `${(progress * 3.6) - 90}deg` }]
              }
            ]} />
            <View style={styles.timerContent}>
              <Text style={[styles.timerText, { color: modes[mode].color }]}>
                {formatTime(time)}
              </Text>
              <Text style={styles.timerLabel}>{modes[mode].label}</Text>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
            <RotateCcw size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: modes[mode].color }]}
            onPress={toggleTimer}
          >
            {isRunning ? (
              <Pause size={32} color="#FFFFFF" />
            ) : (
              <Play size={32} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Settings size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Session Counter */}
        <View style={styles.sessionCounter}>
          <Text style={styles.sessionText}>Today's Sessions</Text>
          <Text style={styles.sessionCount}>{sessionCount}/8</Text>
        </View>

        {/* Today's Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Clock size={20} color="#8B5CF6" />
              <Text style={styles.statValue}>{user?.focusSessions || 0}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.statValue}>{Math.round((user?.totalStudyTime || 0) * 60)}m</Text>
              <Text style={styles.statLabel}>Focus Time</Text>
            </View>
            <View style={styles.statCard}>
              <Play size={20} color="#3B82F6" />
              <Text style={styles.statValue}>{user?.streak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <TimerSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        currentTimes={customTimes}
        onSave={updateTimerSettings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  settingsButton: {
    padding: 8,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activeModeButtonText: {
    color: '#FFFFFF',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressIndicator: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#8B5CF6',
  },
  timerContent: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  sessionCounter: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  sessionCount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
  },
});