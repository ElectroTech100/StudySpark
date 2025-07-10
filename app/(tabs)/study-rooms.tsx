import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Users, Clock, BookOpen, Video, MessageCircle, Crown, Copy, ExternalLink, Trophy, Hash } from 'lucide-react-native';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/contexts/AuthContext';
import CreateRoomModal from '@/components/CreateRoomModal';
import ChatModal from '@/components/ChatModal';
import JoinRoomModal from '@/components/JoinRoomModal';
import VideoCallModal from '@/components/VideoCallModal';

export default function StudyRoomsScreen() {
  const { isAuthenticated, user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'leaderboard'>('rooms');
  
  const [studyRooms] = useState<any[]>([
    {
      id: 1,
      name: 'Advanced Chemistry Study Group',
      subject: 'Chemistry',
      description: 'Focusing on organic chemistry and molecular structures',
      level: 'Advanced',
      participants: 8,
      maxParticipants: 15,
      host: 'Sarah J.',
      duration: '2h 30m',
      isLive: true,
      inviteCode: 'CHEM2024',
      image: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    },
    {
      id: 2,
      name: 'Calculus Problem Solving',
      subject: 'Mathematics',
      description: 'Working through integration and differentiation problems',
      level: 'Intermediate',
      participants: 12,
      maxParticipants: 20,
      host: 'Mike R.',
      duration: '1h 45m',
      isLive: false,
      inviteCode: 'CALC101',
      image: 'https://images.pexels.com/photos/6238050/pexels-photo-6238050.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    },
    {
      id: 3,
      name: 'World History Discussion',
      subject: 'History',
      description: 'Exploring major historical events and their impact',
      level: 'Beginner',
      participants: 6,
      maxParticipants: 12,
      host: 'Emma L.',
      duration: '1h 15m',
      isLive: true,
      inviteCode: 'HIST789',
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    },
  ]);

  if (!isAuthenticated) {
    return null;
  }

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Chemistry': '#8B5CF6',
      'Mathematics': '#10B981',
      'History': '#3B82F6',
      'Physics': '#F59E0B',
      'Biology': '#EF4444',
      'English': '#06B6D4',
    };
    return colors[subject] || '#6B7280';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'Beginner': '#10B981',
      'Intermediate': '#F59E0B',
      'Advanced': '#EF4444',
      'Expert': '#8B5CF6',
    };
    return colors[level] || '#6B7280';
  };

  const copyInviteCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      Alert.alert('Success', `Invite code ${code} copied to clipboard!`);
    } else {
      Alert.alert('Info', `Invite code: ${code}`);
    }
  };

  const joinVideoCall = (room: any) => {
    setSelectedRoom(room);
    setShowVideoCall(true);
  };

  const openChat = (room: any) => {
    setSelectedRoom(room);
    setShowChat(true);
  };

  const filteredRooms = studyRooms.filter(room => 
    room.name.toLowerCase().includes(searchText.toLowerCase()) ||
    room.subject.toLowerCase().includes(searchText.toLowerCase())
  );

  // Get leaderboard data sorted by points
  const leaderboardData = mockUsers
    .map(({ password, ...user }) => user)
    .sort((a, b) => b.points - a.points)
    .map((user, index) => ({ ...user, rank: index + 1 }));

  const currentUserRank = leaderboardData.find(u => u.id === user?.id)?.rank || 0;

  const renderLeaderboard = () => (
    <ScrollView style={styles.leaderboardContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.leaderboardHeader}>
        <Trophy size={24} color="#F59E0B" />
        <Text style={styles.leaderboardTitle}>Global Leaderboard</Text>
      </View>
      
      {user && (
        <View style={styles.currentUserCard}>
          <Text style={styles.currentUserTitle}>Your Rank</Text>
          <View style={styles.currentUserRank}>
            <Text style={styles.rankNumber}>#{currentUserRank}</Text>
            <View style={styles.currentUserInfo}>
              <Text style={styles.currentUserName}>{user.fullName}</Text>
              <Text style={styles.currentUserPoints}>{user.points} points</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.leaderboardList}>
        {leaderboardData.map((userData) => (
          <View key={userData.id} style={[
            styles.leaderboardItem,
            userData.id === user?.id && styles.currentUserItem
          ]}>
            <View style={styles.rankContainer}>
              <Text style={[
                styles.rankText,
                userData.rank <= 3 && styles.topRankText
              ]}>
                #{userData.rank}
              </Text>
              {userData.rank === 1 && <Text style={styles.crownEmoji}>👑</Text>}
              {userData.rank === 2 && <Text style={styles.medalEmoji}>🥈</Text>}
              {userData.rank === 3 && <Text style={styles.medalEmoji}>🥉</Text>}
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userData.fullName}</Text>
              <Text style={styles.userGrade}>{userData.grade}</Text>
            </View>
            
            <View style={styles.userStats}>
              <Text style={styles.userPoints}>{userData.points}</Text>
              <Text style={styles.pointsLabel}>points</Text>
            </View>
            
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{userData.level}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Rooms</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.joinButton} onPress={() => setShowJoinRoom(true)}>
            <Hash size={20} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateRoom(true)}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rooms' && styles.activeTab]}
          onPress={() => setActiveTab('rooms')}
        >
          <Users size={20} color={activeTab === 'rooms' ? '#8B5CF6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'rooms' && styles.activeTabText]}>
            Rooms
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Trophy size={20} color={activeTab === 'leaderboard' ? '#8B5CF6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'leaderboard' ? renderLeaderboard() : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search study rooms..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Study Rooms List */}
          <ScrollView style={styles.roomsContainer} showsVerticalScrollIndicator={false}>
            {filteredRooms.length > 0 ? filteredRooms.map((room) => (
              <TouchableOpacity key={room.id} style={styles.roomCard}>
                <Image source={{ uri: room.image }} style={styles.roomImage} />
                <View style={styles.roomContent}>
                  <View style={styles.roomHeader}>
                    <View style={styles.roomInfo}>
                      <Text style={styles.roomName}>{room.name}</Text>
                      <View style={styles.roomMeta}>
                        <View style={[
                          styles.subjectTag,
                          { backgroundColor: getSubjectColor(room.subject) + '20' }
                        ]}>
                          <Text style={[
                            styles.subjectText,
                            { color: getSubjectColor(room.subject) }
                          ]}>
                            {room.subject}
                          </Text>
                        </View>
                        <View style={[
                          styles.levelTag,
                          { backgroundColor: getLevelColor(room.level) + '20' }
                        ]}>
                          <Text style={[
                            styles.levelText,
                            { color: getLevelColor(room.level) }
                          ]}>
                            {room.level}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {room.isLive && (
                      <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.roomDescription}>{room.description}</Text>
                  
                  <View style={styles.roomStats}>
                    <View style={styles.statItem}>
                      <Users size={16} color="#6B7280" />
                      <Text style={styles.statText}>
                        {room.participants}/{room.maxParticipants}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Clock size={16} color="#6B7280" />
                      <Text style={styles.statText}>{room.duration}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Crown size={16} color="#F59E0B" />
                      <Text style={styles.statText}>{room.host}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.roomActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => joinVideoCall(room)}
                    >
                      <Video size={18} color="#8B5CF6" />
                      <Text style={styles.actionButtonText}>Join</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => openChat(room)}>
                      <MessageCircle size={18} color="#6B7280" />
                      <Text style={styles.actionButtonText}>Chat</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Invite Code */}
                  <View style={styles.inviteSection}>
                    <Text style={styles.inviteLabel}>Invite Code:</Text>
                    <TouchableOpacity 
                      style={styles.inviteCodeContainer}
                      onPress={() => copyInviteCode(room.inviteCode)}
                    >
                      <Text style={styles.inviteCode}>{room.inviteCode}</Text>
                      <Copy size={16} color="#8B5CF6" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {searchText 
                    ? 'No study rooms match your search'
                    : 'No study rooms available yet. Create the first one!'
                  }
                </Text>
                {!searchText && (
                  <TouchableOpacity 
                    style={styles.emptyStateButton}
                    onPress={() => setShowCreateRoom(true)}
                  >
                    <Text style={styles.emptyStateButtonText}>Create Study Room</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </>
      )}

      <CreateRoomModal
        visible={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
      />

      <JoinRoomModal
        visible={showJoinRoom}
        onClose={() => setShowJoinRoom(false)}
      />

      <ChatModal
        visible={showChat}
        onClose={() => setShowChat(false)}
        roomName={selectedRoom?.name || ''}
      />

      <VideoCallModal
        visible={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        roomName={selectedRoom?.name || ''}
        participants={selectedRoom?.participants || 0}
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
    gap: 12,
  },
  joinButton: {
    backgroundColor: '#10B981',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#8B5CF6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
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
  roomsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  roomImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  roomContent: {
    padding: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  roomMeta: {
    flexDirection: 'row',
    gap: 8,
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
  levelTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  roomDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  roomActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  inviteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inviteLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  inviteCode: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#8B5CF6',
    letterSpacing: 1,
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
  // Leaderboard styles
  leaderboardContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  currentUserCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  currentUserTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 8,
  },
  currentUserRank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rankNumber: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  currentUserInfo: {
    flex: 1,
  },
  currentUserName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  currentUserPoints: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
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
  currentUserItem: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    gap: 4,
  },
  rankText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#6B7280',
  },
  topRankText: {
    color: '#F59E0B',
  },
  crownEmoji: {
    fontSize: 16,
  },
  medalEmoji: {
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  userGrade: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  userStats: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  userPoints: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  pointsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  levelBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});