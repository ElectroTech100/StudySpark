import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { X, Clock } from 'lucide-react-native';
import { useState } from 'react';

interface TimerSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  currentTimes: {
    focus: number;
    shortBreak: number;
    longBreak: number;
  };
  onSave: (times: { focus: number; shortBreak: number; longBreak: number }) => void;
}

export default function TimerSettingsModal({ visible, onClose, currentTimes, onSave }: TimerSettingsModalProps) {
  const [times, setTimes] = useState(currentTimes);

  const handleSave = () => {
    onSave(times);
    onClose();
  };

  const updateTime = (type: keyof typeof times, value: string) => {
    const numValue = parseInt(value) || 1;
    setTimes(prev => ({
      ...prev,
      [type]: Math.max(1, Math.min(120, numValue)) // Limit between 1 and 120 minutes
    }));
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
          <Text style={styles.title}>Timer Settings</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Customize your focus timer durations</Text>

          {/* Focus Time */}
          <View style={styles.settingGroup}>
            <Text style={styles.label}>Focus Time</Text>
            <View style={styles.inputContainer}>
              <Clock size={20} color="#8B5CF6" />
              <TextInput
                style={styles.input}
                value={times.focus.toString()}
                onChangeText={(value) => updateTime('focus', value)}
                keyboardType="numeric"
                placeholder="25"
              />
              <Text style={styles.unit}>minutes</Text>
            </View>
          </View>

          {/* Short Break */}
          <View style={styles.settingGroup}>
            <Text style={styles.label}>Short Break</Text>
            <View style={styles.inputContainer}>
              <Clock size={20} color="#10B981" />
              <TextInput
                style={styles.input}
                value={times.shortBreak.toString()}
                onChangeText={(value) => updateTime('shortBreak', value)}
                keyboardType="numeric"
                placeholder="5"
              />
              <Text style={styles.unit}>minutes</Text>
            </View>
          </View>

          {/* Long Break */}
          <View style={styles.settingGroup}>
            <Text style={styles.label}>Long Break</Text>
            <View style={styles.inputContainer}>
              <Clock size={20} color="#3B82F6" />
              <TextInput
                style={styles.input}
                value={times.longBreak.toString()}
                onChangeText={(value) => updateTime('longBreak', value)}
                keyboardType="numeric"
                placeholder="15"
              />
              <Text style={styles.unit}>minutes</Text>
            </View>
          </View>

          <View style={styles.note}>
            <Text style={styles.noteText}>
              💡 Tip: The Pomodoro Technique recommends 25-minute focus sessions with 5-minute short breaks and 15-minute long breaks.
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  settingGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  inputContainer: {
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
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    textAlign: 'center',
  },
  unit: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  note: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  noteText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});