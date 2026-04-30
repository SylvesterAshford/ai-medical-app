// Image Analysis Screen

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Dimensions, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';
import { colors, spacing, typography, borderRadius, shadows, gradients } from '../theme';
import { analyzeImage, explainPrescription } from '../services/ai';
import { useAppStore } from '../store/useAppStore';
import Markdown from 'react-native-markdown-display';

const { width } = Dimensions.get('window');

// Compact markdown styles for AI analysis results
const markdownStyles = {
  body: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 28,
  },
  heading1: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.teal,
    marginTop: 8,
    marginBottom: 2,
    lineHeight: 34,
  },
  heading2: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.teal,
    marginTop: 8,
    marginBottom: 2,
    lineHeight: 30,
  },
  heading3: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginTop: 6,
    marginBottom: 2,
    lineHeight: 28,
  },
  paragraph: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 28,
    marginBottom: 4,
    marginTop: 0,
  },
  strong: {
    fontWeight: '700' as const,
    color: colors.teal,
  },
  em: {
    fontStyle: 'italic' as const,
    color: colors.textSecondary,
  },
  bullet_list: {
    marginBottom: 4,
    marginTop: 0,
  },
  ordered_list: {
    marginBottom: 4,
    marginTop: 0,
  },
  list_item: {
    marginBottom: 2,
    flexDirection: 'row' as const,
  },
  bullet_list_icon: {
    color: colors.teal,
    fontSize: 14,
    lineHeight: 28,
    marginRight: 6,
  },
  ordered_list_icon: {
    color: colors.teal,
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 28,
    marginRight: 6,
  },
  fence: {
    backgroundColor: '#F0F4F4',
    borderRadius: 6,
    padding: 8,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  blockquote: {
    backgroundColor: '#E8F8F8',
    borderLeftColor: colors.teal,
    borderLeftWidth: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 6,
    marginBottom: 4,
  },
  hr: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 6,
  },
};

