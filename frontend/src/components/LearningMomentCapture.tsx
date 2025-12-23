/**
 * Learning Moment Capture - Cursor-Inspired Design
 * Clean, minimal bottom sheet with smooth interactions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { LearningMoment } from '@shared/types/domain';
import { api } from '../services/api';

interface LearningMomentCaptureProps {
  visible: boolean;
  userId: string;
  onClose: () => void;
  onSuccess?: (moment: LearningMoment, groupIds?: string[]) => void;
}

export const LearningMomentCapture: React.FC<LearningMomentCaptureProps> = ({
  visible,
  userId,
  onClose,
  onSuccess,
}) => {
  const [rawInput, setRawInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      loadUserGroups();
    }
  }, [visible]);

  const loadUserGroups = async () => {
    try {
      const groups = await api.getUserGroups(userId);
      setAvailableGroups(groups);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!rawInput.trim()) return;

    setLoading(true);
    try {
      const moment = await api.createLearningMoment(userId, { text: rawInput }, 'manual');
      setRawInput('');
      onSuccess?.(moment, selectedGroupIds.length > 0 ? selectedGroupIds : undefined);
      setSelectedGroupIds([]);
      onClose();
    } catch (error) {
      console.error('Error creating learning moment:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    if (selectedGroupIds.includes(groupId)) {
      setSelectedGroupIds(selectedGroupIds.filter(id => id !== groupId));
    } else {
      setSelectedGroupIds([...selectedGroupIds, groupId]);
    }
  };

  const handleClose = () => {
    setRawInput('');
    onClose();
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>New learning moment</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={8}
              placeholder="What did you learn today?"
              placeholderTextColor="#9ca3af"
              value={rawInput}
              onChangeText={setRawInput}
              autoFocus
              textAlignVertical="top"
            />

            {availableGroups.length > 0 && (
              <View style={styles.groupSection}>
                <TouchableOpacity
                  style={styles.groupToggle}
                  onPress={() => setShowGroupSelector(!showGroupSelector)}
                >
                  <Text style={styles.groupToggleText}>
                    {selectedGroupIds.length > 0
                      ? `Share with ${selectedGroupIds.length} group${selectedGroupIds.length !== 1 ? 's' : ''}`
                      : 'Share with group (optional)'}
                  </Text>
                  <Text style={styles.groupToggleIcon}>
                    {showGroupSelector ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>

                {showGroupSelector && (
                  <View style={styles.groupList}>
                    {availableGroups.map((group) => (
                      <TouchableOpacity
                        key={group.id}
                        style={[
                          styles.groupOption,
                          selectedGroupIds.includes(group.id) && styles.groupOptionSelected,
                        ]}
                        onPress={() => toggleGroup(group.id)}
                      >
                        <View style={styles.groupOptionContent}>
                          <View
                            style={[
                              styles.groupCheckbox,
                              selectedGroupIds.includes(group.id) && styles.groupCheckboxSelected,
                            ]}
                          >
                            {selectedGroupIds.includes(group.id) && (
                              <Text style={styles.groupCheckmark}>✓</Text>
                            )}
                          </View>
                          <View style={styles.groupOptionText}>
                            <Text style={styles.groupOptionName}>{group.name}</Text>
                            {group.description && (
                              <Text style={styles.groupOptionDesc} numberOfLines={1}>
                                {group.description}
                              </Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, !rawInput.trim() && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading || !rawInput.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '300',
  },
  content: {
    paddingHorizontal: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 180,
    backgroundColor: '#f9fafb',
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  submitButton: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
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
  groupSection: {
    marginTop: 20,
  },
  groupToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  groupToggleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  groupToggleIcon: {
    fontSize: 12,
    color: '#6b7280',
  },
  groupList: {
    marginTop: 12,
    gap: 8,
  },
  groupOption: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  groupOptionSelected: {
    borderColor: '#111827',
    backgroundColor: '#f9fafb',
  },
  groupOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupCheckboxSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  groupCheckmark: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  groupOptionText: {
    flex: 1,
  },
  groupOptionName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  groupOptionDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
});
