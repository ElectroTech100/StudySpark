import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Trophy, Calendar, Target, TrendingUp, Award, Star, BookOpen } from 'lucide-react-native';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  if (!user) return null;

  const nextLevelPoints = user.level * 1000; // 1000 points per level
  const progressPercentage = (user.points / nextLevelPoints) * 100;

  const [achievements] = useState([
    { id: 1, name: 'First Steps', description: 'Complete your first study session', icon: '🎯', unlocked: user.focusSessions > 0 },
    { id: 2, name: 'Focus Master', description: 'Complete 10 focus sessions', icon: '🧠', unlocked: user.focusSessions >= 10 },
    { id: 3, name: 'Task Destroyer', description: 'Complete 25 tasks', icon: '⚡', unlocked: user.tasksCompleted >= 25 },
    { id: 4, name: 'Study Streak', description: 'Study for 7 consecutive days', icon: '🔥', unlocked: user.streak >= 7 },
    { id: 5, name: 'Time Lord', description: 'Study for 10 hours total', icon: '⏰', unlocked: user.totalStudyTime >= 10 },
    { id: 6, name: 'Point Collector', description: 'Earn 500 points', icon: '💎', unlocked: user.points >= 500 },
  ]);

  const [weeklyStats] = useState([
    { day: 'Mon', hours: 3.5 },
    { day: 'Tue', hours: 4.2 },
    { day: 'Wed', hours: 2.8 },
    { day: 'Thu', hours: 5.1 },
    { day: 'Fri', hours: 3.9 },
    { day: 'Sat', hours: 6.2 },
    { day: 'Sun', hours: 4.5 },
  ]);

  const getSubjectColor = (index: number) => {
    const colors = ['#10B981', '#8B5CF6', '#F59E0B', '#3B82F6', '#EF4444', '#06B6D4'];
    return colors[index % colors.length];
  };

  const maxWeeklyHours = Math.max(...weeklyStats.map(stat => stat.hours));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
            <Settings size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user.fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user.fullName}</Text>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {user.level}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {user.points}/{nextLevelPoints} Points
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Calendar size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>{user.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Target size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{user.totalStudyTime}h</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Trophy size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{achievements.filter(a => a.unlocked).length}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.weeklyChart}>
            {weeklyStats.map((stat, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={[
                  styles.bar,
                  { height: (stat.hours / maxWeeklyHours) * 100 }
                ]} />
                <Text style={styles.barLabel}>{stat.day}</Text>
                <Text style={styles.barValue}>{stat.hours}h</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Subject Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject Progress</Text>
          <View style={styles.subjectsContainer}>
            {user.subjects.map((subject, index) => (
              <View key={index} style={styles.subjectCard}>
                <View style={styles.subjectInfo}>
                  <View style={[styles.subjectIcon, { backgroundColor: getSubjectColor(index) + '20' }]}>
                    <BookOpen size={20} color={getSubjectColor(index)} />
                  </View>
                  <View style={styles.subjectDetails}>
                    <Text style={styles.subjectName}>{subject}</Text>
                    <Text style={styles.subjectLevel}>In Progress</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[
                styles.achievementCard,
                !achievement.unlocked && styles.lockedAchievement
              ]}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={[
                  styles.achievementName,
                  !achievement.unlocked && styles.lockedText
                ]}>
                  {achievement.name}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.unlocked && styles.lockedText
                ]}>
                  {achievement.description}
                </Text>
                {achievement.unlocked && (
                  <View style={styles.unlockedBadge}>
                    <Star size={12} color="#F59E0B" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <ProfileSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  levelContainer: {
    width: '100%',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  weeklyChart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartBar: {
    alignItems: 'center',
    width: 32,
  },
  bar: {
    width: 16,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  subjectsContainer: {
    gap: 12,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectDetails: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  subjectLevel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  lockedAchievement: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  lockedText: {
    color: '#9CA3AF',
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 4,
  },
});