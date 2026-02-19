// Image Analysis Screen

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';
import { colors, spacing, typography, borderRadius, shadows, gradients } from '../theme';
import { analyzeImage } from '../services/ai';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');

export default function ImageAnalysisScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    insights: string[];
    disclaimer: string;
  } | null>(null);
  const language = useAppStore(s => s.language);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setResults(null);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setResults(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeImage(imageUri);
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
            ? 'AI ခွဲခြမ်းစိတ်ဖြာရန် ဆေးဘက်ဆိုင်ရာ ပုံများ တင်ပါ။ X-rayများနှင့် အခြားပုံများအတွက် အသေးစိတ် ရလဒ်များ ရယူပါ။'
            : 'Upload medical images for instant AI-powered analysis. Get comprehensive insights from X-rays, MRIs, CT scans, and more.'}
        </Text>

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
              {results.insights.map((insight, index) => (
                <View key={index} style={styles.insightRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.success}
                  />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </Card>

            <Card style={styles.disclaimerCard}>
              <View style={styles.disclaimerRow}>
                <Ionicons name="warning" size={18} color={colors.warning} />
                <Text style={styles.disclaimerTitle}>{language === 'my' ? 'သတိပေးချက်' : 'Disclaimer'}</Text>
              </View>
              <Text style={styles.disclaimerText}>{results.disclaimer}</Text>
            </Card>
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
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
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
    marginBottom: spacing.xxl,
    lineHeight: 20,
    textAlign: 'center',
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
    ...typography.body,
    color: colors.teal,
    fontWeight: '600',
    marginLeft: spacing.sm,
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
    marginBottom: spacing.lg,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  insightText: {
    ...typography.body,
    flex: 1,
    marginLeft: spacing.md,
    fontSize: 14,
  },
  disclaimerCard: {
    backgroundColor: '#FFF9E6',
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  disclaimerTitle: {
    ...typography.h3,
    fontSize: 14,
    marginLeft: spacing.sm,
    color: '#856404',
  },
  disclaimerText: {
    ...typography.bodySmall,
    color: '#856404',
    lineHeight: 18,
  },
});