export default function ImageAnalysisScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    insights: string[];
    disclaimer: string;
  } | null>(null);
  const [isPrescriptionMode, setIsPrescriptionMode] = useState(false);
  const language = useAppStore(s => s.language);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          language === 'my' ? 'ခွင့်ပြုချက် လိုအပ်ပါသည်' : 'Permission Required',
          language === 'my' ? 'ဓာတ်ပုံများ ရွေးချယ်ရန် ဓာတ်ပုံပြခန်း ခွင့်ပြုချက် လိုအပ်ပါသည်' : 'Photo library permission is required to pick images',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setResults(null);
      }
    } catch (error) {
      console.warn('Image picker error:', error);
      Alert.alert(
        language === 'my' ? 'အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်' : 'Error',
        language === 'my' ? 'ပုံရွေးချယ်ရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်' : 'Failed to pick image. Please try again.',
      );
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          language === 'my' ? 'ခွင့်ပြုချက် လိုအပ်ပါသည်' : 'Permission Required',
          language === 'my' ? 'ဓာတ်ပုံရိုက်ရန် ကင်မရာ ခွင့်ပြုချက် လိုအပ်ပါသည်' : 'Camera permission is required to take photos',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setResults(null);
      }
    } catch (error) {
      console.warn('Camera error:', error);
      Alert.alert(
        language === 'my' ? 'အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်' : 'Error',
        language === 'my' ? 'ကင်မရာ ဖွင့်ရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်' : 'Failed to open camera. Please try again.',
      );
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri) return;
    setIsAnalyzing(true);
    try {
      const analysis = isPrescriptionMode
          ? await explainPrescription(imageUri)
          : await analyzeImage(imageUri);
      setResults(analysis);
    } catch {
      setResults({
        insights: ['Unable to analyze the image. Please try again.'],
        disclaimer: 'This is not a medical diagnosis.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <GradientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{language === 'my' ? 'ပုံခွဲခြမ်းစိတ်ဖြာ' : 'Image Analysis'}</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>
          {language === 'my'
            ? 'AI ခွဲခြမ်းစိတ်ဖြာရန် ဆေးဘက်ဆိုင်ရာ ပုံများ တင်ပါ။ သင်္ကေတများ သို့ ဆေးစာရွက်များကို လွယ်ကူသော မြန်မာဘာသာဖြင့် ရှင်းပြပါမည်။'
            : 'Upload medical images for instant AI-powered analysis. Get comprehensive insights from X-rays, MRIs, scans, or translate prescriptions.'}
        </Text>

        {/* Mode Toggle */}
        <View style={styles.modeToggleContainer}>
          <Text style={[styles.modeText, !isPrescriptionMode && styles.activeModeText, { fontSize: language === 'my' ? 12 : 14 }]} numberOfLines={1}>
            {language === 'my' ? 'အထွေထွေ ပုံစံ' : 'General'}
          </Text>
          <Switch
            value={isPrescriptionMode}
            onValueChange={setIsPrescriptionMode}
            trackColor={{ false: colors.textSecondary, true: colors.teal }}
            thumbColor={colors.white}
          />
          <Text style={[styles.modeText, isPrescriptionMode && styles.activeModeText, { fontSize: language === 'my' ? 12 : 14 }]} numberOfLines={1}>
            {language === 'my' ? 'ဆေးစာရွက် ရှင်းပြခြင်း' : 'Prescription'}
          </Text>
        </View>

        {/* Upload Card */}
        <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
          <Card style={styles.uploadCard}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.preview} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={styles.uploadIconCircle}>
                  <Ionicons name="cloud-download-outline" size={36} color={colors.teal} />
                </View>
                <Text style={styles.uploadText}>{language === 'my' ? 'ပုံတင်ရန် နှိပ်ပါ' : 'Click to upload'}</Text>
                <Text style={styles.uploadHint}>JPG, PNG 10MB အထိ</Text>
              </View>
            )}
          </Card>
        </TouchableOpacity>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={takePhoto} style={styles.cameraBtn}>
            <Ionicons name="camera" size={22} color={colors.teal} />
            <Text style={styles.cameraText}>{language === 'my' ? 'ကင်မရာ' : 'Camera'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} style={styles.cameraBtn}>
            <Ionicons name="images" size={22} color={colors.teal} />
            <Text style={styles.cameraText}>{language === 'my' ? 'ပြခန်း' : 'Gallery'}</Text>
          </TouchableOpacity>
        </View>

        {/* Analyze Button */}
        <GradientButton
          title={isAnalyzing
            ? (language === 'my' ? 'ခွဲခြမ်းနေသည်...' : 'Analyzing...')
            : (language === 'my' ? 'ပုံ ခွဲခြမ်းပါ' : 'Analyze Image')}
          onPress={handleAnalyze}
          size="large"
          style={styles.analyzeBtn}
          disabled={!imageUri || isAnalyzing}
        />

        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.teal} />
            <Text style={styles.loadingText}>{language === 'my' ? 'AI က သင့်ပုံကို ခွဲခြမ်းနေပါသည်...' : 'AI is analyzing your image...'}</Text>
          </View>
        )}

        {/* Results */}
        {results && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>{language === 'my' ? 'ခွဲခြမ်းစိတ်ဖြာ ရလဒ်များ' : 'Analysis Results'}</Text>

            <Card style={styles.resultsCard}>
              <Markdown style={markdownStyles}>
                {results.insights.join('\n')}
              </Markdown>
            </Card>

            <View style={styles.disclaimerCard}>
              <View style={styles.disclaimerRow}>
                <Ionicons name="warning" size={16} color={colors.warning} />
                <Text style={styles.disclaimerTitle}>{language === 'my' ? 'သတိပေးချက်' : 'Disclaimer'}</Text>
              </View>
              <Text style={styles.disclaimerText}>{results.disclaimer}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 58,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  headerTitle: {
    ...typography.h2,
  },

  description: {
    ...typography.bodySmall,
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 26,
  },

  modeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    ...shadows.card,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    lineHeight: 22,
    flex: 1,
    textAlign: 'center',
  },
  activeModeText: {
    color: colors.teal,
    fontWeight: '600',
  },


  // Upload
  uploadCard: {
    marginHorizontal: spacing.xxl,
    padding: 0,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    height: 200,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    margin: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  uploadText: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  uploadHint: {
    ...typography.caption,
  },
  preview: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.lg,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.card,
  },
  cameraText: {
    fontSize: 14,
    color: colors.teal,
    fontWeight: '600',
    marginLeft: spacing.sm,
    lineHeight: 28,
  },

  analyzeBtn: {
    marginHorizontal: spacing.xxl,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },

  // Results
  resultsSection: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.xxl,
  },
  resultsTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
  },
  resultsCard: {
    marginBottom: 4,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  insightText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.md,
    lineHeight: 26,
  },
  disclaimerCard: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginLeft: 6,
    color: '#856404',
    lineHeight: 28,
  },
  disclaimerText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: '#856404',
    lineHeight: 26,
    marginTop: 4,
  },
});
