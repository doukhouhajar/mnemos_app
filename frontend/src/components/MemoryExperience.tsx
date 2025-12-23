/**
 * Memory Experience Component - Cursor-Inspired Design
 * Clean, focused review experience
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { ExperienceInstance } from '@shared/types/experience';
import { MemoryObject, RecallResult } from '@shared/types/domain';
import { api } from '../services/api';

interface MemoryExperienceProps {
  experience: ExperienceInstance;
  memoryObject: MemoryObject;
  userId: string;
  onComplete?: (result: RecallResult, confidence: number, latency: number) => void;
}

export const MemoryExperience: React.FC<MemoryExperienceProps> = ({
  experience,
  memoryObject,
  userId,
  onComplete,
}) => {
  const [userResponse, setUserResponse] = useState('');
  const [confidence, setConfidence] = useState(50);
  const [startTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (submitted) return;

    setLoading(true);
    const latency = Date.now() - startTime;

    let recallResult: RecallResult = 'incorrect';
    const lowerResponse = userResponse.toLowerCase();
    const titleWords = memoryObject.title.toLowerCase().split(/\s+/);

    const matchCount = titleWords.filter((word) =>
      lowerResponse.includes(word)
    ).length;
    const matchRatio = matchCount / titleWords.length;

    if (matchRatio >= 0.7 && userResponse.length > 20) {
      recallResult = 'correct';
    } else if (matchRatio >= 0.4 || userResponse.length > 10) {
      recallResult = 'partial';
    }

    try {
      await api.recordReview(
        userId,
        memoryObject.id,
        experience.template_type,
        recallResult,
        confidence,
        latency,
        { user_response: userResponse }
      );

      setSubmitted(true);
      if (onComplete) {
        onComplete(recallResult, confidence, latency);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.memoryTitle}>{memoryObject.title}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.promptCard}>
          <Text style={styles.prompt}>{experience.prompt}</Text>
        </View>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={10}
            placeholder="Type your response..."
            placeholderTextColor="#9ca3af"
            value={userResponse}
            onChangeText={setUserResponse}
            editable={!submitted}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.confidenceCard}>
          <View style={styles.confidenceHeader}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <Text style={styles.confidenceValue}>{confidence}%</Text>
          </View>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setConfidence(Math.max(0, confidence - 10))}
            >
              <Text style={styles.sliderButtonText}>−</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${confidence}%` },
                ]}
              />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setConfidence(Math.min(100, confidence + 10))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitted && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitted || loading || !userResponse.trim()}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {submitted ? 'Review Recorded' : 'Submit Review'}
            </Text>
          )}
        </TouchableOpacity>

        {submitted && (
          <View style={styles.successCard}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.successText}>Review recorded successfully</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  memoryTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  promptCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  prompt: {
    fontSize: 17,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  inputCard: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 200,
    backgroundColor: '#ffffff',
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    lineHeight: 24,
  },
  confidenceCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sliderButtonText: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '300',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#111827',
    borderRadius: 3,
  },
  submitButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  successCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  successIcon: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  successText: {
    fontSize: 15,
    color: '#16a34a',
    fontWeight: '500',
  },
});
