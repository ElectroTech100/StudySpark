import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Filter, CircleCheck as CheckCircle, Circle, Clock, Trophy, BookOpen, Calendar } from 'lucide-react-native';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AddTaskModal from '@/components/AddTaskModal';
import GoogleClassroomModal from '@/components/GoogleClassroomModal';
import CalendarSyncModal from '@/components/CalendarSyncModal';

export default function TasksScreen() {
  const { user, updateUser } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showGoogleClassroom, setShowGoogleClassroom] = useState(false);
  const [showCalendarSync, setShowCalendarSync] = useState(false);

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && !task.completed) {
        // Award points when completing a task
        if (user) {
          updateUser({
            points: user.points + task.points,
            tasksCompleted: user.tasksCompleted + 1,
          });
        }
        return { ...task, completed: true };
      }
      return task;
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Chemistry': '#8B5CF6',
      'History': '#3B82F6',
      'Mathematics': '#10B981',
      'English': '#F59E0B',
    };
    return colors[subject] || '#6B7280';
  };

  const getPointsForPriority = (priority: string) => {
    switch (priority) {
      case 'high': return 50;
      case 'medium': return 30;
      case 'low': return 20;
      default: return 20;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         task.subject.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'pending' && !task.completed) ||
                         (selectedFilter === 'completed' && task.completed);
    return matchesSearch && matchesFilter;
  });

  const addTask = (newTask: any) => {
    const task = {
      ...newTask,
      id: tasks.length + 1,
      completed: false,
      points: getPointsForPriority(newTask.priority),
    };
    setTasks(prev => [...prev, task]);
  };

  const handleTasksImported = (importedTasks: any[]) => {
    setTasks(prev => [...prev, ...importedTasks]);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowGoogleClassroom(true)}>
            <BookOpen size={20} color="#4285F4" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowCalendarSync(true)}>
            <Calendar size={20} color="#8B5CF6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddTask(true)}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {['all', 'pending', 'completed'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.activeFilterTab
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter && styles.activeFilterTabText
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks List */}
      <ScrollView 
        style={styles.tasksContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredTasks.length > 0 ? filteredTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[
              styles.taskCard,
              task.completed && styles.completedTaskCard
            ]}
            onPress={() => toggleTask(task.id)}
          >
            <View style={styles.taskHeader}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => toggleTask(task.id)}
              >
                {task.completed ? (
                  <CheckCircle size={24} color="#10B981" />
                ) : (
                  <Circle size={24} color="#D1D5DB" />
                )}
              </TouchableOpacity>
              <View style={styles.taskInfo}>
                <Text style={[
                  styles.taskTitle,
                  task.completed && styles.completedTaskTitle
                ]}>
                  {task.title}
                </Text>
                <View style={styles.taskMeta}>
                  <View style={[
                    styles.subjectTag,
                    { backgroundColor: getSubjectColor(task.subject) + '20' }
                  ]}>
                    <Text style={[
                      styles.subjectText,
                      { color: getSubjectColor(task.subject) }
                    ]}>
                      {task.subject}
                    </Text>
                  </View>
                  <View style={styles.priorityIndicator}>
                    <View style={[
                      styles.priorityDot,
                      { backgroundColor: getPriorityColor(task.priority) }
                    ]} />
                    <Text style={styles.priorityText}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.taskFooter}>
              <View style={styles.taskDetails}>
                <View style={styles.detailItem}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.detailText}>{task.estimatedTime}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Trophy size={14} color="#F59E0B" />
                  <Text style={styles.detailText}>{task.points} pts</Text>
                </View>
              </View>
              <Text style={styles.dueDate}>Due: {task.dueDate}</Text>
            </View>
          </TouchableOpacity>
        )) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchText 
                ? 'No tasks match your search'
                : 'No tasks yet. Create your first task to get started!'
              }
            </Text>
            {!searchText && (
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => setShowAddTask(true)}
              >
                <Text style={styles.emptyStateButtonText}>Create Task</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <AddTaskModal
        visible={showAddTask}
        onClose={() => setShowAddTask(false)}
        onAddTask={addTask}
      />

      <GoogleClassroomModal
        visible={showGoogleClassroom}
        onClose={() => setShowGoogleClassroom(false)}
        onTasksImported={handleTasksImported}
      />

      <CalendarSyncModal
        visible={showCalendarSync}
        onClose={() => setShowCalendarSync(false)}
        tasks={tasks}
      />
    </SafeAreaView>
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  activeFilterTab: {
    backgroundColor: '#8B5CF6',
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  tasksContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedTaskCard: {
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subjectTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  priorityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  dueDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8B5CF6',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  emptyStateButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});