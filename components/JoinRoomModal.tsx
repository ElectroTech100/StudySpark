import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { X, Hash } from 'lucide-react-native';
import { useState } from 'react';

interface JoinRoomModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function JoinRoomModal({ visible, onClose }: JoinRoomModalProps) {
  const [inviteCode, setInviteCode] = useState('');

  const handleJoin = () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    // Mock room codes for demo
    const validCodes = ['CHEM2024', 'CALC101', 'HIST789'];
    
    if (validCodes.includes(inviteCode.toUpperCase())) {
      Alert.alert('Success', `Joined room with code: ${inviteCode.toUpperCase()}`);
      setInviteCode('');
      onClose();
    } else {
      Alert.alert('Error', 'Invalid invite code. Please check and try again.');
    }
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
          <Text style={styles.title}>Join Study Room</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Enter the invite code shared by your friend to join their study room
          </Text>

          {/* Invite Code Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Invite Code</Text>
            <View style={styles.inputContainer}>
              <Hash size={20} color="#10B981" />
              <TextInput
                style={styles.input}
                placeholder="Enter invite code..."
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Example Codes */}
          <View style={styles.exampleSection}>
            <Text style={styles.exampleTitle}>Try these demo codes:</Text>
            <View style={styles.exampleCodes}>
              {['CHEM2024', 'CALC101', 'HIST789'].map((code) => (
                <TouchableOpacity
                  key={code}
                  style={styles.exampleCode}
                  onPress={() => setInviteCode(code)}
                >
                  <Text style={styles.exampleCodeText}>{code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Join Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.joinButton, !inviteCode.trim() && styles.joinButtonDisabled]}
            onPress={handleJoin}
            disabled={!inviteCode.trim()}
          >
            <Text style={[styles.joinButtonText, !inviteCode.trim() && styles.joinButtonTextDisabled]}>
              Join Room
            </Text>
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
    paddingTop: 32,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 32,
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
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    letterSpacing: 2,
    textAlign: 'center',
  },
  exampleSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
  },
  exampleTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  exampleCodes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  exampleCode: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exampleCodeText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
    letterSpacing: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  joinButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  joinButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  joinButtonTextDisabled: {
    color: '#9CA3AF',
  },
});