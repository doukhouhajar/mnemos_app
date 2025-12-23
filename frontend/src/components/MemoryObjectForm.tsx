/**
 * Memory Object Creation Form
 * Manual creation of memory objects from learning moments
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MemoryObject, LearningMoment } from '@shared/types/domain';
import { api } from '../services/api';

interface MemoryObjectFormProps {
  learningMoment?: LearningMoment;
  memoryObject?: MemoryObject; // For editing existing memory
  userId: string;
  onSuccess?: (memoryObject: MemoryObject) => void;
  onCancel?: () => void;
}

export const MemoryObjectForm: React.FC<MemoryObjectFormProps> = ({
  learningMoment,
  memoryObject,
  userId,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = !!memoryObject;
  const [title, setTitle] = useState(memoryObject?.title || '');
  const [definition, setDefinition] = useState(memoryObject?.definition || '');
  const [intuition, setIntuition] = useState(memoryObject?.intuition || '');
  const [examples, setExamples] = useState(
    memoryObject?.examples.join('\n') || ''
  );
  const [misconceptions, setMisconceptions] = useState(
    memoryObject?.common_misconceptions.join('\n') || ''
  );
  const [referenceLinks, setReferenceLinks] = useState(
    memoryObject?.reference_links.join('\n') || ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !definition.trim() || !intuition.trim()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && memoryObject) {
        // Update existing memory
        const updated = await api.updateMemoryObject(memoryObject.id, {
          title: title.trim(),
          definition: definition.trim(),
          intuition: intuition.trim(),
          examples: examples.split('\n').filter(e => e.trim()),
          common_misconceptions: misconceptions.split('\n').filter(m => m.trim()),
          reference_links: referenceLinks.split('\n').filter(r => r.trim()),
        });
        if (onSuccess) onSuccess(updated);
        return;
      }

      // Create new memory from learning moment
      if (!learningMoment) {
        throw new Error('Learning moment is required for new memories');
      }

      const memoryData = {
        owner_id: userId,
        title: title.trim(),
        definition: definition.trim(),
        intuition: intuition.trim(),
        examples: examples.split('\n').filter(e => e.trim()),
        common_misconceptions: misconceptions.split('\n').filter(m => m.trim()),
        reference_links: referenceLinks.split('\n').filter(r => r.trim()),
        metadata: {},
      };

      const memoryObject = await api.createMemoryObject(learningMoment.id, memoryData);
      onSuccess?.(memoryObject);
    } catch (error) {
      console.error('Error creating memory object:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Memory Object</Text>
          {onCancel && (
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief, memorable title"
            value={title}
            onChangeText={setTitle}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Definition *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Precise definition"
            value={definition}
            onChangeText={setDefinition}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Intuition *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="How to think about this concept"
            value={intuition}
            onChangeText={setIntuition}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Examples (one per line)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Example 1&#10;Example 2"
            value={examples}
            onChangeText={setExamples}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Common Misconceptions (one per line)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Misconception 1&#10;Misconception 2"
            value={misconceptions}
            onChangeText={setMisconceptions}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Reference Links (one per line)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="https://example.com&#10;https://another.com"
            value={referenceLinks}
            onChangeText={setReferenceLinks}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!title.trim() || !definition.trim() || !intuition.trim() || loading) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!title.trim() || !definition.trim() || !intuition.trim() || loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating...' : 'Create Memory'}
          </Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#1a1a1a',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6B9B8A',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

