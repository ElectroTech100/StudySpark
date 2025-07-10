import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Switch } from 'react-native';
import { X, Calendar, CircleCheck as CheckCircle, Clock, Smartphone, Monitor } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import CalendarService from '@/services/CalendarService';

interface CalendarSyncModalProps {
  visible: boolean;
  onClose: () => void;
  tasks: any[];
}

export default function CalendarSyncModal({ visible, onClose, tasks }: CalendarSyncModalProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [autoSync, setAutoSync] = useState(true);
  const [syncReminders, setSyncReminders] = useState(true);
  const [syncStudySessions, setSyncStudySessions] = useState(true);

  useEffect(() => {
    if (visible) {
      checkPermissions();
    }
  }, [visible]);

  const checkPermissions = async () => {
    setLoading(true);
    try {
      const permission = await CalendarService.requestPermissions();
      setHasPermission(permission);
      
      if (permission) {
        const events = await CalendarService.getUpcomingEvents(7);
        setUpcomingEvents(events);
      }
    } catch (error) {
      console.error('Permission check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async () => {
    setLoading(true);
    try {
      const permission = await CalendarService.requestPermissions();
      setHasPermission(permission);
      
      if (permission) {
        const events = await CalendarService.getUpcomingEvents(7);
        setUpcomingEvents(events);
      } else {
        Alert.alert(
          'Permission Required',
          'Calendar access is required to sync your tasks. Please enable it in your device settings.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request calendar permission.');
    } finally {
      setLoading(false);
    }
  };

  const syncAllTasks = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant calendar permission first.');
      return;
    }

    setSyncing(true);
    try {
      const calendarTasks = tasks.map(task => ({
        title: task.title,
        dueDate: task.dueDate,
        subject: task.subject,
        estimatedTime: task.estimatedTime,
        priority: task.priority,
      })).filter(task => task.dueDate && task.dueDate !== 'YYYY-MM-DD'); // Only sync tasks with valid due dates

      const result = await CalendarService.syncTasksToCalendar(calendarTasks);
      
      Alert.alert(
        'Sync Complete',
        `Successfully synced ${result.success} tasks to your calendar.${result.failed > 0 ? ` ${result.failed} tasks failed to sync.` : ''}`
      );

      // Refresh upcoming events
      const events = await CalendarService.getUpcomingEvents(7);
      setUpcomingEvents(events);
      
    } catch (error) {
      Alert.alert('Sync Failed', 'An error occurred while syncing tasks to calendar.');
    } finally {
      setSyncing(false);
    }
  };

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventIcon = (title: string) => {
    if (title.includes('📚')) return '📚';
    if (title.includes('🎯')) return '🎯';
    if (title.includes('⏰')) return '⏰';
    return '📅';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Calendar size={24} color="#8B5CF6" />
            <Text style={styles.title}>Calendar Sync</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!hasPermission ? (
            <View style={styles.permissionContainer}>
              <View style={styles.permissionContent}>
                <Calendar size={64} color="#8B5CF6" />
                <Text style={styles.permissionTitle}>Calendar Access Required</Text>
                <Text style={styles.permissionSubtitle}>
                  Grant calendar access to automatically sync your tasks and study sessions with your device calendar
                </Text>
                
                <View style={styles.benefitsContainer}>
                  <View style={styles.benefitItem}>
                    <CheckCircle size={20} color="#10B981" />
                    <Text style={styles.benefitText}>Automatic task reminders</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Clock size={20} color="#10B981" />
                    <Text style={styles.benefitText}>Study session scheduling</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Smartphone size={20} color="#10B981" />
                    <Text style={styles.benefitText}>Cross-device synchronization</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.permissionButton} 
                  onPress={requestPermission}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Calendar size={20} color="#FFFFFF" />
                      <Text style={styles.permissionButtonText}>Grant Calendar Access</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Sync Options */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sync Settings</Text>
                
                <View style={styles.optionCard}>
                  <View style={styles.optionHeader}>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>Auto Sync Tasks</Text>
                      <Text style={styles.optionDescription}>
                        Automatically add new tasks to calendar
                      </Text>
                    </View>
                    <Switch
                      value={autoSync}
                      onValueChange={setAutoSync}
                      trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                      thumbColor={autoSync ? '#FFFFFF' : '#F3F4F6'}
                    />
                  </View>
                </View>

                <View style={styles.optionCard}>
                  <View style={styles.optionHeader}>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>Task Reminders</Text>
                      <Text style={styles.optionDescription}>
                        Add reminder notifications before due dates
                      </Text>
                    </View>
                    <Switch
                      value={syncReminders}
                      onValueChange={setSyncReminders}
                      trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                      thumbColor={syncReminders ? '#FFFFFF' : '#F3F4F6'}
                    />
                  </View>
                </View>

                <View style={styles.optionCard}>
                  <View style={styles.optionHeader}>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>Study Sessions</Text>
                      <Text style={styles.optionDescription}>
                        Sync focus timer sessions to calendar
                      </Text>
                    </View>
                    <Switch
                      value={syncStudySessions}
                      onValueChange={setSyncStudySessions}
                      trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                      thumbColor={syncStudySessions ? '#FFFFFF' : '#F3F4F6'}
                    />
                  </View>
                </View>
              </View>

              {/* Sync Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sync Actions</Text>
                
                <View style={styles.syncCard}>
                  <View style={styles.syncInfo}>
                    <Text style={styles.syncTitle}>Sync Current Tasks</Text>
                    <Text style={styles.syncDescription}>
                      Add all {tasks.length} current tasks to your calendar
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.syncButton}
                    onPress={syncAllTasks}
                    disabled={syncing || tasks.length === 0}
                  >
                    {syncing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.syncButtonText}>Sync Now</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Upcoming Events */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming StudySync Events</Text>
                
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text style={styles.loadingText}>Loading events...</Text>
                  </View>
                ) : upcomingEvents.length > 0 ? (
                  <View style={styles.eventsContainer}>
                    {upcomingEvents.map((event, index) => (
                      <View key={index} style={styles.eventCard}>
                        <View style={styles.eventIcon}>
                          <Text style={styles.eventEmoji}>{getEventIcon(event.title)}</Text>
                        </View>
                        <View style={styles.eventInfo}>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <Text style={styles.eventDate}>{formatEventDate(event.startDate)}</Text>
                          {event.notes && (
                            <Text style={styles.eventNotes} numberOfLines={2}>
                              {event.notes}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyEvents}>
                    <Calendar size={48} color="#9CA3AF" />
                    <Text style={styles.emptyEventsText}>No upcoming StudySync events</Text>
                    <Text style={styles.emptyEventsSubtext}>
                      Sync your tasks to see them appear here
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionContent: {
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  permissionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsContainer: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  benefitText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  syncCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syncInfo: {
    flex: 1,
    marginRight: 16,
  },
  syncTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  syncDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  syncButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  syncButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 16,
  },
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventEmoji: {
    fontSize: 20,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  eventNotes: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 16,
  },
  emptyEvents: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEventsText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyEventsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});