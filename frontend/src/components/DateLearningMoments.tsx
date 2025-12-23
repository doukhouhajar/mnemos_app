/**
 * Date Learning Moments View
 * Shows learning moments and memories for a selected date
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LearningMoment, MemoryObject } from '@shared/types/domain';
import { api } from '../services/api';

interface DateLearningMomentsProps {
  visible: boolean;
  date: Date;
  userId: string;
  onClose: () => void;
  onMemorySelect?: (memory: MemoryObject) => void;
}

export const DateLearningMoments: React.FC<DateLearningMomentsProps> = ({
  visible,
  date,
  userId,
  onClose,
  onMemorySelect,
}) => {
  const [learningMoments, setLearningMoments] = useState<LearningMoment[]>([]);
  const [memoryObjects, setMemoryObjects] = useState<MemoryObject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadDateData();
    }
  }, [visible, date]);

  const loadDateData = async () => {
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const moments = await api.getLearningMoments(userId, dateStr);
      setLearningMoments(moments);

      // Load memory objects for moments that have been processed
      const processedMoments = moments.filter(m => m.memory_object_id);
      if (processedMoments.length > 0) {
        const memoryIds = processedMoments.map(m => m.memory_object_id!);
        const memories = await Promise.all(
          memoryIds.map(id => api.getMemoryObject(id).catch(() => null))
        );
        setMemoryObjects(memories.filter(m => m !== null) as MemoryObject[]);
      } else {
        setMemoryObjects([]);
      }
    } catch (error) {
      console.error('Error loading date data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{formatDate(date)}</Text>
            <Text style={styles.subtitle}>
              {learningMoments.length} learning moment{learningMoments.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#111827" />
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {learningMoments.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Text style={styles.emptyIcon}>*</Text>
                </View>
                <Text style={styles.emptyTitle}>No learning moments</Text>
                <Text style={styles.emptyText}>
                  No learning moments were captured on this day.
                </Text>
              </View>
            ) : (
              <>
                {learningMoments.map((moment) => {
                  const memory = memoryObjects.find(m => m.id === moment.memory_object_id);
                  return (
                    <View key={moment.id} style={styles.momentCard}>
                      <View style={styles.momentHeader}>
                        <View style={styles.timeContainer}>
                          <Text style={styles.timeText}>
                            {new Date(moment.timestamp).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        {moment.source === 'ai-assisted' && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>AI</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.momentText} numberOfLines={4}>
                        {moment.raw_input.text || 'No text provided'}
                      </Text>

                      {memory && (
                        <TouchableOpacity
                          style={styles.memoryLink}
                          onPress={() => onMemorySelect && onMemorySelect(memory)}
                        >
                          <Text style={styles.memoryLinkText}>
                            → {memory.title}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {!memory && (
                        <Text style={styles.unprocessedText}>
                          Not yet structured into a memory
                        </Text>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 50 : 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 32,
    color: '#9ca3af',
    fontWeight: '300',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  momentCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  momentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  badge: {
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  momentText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
    marginBottom: 12,
  },
  memoryLink: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  memoryLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  unprocessedText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

