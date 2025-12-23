/**
 * AI-Assisted Memory Object Creation
 * Uses AI to help structure learning moments into memory objects
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LearningMoment } from '@shared/types/domain';
import { AIPrefilledForm } from './AIPrefilledForm';
import { api } from '../services/api';

interface AIAssistedFormProps {
  learningMoment: LearningMoment;
  userId: string;
  onSuccess?: (memoryObject: any) => void;
  onCancel?: () => void;
  onManual?: () => void;
}

export const AIAssistedForm: React.FC<AIAssistedFormProps> = ({
  learningMoment,
  userId,
  onSuccess,
  onCancel,
  onManual,
}) => {
  const [loading, setLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAIGenerate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const rawText = learningMoment.raw_input.text || '';
      if (!rawText.trim()) {
        setError('Please provide some text to generate from');
        setLoading(false);
        return;
      }

      // Call the real AI endpoint
      const structured = await api.structureWithAI(rawText);
      
      setAiGenerated(structured);
    } catch (err: any) {
      console.error('AI generation error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate with AI. Make sure OPENAI_API_KEY is set.');
    } finally {
      setLoading(false);
    }
  };

  if (aiGenerated) {
    // Pre-fill the form with AI-generated data
    return (
      <AIPrefilledForm
        learningMoment={learningMoment}
        userId={userId}
        aiGenerated={aiGenerated}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>AI-Assisted Creation</Text>
          {onCancel && (
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Learning Moment:</Text>
          <Text style={styles.previewText} numberOfLines={5}>
            {learningMoment.raw_input.text || 'No text provided'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            AI will help structure your learning moment into a memory object with:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Clear title and definition</Text>
            <Text style={styles.featureItem}>• Intuitive explanation</Text>
            <Text style={styles.featureItem}>• Relevant examples</Text>
            <Text style={styles.featureItem}>• Common misconceptions</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleAIGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Generate with AI</Text>
            )}
          </TouchableOpacity>

          {onManual && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onManual}
            >
              <Text style={styles.secondaryButtonText}>Create Manually</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  previewCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#f0f7f4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#6B9B8A',
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  featureList: {
    marginLeft: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: '#ffe8e8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#6B9B8A',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});

