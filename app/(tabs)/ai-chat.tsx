import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User, Lightbulb, BookOpen, Calculator, Beaker } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AIService from '@/services/AIService';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hello ${user?.fullName.split(' ')[0] || 'there'}! 👋 I'm your AI study assistant. I can help you with any academic questions, explain complex concepts, solve problems, and provide study tips. What would you like to learn about today?`,
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickPrompts = [
    { icon: Calculator, text: "Help with math problems", color: "#10B981" },
    { icon: Beaker, text: "Explain chemistry concepts", color: "#8B5CF6" },
    { icon: BookOpen, text: "Study tips and techniques", color: "#3B82F6" },
    { icon: Lightbulb, text: "Creative learning ideas", color: "#F59E0B" },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Math-related responses
    if (lowerMessage.includes('math') || lowerMessage.includes('calculus') || lowerMessage.includes('algebra') || lowerMessage.includes('equation')) {
      return "I'd be happy to help with math! 📊 Whether it's algebra, calculus, geometry, or statistics, I can break down complex problems step by step. Could you share the specific problem or concept you're working on? I'll provide a clear explanation with examples.";
    }
    
    // Chemistry responses
    if (lowerMessage.includes('chemistry') || lowerMessage.includes('chemical') || lowerMessage.includes('molecule') || lowerMessage.includes('reaction')) {
      return "Chemistry can be fascinating! 🧪 I can help explain chemical reactions, molecular structures, periodic table trends, stoichiometry, and more. What specific chemistry topic would you like to explore? I'll make sure to explain it in a way that's easy to understand.";
    }
    
    // Physics responses
    if (lowerMessage.includes('physics') || lowerMessage.includes('force') || lowerMessage.includes('energy') || lowerMessage.includes('motion')) {
      return "Physics is all about understanding how the world works! ⚡ I can help with mechanics, thermodynamics, electromagnetism, waves, and quantum physics. What physics concept are you curious about? I'll explain it with real-world examples.";
    }
    
    // Study tips
    if (lowerMessage.includes('study') || lowerMessage.includes('learn') || lowerMessage.includes('tips') || lowerMessage.includes('technique')) {
      return "Great question about studying! 📚 Here are some effective techniques: 1) Use the Pomodoro Technique (25-min focused sessions), 2) Practice active recall instead of just re-reading, 3) Create mind maps for complex topics, 4) Teach concepts to others, 5) Take regular breaks. What subject are you studying? I can give more specific advice!";
    }
    
    // Biology responses
    if (lowerMessage.includes('biology') || lowerMessage.includes('cell') || lowerMessage.includes('dna') || lowerMessage.includes('evolution')) {
      return "Biology is the study of life itself! 🧬 I can help with cell biology, genetics, evolution, ecology, anatomy, and more. Whether you're learning about photosynthesis, DNA replication, or ecosystem dynamics, I'm here to make it clear and interesting. What biology topic interests you?";
    }
    
    // History responses
    if (lowerMessage.includes('history') || lowerMessage.includes('historical') || lowerMessage.includes('war') || lowerMessage.includes('ancient')) {
      return "History helps us understand our world today! 🏛️ I can discuss ancient civilizations, major wars, political movements, cultural developments, and historical figures. What time period or historical event would you like to explore? I'll provide context and interesting details.";
    }
    
    // English/Literature responses
    if (lowerMessage.includes('english') || lowerMessage.includes('literature') || lowerMessage.includes('writing') || lowerMessage.includes('essay')) {
      return "Language and literature are powerful tools! ✍️ I can help with essay writing, literary analysis, grammar, vocabulary, reading comprehension, and creative writing. Are you working on a specific assignment or looking to improve your writing skills in general?";
    }
    
    // General encouragement and help
    if (lowerMessage.includes('help') || lowerMessage.includes('confused') || lowerMessage.includes('difficult') || lowerMessage.includes('hard')) {
      return "I'm here to help you succeed! 💪 Learning can be challenging, but breaking things down into smaller steps makes everything more manageable. What specific topic or problem are you finding difficult? I'll explain it clearly and provide practice examples.";
    }
    
    // Motivation and encouragement
    if (lowerMessage.includes('motivation') || lowerMessage.includes('tired') || lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
      return "I understand studying can feel overwhelming sometimes! 🌟 Remember that every expert was once a beginner. Take breaks when needed, celebrate small wins, and focus on progress over perfection. You're doing great by seeking help! What subject would you like to tackle first?";
    }
    
    // Default response
    return "That's an interesting question! 🤔 I'm here to help with any academic topic - from math and science to literature and history. Could you tell me more about what you'd like to learn or what specific problem you're working on? The more details you provide, the better I can assist you!";
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsTyping(true);

    try {
      // Convert messages to AI service format
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
      
      // Add current message
      conversationHistory.push({
        role: 'user' as const,
        content: currentInput
      });

      const aiResponseText = await AIService.generateResponse(conversationHistory);
      
      const aiResponse: Message = {
        id: messages.length + 2,
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: Message = {
        id: messages.length + 2,
        text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment! 🤖",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.botAvatar}>
              <Bot size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.title}>AI Study Assistant</Text>
              <Text style={styles.subtitle}>Always here to help you learn</Text>
            </View>
          </View>
        </View>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <View style={styles.quickPromptsContainer}>
            <Text style={styles.quickPromptsTitle}>Quick Start:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.quickPrompts}>
                {quickPrompts.map((prompt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.quickPrompt, { borderColor: prompt.color }]}
                    onPress={() => sendQuickPrompt(prompt.text)}
                  >
                    <prompt.icon size={20} color={prompt.color} />
                    <Text style={[styles.quickPromptText, { color: prompt.color }]}>
                      {prompt.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessageContainer : styles.aiMessageContainer
              ]}
            >
              {!message.isUser && (
                <View style={styles.aiAvatar}>
                  <Bot size={16} color="#8B5CF6" />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.aiMessage
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {message.text}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.isUser ? styles.userMessageTime : styles.aiMessageTime
                ]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
              {message.isUser && (
                <View style={styles.userAvatar}>
                  <User size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
          ))}

          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.aiAvatar}>
                <Bot size={16} color="#8B5CF6" />
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask me anything about your studies..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              placeholderTextColor="#9CA3AF"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isTyping}
            >
              <Send size={20} color={inputText.trim() && !isTyping ? "#FFFFFF" : "#9CA3AF"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  quickPromptsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quickPromptsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 12,
  },
  quickPrompts: {
    flexDirection: 'row',
    gap: 12,
  },
  quickPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickPromptText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMessage: {
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  userMessageTime: {
    color: '#E0E7FF',
  },
  aiMessageTime: {
    color: '#9CA3AF',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  typingDot1: {
    animationDelay: '0ms',
  },
  typingDot2: {
    animationDelay: '150ms',
  },
  typingDot3: {
    animationDelay: '300ms',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    maxHeight: 100,
    minHeight: 24,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});