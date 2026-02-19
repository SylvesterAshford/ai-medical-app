// Chat Screen — WhatsApp-style with AI + Voice + Triage + Emergency

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Animated, Dimensions, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GradientBackground from '../components/GradientBackground';
import DisclaimerModal from '../components/DisclaimerModal';
import TriageQuestionCard from '../components/TriageQuestionCard';
import OfflineBanner from '../components/OfflineBanner';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { sendChatMessage, runPreChecks } from '../services/ai';
import { formatTimestamp } from '../utils';
import { ChatMessage, RootStackParamList, TriageResponse, SymptomCategory } from '../types';
import { getTriageQuestions, evaluateTriageResponses } from '../utils/triageRules';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      );

    animate(dot1, 0).start();
    animate(dot2, 150).start();
    animate(dot3, 300).start();
  }, []);

  const dotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
  });

  return (
    <View style={styles.typingContainer}>
      <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
        <Animated.View style={[styles.dot, dotStyle(dot1)]} />
        <Animated.View style={[styles.dot, dotStyle(dot2)]} />
        <Animated.View style={[styles.dot, dotStyle(dot3)]} />
      </View>
    </View>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}

function MessageBubble({ message, onSpeak, isSpeaking }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Ionicons name="medical" size={16} color={colors.teal} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
          {message.text}
        </Text>
        <View style={styles.bubbleFooter}>
          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
            {formatTimestamp(message.timestamp)}
          </Text>
          {!isUser && (
            <TouchableOpacity
              onPress={() => onSpeak(message.text)}
              style={styles.speakerBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
                size={16}
                color={isSpeaking ? colors.teal : colors.textLight}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation<NavigationProp>();
  const [currentTriageIndex, setCurrentTriageIndex] = useState(0);

  const {
    messages, disclaimerShown, isTyping,
    addMessage, setTyping, showDisclaimer,
    isOffline,
    currentTriageCategory, triageResponses,
    addTriageResponse, setTriageCategory, clearTriage,
    setEmergencyMode,
  } = useAppStore();

  const { isRecording, isSpeaking, startRecording, stopRecording, speakText, stopSpeaking } = useVoiceInput();
  useNetworkStatus();

  const triageQuestions = currentTriageCategory
    ? getTriageQuestions(currentTriageCategory)
    : [];

  const handleSend = useCallback(async (text?: string) => {
    const userText = (text || inputText).trim();
    if (!userText) return;

    if (!text) setInputText('');
    addMessage(userText, 'user');

    // Run pre-checks before AI
    const preCheck = runPreChecks(userText);

    if (preCheck.type === 'emergency') {
      setEmergencyMode(true);
      addMessage(
        'အရေးပေါ် အခြေအနေ ဖြစ်နိုင်ပါသည်။ ကျေးဇူးပြု၍ အရေးပေါ် မျက်နှာပြင်ကို ကြည့်ပါ။',
        'ai'
      );
      setTimeout(() => navigation.navigate('Emergency'), 500);
      return;
    }

    if (preCheck.type === 'hospital_search') {
      addMessage(
        'အနီးဆုံး ဆေးရုံများကို ရှာဖွေပေးပါမည်...\nSearching for nearby hospitals...',
        'ai'
      );
      setTimeout(() => navigation.navigate('HospitalFinder', {}), 500);
      return;
    }

    if (preCheck.type === 'triage' && preCheck.category) {
      const category = preCheck.category as SymptomCategory;
      setTriageCategory(category);
      setCurrentTriageIndex(0);
      clearTriage();
      addMessage(
        'သင့်ရောဂါလက္ခဏာကို ပိုမိုနားလည်ရန် မေးခွန်းအချို့ မေးပါရစေ။\nLet me ask you a few questions to better understand your symptoms.',
        'ai',
        category
      );
      return;
    }

    // Normal AI chat (only if online)
    if (isOffline) {
      addMessage(
        'Internet ချိတ်ဆက်မှု မရှိပါ။ AI chat ကို အသုံးပြုရန် Internet လိုအပ်ပါသည်။\nNo internet connection. AI chat requires internet.',
        'ai'
      );
      return;
    }

    setTyping(true);
    try {
      const response = await sendChatMessage(messages, userText);
      addMessage(response, 'ai');
    } catch {
      addMessage('Sorry, something went wrong. Please try again.', 'ai');
    } finally {
      setTyping(false);
    }
  }, [inputText, messages, isOffline, addMessage, setTyping, setEmergencyMode, navigation, setTriageCategory, clearTriage]);

  const handleTriageAnswer = useCallback((questionId: string, answer: boolean) => {
    if (!currentTriageCategory) return;

    const question = triageQuestions[currentTriageIndex];
    if (!question) return;

    const response: TriageResponse = {
      questionId,
      answer,
      symptomCategory: currentTriageCategory,
      key: question.key,
    };

    addTriageResponse(response);

    const nextIndex = currentTriageIndex + 1;

    // Check if we should trigger emergency after each answer
    const allResponses = [...triageResponses, response];
    const result = evaluateTriageResponses(allResponses, currentTriageCategory);

    if (result.isEmergency) {
      setTriageCategory(null);
      setCurrentTriageIndex(0);
      setEmergencyMode(true);
      addMessage(
        'သင့်ဖြေဆိုချက်များအရ အရေးပေါ် ဆေးကုသမှု လိုအပ်နိုင်ပါသည်။\nBased on your answers, you may need emergency medical care.',
        'ai'
      );
      setTimeout(() => navigation.navigate('Emergency'), 500);
      return;
    }

    if (nextIndex < triageQuestions.length) {
      setCurrentTriageIndex(nextIndex);
    } else {
      // All questions answered — provide summary
      setTriageCategory(null);
      setCurrentTriageIndex(0);

      const severityMessages: Record<string, string> = {
        low: 'သင့်ရောဂါလက္ခဏာများသည် ပြင်းထန်မှု နည်းပါးနေပါသည်။ အိမ်တွင် အနားယူ၍ စောင့်ကြည့်ပါ။\nYour symptoms appear to be mild. Rest at home and monitor.',
        medium: 'သင့်ရောဂါလက္ခဏာများသည် အလယ်အလတ် ပြင်းထန်ပါသည်။ ဆရာဝန်နှင့် တိုင်ပင်ပါ။\nYour symptoms are moderate. Please consult a doctor.',
        high: 'သင့်ရောဂါလက္ခဏာများသည် ပြင်းထန်ပါသည်။ ချက်ချင်း ဆေးရုံသို့ သွားပါ။\nYour symptoms are concerning. Please visit a hospital soon.',
      };

      addMessage(
        severityMessages[result.severity] || severityMessages.medium,
        'ai'
      );
    }
  }, [currentTriageCategory, currentTriageIndex, triageQuestions, triageResponses, addTriageResponse, setTriageCategory, setEmergencyMode, addMessage, navigation]);

  const handleMicPress = useCallback(async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri) {
        // For now, show a message that voice was captured
        // Full STT would require a cloud transcription API
        addMessage('[Voice message recorded]', 'user');
        addMessage(
          'အသံ မက်ဆေ့ချ် လက်ခံရရှိပါပြီ။ လောလောဆယ်တွင် စာသားဖြင့် ရိုက်ထည့်ပေးပါ။\nVoice message received. Please type your message for now.',
          'ai'
        );
      }
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording, addMessage]);

  const handleSpeak = useCallback((text: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(text, 'my');
    }
  }, [isSpeaking, speakText, stopSpeaking]);

  const handleAcceptDisclaimer = () => {
    showDisclaimer();
    addMessage(
      "မင်္ဂလာပါ! 👋 ကျွန်ုပ်သည် သင့် AI ကျန်းမာရေး လမ်းညွှန် ဖြစ်ပါသည်။ အထွေထွေ ကျန်းမာရေး မေးခွန်းများ၊ ကျန်းမာရေး အကြံပြုချက်များ နှင့် သင့်လျော်သော ဆေးကုသမှု လမ်းညွှန်ချက်များ ပေးနိုင်ပါသည်။\n\nHello! I'm your AI health navigator. I can help with health questions, wellness tips, and guide you to appropriate care.\n\n⚕️ ဆရာဝန် အကြံပေးချက် မဟုတ်ပါ။",
      'ai'
    );
  };

  return (
    <GradientBackground>
      <DisclaimerModal
        visible={!disclaimerShown}
        onAccept={handleAcceptDisclaimer}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <LinearGradient
          colors={[...gradients.header]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerAvatar}>
              <Ionicons name="medical" size={22} color={colors.white} />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Health Navigator</Text>
              <Text style={styles.headerStatus}>
                {isTyping ? 'Typing...' : isOffline ? 'Offline' : 'Online'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('HospitalFinder', {})}
            style={styles.hospitalHeaderBtn}
          >
            <Ionicons name="medical" size={18} color={colors.teal} />
          </TouchableOpacity>
        </LinearGradient>

        <OfflineBanner />

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              onSpeak={handleSpeak}
              isSpeaking={isSpeaking}
            />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            disclaimerShown ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="chatbubbles" size={48} color={colors.tealLight} />
                </View>
                <Text style={styles.emptyTitle}>ဘာကူညီပေးရမလဲ?</Text>
                <Text style={styles.emptySubtitle}>What can I help with?</Text>
              </View>
            ) : null
          }
        />

        {isTyping && <TypingIndicator />}

        {/* Triage Questions (shown inline when active) */}
        {currentTriageCategory && triageQuestions[currentTriageIndex] && (
          <TriageQuestionCard
            question={triageQuestions[currentTriageIndex]}
            questionNumber={currentTriageIndex + 1}
            totalQuestions={triageQuestions.length}
            onAnswer={handleTriageAnswer}
          />
        )}

        {/* Input */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={24} color={colors.teal} />
          </TouchableOpacity>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={isOffline ? 'Offline — AI chat unavailable' : 'Message'}
              placeholderTextColor={colors.textLight}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              editable={!currentTriageCategory}
            />
            <TouchableOpacity
              onPress={handleMicPress}
              style={[styles.micBtn, isRecording && styles.micBtnActive]}
            >
              <Ionicons
                name={isRecording ? 'stop-circle' : 'mic-outline'}
                size={20}
                color={isRecording ? colors.teal : colors.textLight}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => handleSend()}
            activeOpacity={0.8}
            disabled={!!currentTriageCategory}
          >
            <LinearGradient
              colors={[...gradients.send]}
              style={[styles.sendBtn, currentTriageCategory && styles.sendBtnDisabled]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="send" size={18} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 16,
  },
  headerStatus: {
    ...typography.caption,
    color: colors.success,
  },
  hospitalHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },

  // Messages
  messagesList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexGrow: 1,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  bubble: {
    maxWidth: width * 0.72,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.aiBubble,
    borderBottomLeftRadius: 4,
    ...shadows.card,
  },
  bubbleText: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  userBubbleText: {
    color: colors.text,
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  timestamp: {
    ...typography.caption,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: colors.textSecondary,
  },
  speakerBtn: {
    padding: 4,
    marginLeft: spacing.sm,
  },

  // Typing
  typingContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.teal,
    marginHorizontal: 2,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.teal,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 100 : 85,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFA',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.xs,
    marginRight: spacing.sm,
    minHeight: 40,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
  },
  micBtn: {
    marginLeft: spacing.sm,
    paddingBottom: 2,
    padding: 4,
  },
  micBtnActive: {
    backgroundColor: colors.tealLight + '40',
    borderRadius: 12,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
