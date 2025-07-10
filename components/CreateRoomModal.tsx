import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Users, Clock, BookOpen, Globe, Lock } from 'lucide-react-native';
import { useState } from 'react';

interface CreateRoomModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateRoomModal({ visible, onClose }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('20');
  const [isPrivate, setIsPrivate] = useState(false);
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');

  const subjects = ['Mathematics', 'Chemistry', 'Physics', 'History', 'English', 'Biology'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreate = () => {
    if (!roomName.trim() || !subject || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const inviteCode = generateInviteCode();
    
    alert(`Study room "${roomName}" created successfully!\nInvite Code: ${inviteCode}`);
    
    // Reset form
    setRoomName('');
    setSubject('');
    setDescription('');
    setMaxParticipants('20');
    setIsPrivate(false);
    setLevel('Intermediate');
    
    onClose();
  };

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
          <Text style={styles.title}>Create Study Room</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Room Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Room Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter room name..."
              value={roomName}
              onChangeText={setRoomName}
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
                    <BookOpen size={16} color={subject === subj ? '#FFFFFF' : '#6B7280'} />
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

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe what you'll be studying..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Difficulty Level</Text>
            <View style={styles.levelContainer}>
              {levels.map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[
                    styles.levelButton,
                    level === lvl && styles.selectedLevel
                  ]}
                  onPress={() => setLevel(lvl as any)}
                >
                  <Text style={[
                    styles.levelText,
                    level === lvl && styles.selectedLevelText
                  ]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Max Participants */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Participants</Text>
            <View style={styles.inputWithIcon}>
              <Users size={20} color="#6B7280" />
              <TextInput
                style={styles.textInputWithIcon}
                placeholder="20"
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Privacy Setting */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Privacy</Text>
            <View style={styles.privacyContainer}>
              <TouchableOpacity
                style={[
                  styles.privacyButton,
                  !isPrivate && styles.selectedPrivacy
                ]}
                onPress={() => setIsPrivate(false)}
              >
                <Globe size={20} color={!isPrivate ? '#FFFFFF' : '#6B7280'} />
                <View style={styles.privacyContent}>
                  <Text style={[
                    styles.privacyTitle,
                    !isPrivate && styles.selectedPrivacyText
                  ]}>
                    Public
                  </Text>
                  <Text style={[
                    styles.privacyDescription,
                    !isPrivate && styles.selectedPrivacyText
                  ]}>
                    Anyone can find and join
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.privacyButton,
                  isPrivate && styles.selectedPrivacy
                ]}
                onPress={() => setIsPrivate(true)}
              >
                <Lock size={20} color={isPrivate ? '#FFFFFF' : '#6B7280'} />
                <View style={styles.privacyContent}>
                  <Text style={[
                    styles.privacyTitle,
                    isPrivate && styles.selectedPrivacyText
                  ]}>
                    Private
                  </Text>
                  <Text style={[
                    styles.privacyDescription,
                    isPrivate && styles.selectedPrivacyText
                  ]}>
                    Invite code required
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Create Study Room</Text>
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
    paddingTop: 20,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  levelContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  levelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectedLevel: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  levelText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  selectedLevelText: {
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
  privacyContainer: {
    gap: 12,
  },
  privacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  selectedPrivacy: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  privacyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  selectedPrivacyText: {
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  createButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});