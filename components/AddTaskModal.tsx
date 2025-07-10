import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Calendar, Clock, Trophy, Tag } from 'lucide-react-native';
import { useState } from 'react';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (task: any) => void;
}

export default function AddTaskModal({ visible, onClose, onAddTask }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [dueDate, setDueDate] = useState('');

  const subjects = ['Mathematics', 'Chemistry', 'Physics', 'History', 'English', 'Biology'];
  const priorities = [
    { value: 'low', label: 'Low', color: '#10B981', points: 20 },
    { value: 'medium', label: 'Medium', color: '#F59E0B', points: 30 },
    { value: 'high', label: 'High', color: '#EF4444', points: 50 },
  ];

  const handleSubmit = () => {
    if (!title.trim() || !subject || !dueDate || !estimatedTime) {
      alert('Please fill in all required fields');
      return;
    }

    const newTask = {
      title: title.trim(),
      subject,
      priority,
      dueDate,
      estimatedTime,
    };

    onAddTask(newTask);
    
    // Reset form
    setTitle('');
    setSubject('');
    setPriority('medium');
    setEstimatedTime('');
    setDueDate('');
    
    onClose();
  };

  const selectedPriority = priorities.find(p => p.value === priority);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add New Task</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Task Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter task title..."
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Subject */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.subjectContainer}>
                {subjects.map((subj) => (
                  <TouchableOpacity
                    key={subj}
                    style={[
                      styles.subjectButton,
                      subject === subj && styles.selectedSubject
                    ]}
                    onPress={() => setSubject(subj)}
                  >
                    <Tag size={16} color={subject === subj ? '#FFFFFF' : '#6B7280'} />
                    <Text style={[
                      styles.subjectText,
                      subject === subj && styles.selectedSubjectText
                    ]}>
                      {subj}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Priority */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((prio) => (
                <TouchableOpacity
                  key={prio.value}
                  style={[
                    styles.priorityButton,
                    priority === prio.value && { backgroundColor: prio.color }
                  ]}
                  onPress={() => setPriority(prio.value as any)}
                >
                  <View style={[
                    styles.priorityDot,
                    { backgroundColor: prio.color }
                  ]} />
                  <Text style={[
                    styles.priorityText,
                    priority === prio.value && styles.selectedPriorityText
                  ]}>
                    {prio.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date *</Text>
            <View style={styles.inputWithIcon}>
              <Calendar size={20} color="#6B7280" />
              <TextInput
                style={styles.textInputWithIcon}
                placeholder="YYYY-MM-DD"
                value={dueDate}
                onChangeText={setDueDate}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Estimated Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estimated Time *</Text>
            <View style={styles.inputWithIcon}>
              <Clock size={20} color="#6B7280" />
              <TextInput
                style={styles.textInputWithIcon}
                placeholder="e.g., 2 hours"
                value={estimatedTime}
                onChangeText={setEstimatedTime}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Points Info */}
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsInfoTitle}>Points Earned:</Text>
            <View style={styles.pointsDisplay}>
              <Trophy size={16} color="#F59E0B" />
              <Text style={styles.pointsValue}>
                {selectedPriority?.points || 30} points
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subjectContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  subjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  selectedSubject: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  subjectText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  selectedSubjectText: {
    color: '#FFFFFF',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  selectedPriorityText: {
    color: '#FFFFFF',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  textInputWithIcon: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  pointsInfo: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsInfoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pointsValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
});