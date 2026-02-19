// Voice input hook — expo-speech for TTS + expo-av for recording
// Note: expo-av shows a deprecation warning in SDK 54 but still works

import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export function useVoiceInput() {
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recordingRef = useRef<Audio.Recording | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                console.warn('Audio recording permission not granted');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            recordingRef.current = recording;
            setIsRecording(true);
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    }, []);

    const stopRecording = useCallback(async (): Promise<string | null> => {
        try {
            if (!recordingRef.current) return null;

            await recordingRef.current.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });

            const uri = recordingRef.current.getURI();
            recordingRef.current = null;
            setIsRecording(false);
            return uri;
        } catch (error) {
            console.error('Failed to stop recording:', error);
            setIsRecording(false);
            return null;
        }
    }, []);

    const speakText = useCallback((text: string, language: string = 'my') => {
        // Clean the text — remove disclaimer, markdown, emojis
        const cleaned = text
            .replace(/⚕️.*$/gms, '')
            .replace(/\*[^*]+\*/g, '')
            .replace(/•/g, '')
            .replace(/\n{2,}/g, '. ')
            .trim();

        if (!cleaned) return;

        Speech.speak(cleaned, {
            language: language === 'my' ? 'my-MM' : 'en-US',
            rate: 0.9,
            onStart: () => setIsSpeaking(true),
            onDone: () => setIsSpeaking(false),
            onStopped: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
        });
    }, []);

    const stopSpeaking = useCallback(() => {
        Speech.stop();
        setIsSpeaking(false);
    }, []);

    return {
        isRecording,
        isSpeaking,
        startRecording,
        stopRecording,
        speakText,
        stopSpeaking,
    };
}
