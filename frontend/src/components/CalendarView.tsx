/**
 * Calendar View Component - Cursor-Inspired Modern Design
 * Clean, minimal, interactive UI inspired by Cursor's aesthetic
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Calendar, DateData, MarkedDates } from 'react-native-calendars';
import { MemoryObject, ScheduleState } from '@shared/types/domain';
import { api } from '../services/api';
import { MnemosLogo } from './MnemosLogo';
import { LearningMomentCapture } from './LearningMomentCapture';
import { MemoryObjectForm } from './MemoryObjectForm';
import { AIAssistedForm } from './AIAssistedForm';
import { DateLearningMoments } from './DateLearningMoments';
import { LearningMoment } from '@shared/types/domain';

const { width } = Dimensions.get('window');

interface CalendarViewProps {
  userId: string;
  onMemorySelect?: (memory: MemoryObject) => void;
  onDateSelect?: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  userId,
  onMemorySelect,
  onDateSelect,
}) => {
  const [dueMemories, setDueMemories] = useState<MemoryObject[]>([]);
  const [scheduleStates, setScheduleStates] = useState<Map<string, ScheduleState>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [showLearningMomentCapture, setShowLearningMomentCapture] = useState(false);
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [showAIAssistedForm, setShowAIAssistedForm] = useState(false);
  const [showDateMoments, setShowDateMoments] = useState(false);
  const [selectedDateForMoments, setSelectedDateForMoments] = useState<Date | null>(null);
  const [selectedLearningMoment, setSelectedLearningMoment] = useState<LearningMoment | null>(null);
  const [loading, setLoading] = useState(false);
  const [fabScale] = useState(new Animated.Value(1));

  useEffect(() => {
    loadDueMemories();
    loadScheduleStates();
  }, [userId]);

  const loadDueMemories = async () => {
    try {
      setLoading(true);
      const memories = await api.getDueMemories(userId);
      setDueMemories(memories);
      updateMarkedDates(memories);
    } catch (error) {
      console.error('Error loading due memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleStates = async () => {
    try {
      const memories = await api.getMemoryObjects(userId);
      const statesMap = new Map<string, ScheduleState>();
      
      for (const memory of memories) {
        try {
          const state = await api.getScheduleState(userId, memory.id);
          statesMap.set(memory.id, state);
        } catch (error) {
          // Schedule state might not exist yet
        }
      }
      
      setScheduleStates(statesMap);
      updateMarkedDatesFromStates(statesMap);
    } catch (error) {
      console.error('Error loading schedule states:', error);
    }
  };

  const updateMarkedDates = (memories: MemoryObject[]) => {
    const marked: MarkedDates = {};
    const today = new Date().toISOString().split('T')[0];
    
    memories.forEach((memory) => {
      const state = scheduleStates.get(memory.id);
      if (state) {
        const dueDate = new Date(state.next_due).toISOString().split('T')[0];
        if (!marked[dueDate]) {
          marked[dueDate] = {
            marked: true,
            dotColor: '#6366f1',
          };
        }
      } else {
        if (!marked[today]) {
          marked[today] = {
            marked: true,
            dotColor: '#6366f1',
          };
        }
      }
    });
    
    setMarkedDates(marked);
  };

  const updateMarkedDatesFromStates = (states: Map<string, ScheduleState>) => {
    const marked: MarkedDates = { ...markedDates };
    
    states.forEach((state) => {
      const dueDate = new Date(state.next_due).toISOString().split('T')[0];
      if (!marked[dueDate]) {
        marked[dueDate] = {
          marked: true,
          dotColor: '#6366f1',
        };
      }
    });
    
    setMarkedDates(marked);
  };

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    const pressedDate = new Date(day.dateString);
    setSelectedDateForMoments(pressedDate);
    setShowDateMoments(true);
    if (onDateSelect) {
      onDateSelect(pressedDate);
    }
  };

  const handleLearningMomentSuccess = (moment: LearningMoment) => {
    setSelectedLearningMoment(moment);
    setShowLearningMomentCapture(false);
    setShowAIAssistedForm(true);
  };

  const handleAIAssistedCancel = () => {
    setShowAIAssistedForm(false);
    setSelectedLearningMoment(null);
  };

  const handleAIAssistedManual = () => {
    setShowAIAssistedForm(false);
    setShowMemoryForm(true);
  };

  const handleMemoryObjectSuccess = () => {
    setShowMemoryForm(false);
    setShowAIAssistedForm(false);
    setSelectedLearningMoment(null);
    loadDueMemories();
    loadScheduleStates();
  };

  const handleFabPress = () => {
    Animated.sequence([
      Animated.spring(fabScale, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    setShowLearningMomentCapture(true);
  };

  const todayMemories = dueMemories.filter((memory) => {
    const state = scheduleStates.get(memory.id);
    if (state) {
      const dueDate = new Date(state.next_due).toISOString().split('T')[0];
      return dueDate === selectedDate;
    }
    return false;
  });

  return (
    <View style={styles.container}>
      {/* Minimal Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MnemosLogo size={24} color="#1a1a1a" />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          <Calendar
            current={selectedDate}
            onDayPress={onDayPress}
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                ...markedDates[selectedDate],
                selected: true,
                selectedColor: '#6366f1',
                selectedTextColor: '#ffffff',
              },
              [new Date().toISOString().split('T')[0]]: {
                ...markedDates[new Date().toISOString().split('T')[0]],
                customStyles: {
                  container: {
                    backgroundColor: '#6366f1',
                    borderRadius: 20,
                  },
                  text: {
                    color: '#ffffff',
                    fontWeight: '600',
                  },
                },
              },
            }}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#6b7280',
              selectedDayBackgroundColor: '#6366f1',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#6366f1',
              dayTextColor: '#1f2937',
              textDisabledColor: '#d1d5db',
              dotColor: '#6366f1',
              selectedDotColor: '#ffffff',
              arrowColor: '#6366f1',
              monthTextColor: '#111827',
              textDayFontWeight: '400',
              textMonthFontWeight: '500',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 15,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
            style={styles.calendar}
            markingType="dot"
          />
        </View>

        {/* Today's Memories Card */}
        <View style={styles.memoriesCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today</Text>
            {todayMemories.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{todayMemories.length}</Text>
              </View>
            )}
          </View>
          
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Loading...</Text>
            </View>
          ) : todayMemories.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>*</Text>
              </View>
              <Text style={styles.emptyTitle}>All caught up</Text>
              <Text style={styles.emptySubtext}>
                No memories scheduled for today. Enjoy the spacing.
              </Text>
            </View>
          ) : (
            <View style={styles.memoriesList}>
              {todayMemories.map((memory) => {
                const state = scheduleStates.get(memory.id);
                return (
                  <TouchableOpacity
                    key={memory.id}
                    style={styles.memoryItem}
                    onPress={() => onMemorySelect && onMemorySelect(memory)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.memoryContent}>
                      <Text style={styles.memoryTitle} numberOfLines={1}>
                        {memory.title}
                      </Text>
                      {state && (
                        <View style={styles.memoryMeta}>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                { width: `${Math.min(state.difficulty * 100, 100)}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.memoryTime}>~2 min</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modern FAB */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleFabPress}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Modals */}
      <LearningMomentCapture
        visible={showLearningMomentCapture}
        userId={userId}
        onClose={() => setShowLearningMomentCapture(false)}
        onSuccess={handleLearningMomentSuccess}
      />

      {selectedLearningMoment && showAIAssistedForm && (
        <Modal
          visible={showAIAssistedForm}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <AIAssistedForm
            learningMoment={selectedLearningMoment}
            userId={userId}
            onSuccess={handleMemoryObjectSuccess}
            onCancel={handleAIAssistedCancel}
            onManual={handleAIAssistedManual}
          />
        </Modal>
      )}

      {selectedLearningMoment && showMemoryForm && (
        <Modal
          visible={showMemoryForm}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <MemoryObjectForm
            learningMoment={selectedLearningMoment}
            userId={userId}
            onSuccess={handleMemoryObjectSuccess}
            onCancel={() => {
              setShowMemoryForm(false);
              setSelectedLearningMoment(null);
            }}
          />
        </Modal>
      )}

      {/* Date Learning Moments Modal */}
      {selectedDateForMoments && (
        <DateLearningMoments
          visible={showDateMoments}
          date={selectedDateForMoments}
          userId={userId}
          onClose={() => {
            setShowDateMoments(false);
            setSelectedDateForMoments(null);
          }}
          onMemorySelect={(memory) => {
            setShowDateMoments(false);
            setSelectedDateForMoments(null);
            if (onMemorySelect) {
              onMemorySelect(memory);
            }
          }}
        />
      )}
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
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  logoContainer: {
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  calendar: {
    borderRadius: 12,
  },
  memoriesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  memoriesList: {
    gap: 12,
  },
  memoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  memoryContent: {
    flex: 1,
    gap: 8,
  },
  memoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  memoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  memoryTime: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 24,
    color: '#9ca3af',
    fontWeight: '300',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
    lineHeight: 28,
  },
});
