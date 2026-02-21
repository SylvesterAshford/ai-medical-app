// Chat Screen — WhatsApp-style with AI + Voice + Triage + Emergency

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Animated, Dimensions, Alert, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GradientBackground from '../components/GradientBackground';
import DisclaimerModal from '../components/DisclaimerModal';
import TriageQuestionCard from '../components/TriageQuestionCard';
import OfflineBanner from '../components/OfflineBanner';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { sendChatMessage, runPreChecks, getVisitSummary } from '../services/ai';
import { formatTimestamp, generateId } from '../utils';
import { ChatMessage, RootStackParamList, TriageResponse, SymptomCategory, MedicalRecord } from '../types';
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
}

function MessageBubble({ message }: MessageBubbleProps) {
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
        </View>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation<NavigationProp>();
  const [currentTriageIndex, setCurrentTriageIndex] = useState(0);

  const {
    messages, disclaimerShown, isTyping,
    addMessage, setTyping, showDisclaimer,
    isOffline, language,
    currentTriageCategory, triageResponses,
    addTriageResponse, setTriageCategory, clearTriage,
    setEmergencyMode, user, addMedicalRecord,
  } = useAppStore();

  const { isRecording, startRecording, stopRecording } = useVoiceInput();
  useNetworkStatus();

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isTyping]);

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

  const handleGenerateSummary = useCallback(async () => {
    if (messages.length < 2) {
      Alert.alert('Not enough messages', 'Please continue chatting to generate a meaningful summary.');
      return;
    }
    setTyping(true);
    try {
      const summaryText = await getVisitSummary(messages);

      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6; }
              h1 { color: #00796B; border-bottom: 2px solid #00796B; padding-bottom: 10px; }
              pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
            </style>
          </head>
          <body>
            <h1>Medical Visit Summary</h1>
            <pre>${summaryText}</pre>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // Save to global state history
      const newRecord: MedicalRecord = {
        id: generateId(),
        userId: user?.id || 'guest',
        type: 'Visit',
        summary: summaryText,
        createdAt: new Date().toISOString(),
      };
      addMedicalRecord(newRecord);

      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate and share summary.');
    } finally {
      setTyping(false);
    }
  }, [messages, setTyping, user, addMedicalRecord]);



  const handleAcceptDisclaimer = () => {
    showDisclaimer();
  };

  const welcomeMessage = useMemo<ChatMessage>(() => ({
    id: 'welcome_msg_system',
    text: language === 'my'
      ? "မင်္ဂလာပါ! 👋 ကျွန်ုပ်သည် မြန်မာနိုင်ငံ၏ AI ကျန်းမာရေး လမ်းညွှန် ဖြစ်ပါသည်။ အထွေထွေ ကျန်းမာရေးမေးခွန်းများ ဖြေကြားခြင်း၊ ရောဂါလက္ခဏာ စစ်ဆေးခြင်းနှင့် အနီးဆုံးဆေးရုံများကို ရှာဖွေပေးနိုင်ပါသည်။\n\n⚠️ သတိပြုရန်: ကျွန်ုပ်သည် ဆရာဝန်မဟုတ်ပါ။ အရေးပေါ်ဖြစ်ပါက 192 သို့ ချက်ချင်းခေါ်ဆိုပါ။"
      : "Hello! 👋 I'm Myanmar's AI health navigator. I can help with health questions, symptom checks, and finding nearby hospitals.\n\n⚠️ Disclaimer: I am not a doctor. In an emergency, dial 192 immediately.",
    sender: 'ai',
    timestamp: new Date(),
  }), [language]);

  const displayMessages = useMemo(() => {
    // Strip out any legacy 'welcome' messages that might be stuck in user's parsed local storage
    const filteredMessages = messages.filter(m => !m.text.includes("I'm Myanmar's AI health navigator") && !m.text.includes("မြန်မာနိုင်ငံ၏ AI"));
    return disclaimerShown ? [welcomeMessage, ...filteredMessages] : filteredMessages;
  }, [disclaimerShown, welcomeMessage, messages]);

  return (
    <GradientBackground>
      <DisclaimerModal
        visible={!disclaimerShown}
        onAccept={handleAcceptDisclaimer}
      />

      <View style={styles.container}>
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
              <Text style={styles.headerTitle}>
                {language === 'my' ? 'AI ကျန်းမာရေး လမ်းညွှန်' : 'AI Health Navigator'}
              </Text>
              <Text style={styles.headerStatus}>
                {isTyping
                  ? (language === 'my' ? 'ရိုက်နေသည်...' : 'Typing...')
                  : isOffline
                    ? (language === 'my' ? 'အော့ဖ်လိုင်း' : 'Offline')
                    : (language === 'my' ? 'အွန်လိုင်း' : 'Online')}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={handleGenerateSummary}
              style={[styles.headerBtn, { marginRight: spacing.sm }]}
            >
              <Ionicons name="document-text" size={18} color={colors.teal} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('HospitalFinder', {})}
              style={styles.headerBtn}
            >
              <Ionicons name="medical" size={18} color={colors.teal} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <OfflineBanner />

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={displayMessages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} />
          )}
          contentContainerStyle={styles.messagesList}
          style={styles.messagesContainer}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          onContentSizeChange={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
          onLayout={() => {
            if (displayMessages.length > 0) {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }, 100);
            }
          }}
          ListEmptyComponent={
            disclaimerShown ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="chatbubbles" size={48} color={colors.tealLight} />
                </View>
                <Text style={styles.emptyTitle}>
                  {language === 'my' ? 'ဘာကူညီပေးရမလဲ?' : 'What can I help with?'}
                </Text>
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.inputBar}>
              <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
                <Ionicons name="add" size={24} color={colors.teal} />
              </TouchableOpacity>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={isOffline
                    ? (language === 'my' ? 'အော့ဖ်လိုင်း — AI ချတ် မရနိုင်ပါ' : 'Offline — AI chat unavailable')
                    : (language === 'my' ? 'မက်ဆေ့ချ်' : 'Message')}
                  placeholderTextColor={colors.textLight}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={2000}
                  editable={!currentTriageCategory}
                  returnKeyType="send"
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  onPress={handleMicPress}
                  style={[styles.micBtn, isRecording && styles.micBtnActive]}
                  activeOpacity={0.7}
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
                disabled={!!currentTriageCategory || !inputText.trim()}
              >
                <LinearGradient
                  colors={[...gradients.send]}
                  style={[styles.sendBtn, (currentTriageCategory || !inputText.trim()) && styles.sendBtnDisabled]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="send" size={18} color={colors.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        {/* Spacer for floating tab bar — hidden when keyboard is open */}
        {!keyboardVisible && <View style={styles.tabBarSpacer} />}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 64,
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
    paddingTop: 4,
  },
  headerStatus: {
    ...typography.caption,
    color: colors.success,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
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
    fontSize: 15,

    paddingTop: 4,
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
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBarSpacer: {
    // Extra space so the input bar sits fully above the floating tab bar
    height: Platform.OS === 'ios' ? 120 : 90,
    backgroundColor: colors.white,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 6 : 0,
    marginRight: spacing.xs,
    minHeight: 48,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 16,

    color: colors.text,
    paddingTop: Platform.OS === 'ios' ? 8 : 10,
    paddingBottom: Platform.OS === 'ios' ? 8 : 10,
    paddingHorizontal: 0,
    maxHeight: 80,
    textAlignVertical: 'center',
  },
  micBtn: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnActive: {
    backgroundColor: colors.tealLight + '30',
    borderRadius: 16,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
