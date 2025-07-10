import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { X, Video, VideoOff, Mic, MicOff, Users, MessageCircle, Settings, Phone, Monitor, Camera, CameraOff } from 'lucide-react-native';
import { useState } from 'react';

interface VideoCallModalProps {
  visible: boolean;
  onClose: () => void;
  roomName: string;
  participants: number;
}

interface Participant {
  id: number;
  name: string;
  isHost: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  color: string;
}

export default function VideoCallModal({ visible, onClose, roomName, participants }: VideoCallModalProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [participantsList] = useState<Participant[]>([
    { id: 1, name: 'You', isHost: false, videoEnabled: true, audioEnabled: true, color: '#8B5CF6' },
    { id: 2, name: 'Sarah M.', isHost: true, videoEnabled: true, audioEnabled: true, color: '#10B981' },
    { id: 3, name: 'Mike R.', isHost: false, videoEnabled: false, audioEnabled: true, color: '#F59E0B' },
    { id: 4, name: 'Emma L.', isHost: false, videoEnabled: true, audioEnabled: false, color: '#3B82F6' },
  ]);

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to leave the study session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: onClose }
      ]
    );
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    if (!isScreenSharing) {
      Alert.alert('Screen Share', 'Screen sharing started! Others can now see your screen.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.roomName}>{roomName}</Text>
            <View style={styles.participantCount}>
              <Users size={16} color="#10B981" />
              <Text style={styles.participantCountText}>{participantsList.length} participants</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Video Grid */}
        <View style={styles.videoContainer}>
          <ScrollView 
            contentContainerStyle={styles.videoGrid}
            showsVerticalScrollIndicator={false}
          >
            {participantsList.map((participant) => (
              <View key={participant.id} style={styles.videoTile}>
                <View style={[
                  styles.videoPlaceholder,
                  { backgroundColor: participant.videoEnabled ? '#000000' : participant.color + '20' }
                ]}>
                  {participant.videoEnabled ? (
                    <View style={styles.videoActive}>
                      <Text style={styles.videoActiveText}>📹 Video Active</Text>
                    </View>
                  ) : (
                    <View style={styles.videoDisabled}>
                      <CameraOff size={32} color={participant.color} />
                      <Text style={[styles.participantInitial, { color: participant.color }]}>
                        {participant.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>
                    {participant.name}
                    {participant.isHost && ' 👑'}
                  </Text>
                  <View style={styles.participantControls}>
                    {participant.audioEnabled ? (
                      <Mic size={12} color="#10B981" />
                    ) : (
                      <MicOff size={12} color="#EF4444" />
                    )}
                    {participant.videoEnabled ? (
                      <Video size={12} color="#10B981" />
                    ) : (
                      <VideoOff size={12} color="#EF4444" />
                    )}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Screen Share Indicator */}
        {isScreenSharing && (
          <View style={styles.screenShareIndicator}>
            <Monitor size={16} color="#10B981" />
            <Text style={styles.screenShareText}>You are sharing your screen</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlButton, !isAudioEnabled && styles.controlButtonDisabled]}
              onPress={toggleAudio}
            >
              {isAudioEnabled ? (
                <Mic size={24} color="#FFFFFF" />
              ) : (
                <MicOff size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, !isVideoEnabled && styles.controlButtonDisabled]}
              onPress={toggleVideo}
            >
              {isVideoEnabled ? (
                <Video size={24} color="#FFFFFF" />
              ) : (
                <VideoOff size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isScreenSharing && styles.controlButtonActive]}
              onPress={toggleScreenShare}
            >
              <Monitor size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setShowChat(!showChat)}
            >
              <MessageCircle size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton}>
              <Settings size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
              <Phone size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Sidebar */}
        {showChat && (
          <View style={styles.chatSidebar}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Chat</Text>
              <TouchableOpacity onPress={() => setShowChat(false)}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.chatMessages}>
              <View style={styles.chatMessage}>
                <Text style={styles.chatSender}>Sarah M.</Text>
                <Text style={styles.chatText}>Welcome everyone! Let's start with chapter 5.</Text>
                <Text style={styles.chatTime}>2:30 PM</Text>
              </View>
              <View style={styles.chatMessage}>
                <Text style={styles.chatSender}>Mike R.</Text>
                <Text style={styles.chatText}>I have a question about the molecular structure diagram.</Text>
                <Text style={styles.chatTime}>2:32 PM</Text>
              </View>
            </ScrollView>
            <View style={styles.chatInput}>
              <Text style={styles.chatInputPlaceholder}>Type a message...</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerLeft: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  participantCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  participantCountText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  closeButton: {
    padding: 8,
  },
  videoContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  videoTile: {
    width: '48%',
    aspectRatio: 4/3,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1F2937',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoActive: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoActiveText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  videoDisabled: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  participantInitial: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  participantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  participantName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  participantControls: {
    flexDirection: 'row',
    gap: 6,
  },
  screenShareIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  screenShareText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  controls: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: '#EF4444',
  },
  controlButtonActive: {
    backgroundColor: '#10B981',
  },
  endCallButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatSidebar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 60,
  },
  chatTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatMessage: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  chatSender: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  chatText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    marginBottom: 4,
  },
  chatTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  chatInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  chatInputPlaceholder: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
});