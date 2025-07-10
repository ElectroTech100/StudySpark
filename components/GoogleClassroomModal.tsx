import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { X, BookOpen, Calendar, Download, RefreshCw, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import GoogleClassroomService from '@/services/GoogleClassroomService';
import CalendarService from '@/services/CalendarService';

interface GoogleClassroomModalProps {
  visible: boolean;
  onClose: () => void;
  onTasksImported: (tasks: any[]) => void;
}

export default function GoogleClassroomModal({ visible, onClose, onTasksImported }: GoogleClassroomModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<Set<string>>(new Set());
  const [courses, setCourses] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsAuthenticated(GoogleClassroomService.isAuthenticated());
      if (GoogleClassroomService.isAuthenticated()) {
        loadData();
      }
    }
  }, [visible]);

  const handleAuthenticate = async () => {
    setLoading(true);
    try {
      const success = await GoogleClassroomService.authenticate();
      if (success) {
        setIsAuthenticated(true);
        await loadData();
      } else {
        Alert.alert('Authentication Failed', 'Unable to connect to Google Classroom. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, assignmentsData] = await Promise.all([
        GoogleClassroomService.getCourses(),
        GoogleClassroomService.getAssignments()
      ]);
      
      setCourses(coursesData);
      setAssignments(assignmentsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load classroom data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignment = (assignmentId: string) => {
    const newSelected = new Set(selectedAssignments);
    if (newSelected.has(assignmentId)) {
      newSelected.delete(assignmentId);
    } else {
      newSelected.add(assignmentId);
    }
    setSelectedAssignments(newSelected);
  };

  const selectAll = () => {
    if (selectedAssignments.size === assignments.length) {
      setSelectedAssignments(new Set());
    } else {
      setSelectedAssignments(new Set(assignments.map(a => a.id)));
    }
  };

  const importSelectedTasks = async () => {
    if (selectedAssignments.size === 0) {
      Alert.alert('No Selection', 'Please select assignments to import.');
      return;
    }

    setSyncing(true);
    try {
      const selectedAssignmentData = assignments.filter(a => selectedAssignments.has(a.id));
      const tasks = selectedAssignmentData.map(assignment => 
        GoogleClassroomService.convertAssignmentToTask(assignment)
      );

      // Add to calendar
      const calendarTasks = selectedAssignmentData.map(assignment => ({
        title: assignment.title,
        dueDate: assignment.dueDate,
        subject: GoogleClassroomService.convertAssignmentToTask(assignment).subject,
        estimatedTime: GoogleClassroomService.convertAssignmentToTask(assignment).estimatedTime,
        priority: GoogleClassroomService.convertAssignmentToTask(assignment).priority,
      }));

      const syncResult = await CalendarService.syncTasksToCalendar(calendarTasks);
      
      onTasksImported(tasks);
      
      Alert.alert(
        'Import Successful', 
        `Imported ${tasks.length} assignments as tasks.\nCalendar sync: ${syncResult.success} successful, ${syncResult.failed} failed.`
      );
      
      setSelectedAssignments(new Set());
      onClose();
    } catch (error) {
      Alert.alert('Import Failed', 'An error occurred while importing assignments.');
    } finally {
      setSyncing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const formatDueDate = (dateString: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
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
            <BookOpen size={24} color="#4285F4" />
            <Text style={styles.title}>Google Classroom</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {!isAuthenticated ? (
          <View style={styles.authContainer}>
            <View style={styles.authContent}>
              <BookOpen size={64} color="#4285F4" />
              <Text style={styles.authTitle}>Connect to Google Classroom</Text>
              <Text style={styles.authSubtitle}>
                Import your assignments automatically and sync them with your calendar
              </Text>
              
              <TouchableOpacity 
                style={styles.authButton} 
                onPress={handleAuthenticate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <BookOpen size={20} color="#FFFFFF" />
                    <Text style={styles.authButtonText}>Connect Google Classroom</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{courses.length}</Text>
                <Text style={styles.statLabel}>Courses</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{assignments.length}</Text>
                <Text style={styles.statLabel}>Assignments</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{selectedAssignments.size}</Text>
                <Text style={styles.statLabel}>Selected</Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={loadData} disabled={loading}>
                <RefreshCw size={16} color="#6B7280" />
                <Text style={styles.controlButtonText}>Refresh</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton} onPress={selectAll}>
                <CheckCircle size={16} color="#6B7280" />
                <Text style={styles.controlButtonText}>
                  {selectedAssignments.size === assignments.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Assignments List */}
            <ScrollView style={styles.assignmentsList} showsVerticalScrollIndicator={false}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4285F4" />
                  <Text style={styles.loadingText}>Loading assignments...</Text>
                </View>
              ) : assignments.length > 0 ? (
                assignments.map((assignment) => {
                  const task = GoogleClassroomService.convertAssignmentToTask(assignment);
                  const isSelected = selectedAssignments.has(assignment.id);
                  
                  return (
                    <TouchableOpacity
                      key={assignment.id}
                      style={[styles.assignmentCard, isSelected && styles.selectedCard]}
                      onPress={() => toggleAssignment(assignment.id)}
                    >
                      <View style={styles.assignmentHeader}>
                        <View style={styles.assignmentInfo}>
                          <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                          <Text style={styles.courseName}>{assignment.courseName}</Text>
                        </View>
                        <View style={[
                          styles.priorityIndicator,
                          { backgroundColor: getPriorityColor(task.priority) }
                        ]}>
                          <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
                        </View>
                      </View>
                      
                      {assignment.description && (
                        <Text style={styles.assignmentDescription} numberOfLines={2}>
                          {assignment.description}
                        </Text>
                      )}
                      
                      <View style={styles.assignmentFooter}>
                        <View style={styles.assignmentMeta}>
                          <Calendar size={14} color="#6B7280" />
                          <Text style={styles.metaText}>Due: {formatDueDate(assignment.dueDate)}</Text>
                        </View>
                        <View style={styles.assignmentMeta}>
                          <Text style={styles.metaText}>Est: {task.estimatedTime}</Text>
                        </View>
                      </View>
                      
                      {isSelected && (
                        <View style={styles.selectedIndicator}>
                          <CheckCircle size={20} color="#10B981" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <BookOpen size={48} color="#9CA3AF" />
                  <Text style={styles.emptyStateText}>No assignments found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Make sure you have active courses with assignments in Google Classroom
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Import Button */}
            {selectedAssignments.size > 0 && (
              <View style={styles.footer}>
                <TouchableOpacity 
                  style={styles.importButton} 
                  onPress={importSelectedTasks}
                  disabled={syncing}
                >
                  {syncing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Download size={20} color="#FFFFFF" />
                      <Text style={styles.importButtonText}>
                        Import {selectedAssignments.size} Assignment{selectedAssignments.size !== 1 ? 's' : ''}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
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
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  authContent: {
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  authSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  controlButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  assignmentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 16,
  },
  assignmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  assignmentInfo: {
    flex: 1,
    marginRight: 12,
  },
  assignmentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4285F4',
  },
  priorityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  assignmentDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  importButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});