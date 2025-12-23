/**
 * Weekly Quests View
 * Shows active weekly learning challenges
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { RelayIcon, CollectiveIcon, IndividualIcon, TimeIcon, QuestIcon } from './Icons';
import { QuestDetailView } from './QuestDetailView';

interface Participant {
  id: string;
  name: string;
  progress: number;
  contribution: number;
}

interface Quest {
  id: string;
  groupName: string;
  challengeType: 'relay' | 'collective' | 'individual';
  title: string;
  description: string;
  progress: number;
  target: number;
  deadline: Date;
  status: 'active' | 'completed' | 'cancelled';
  participants: Participant[];
  isParticipating: boolean;
}

interface WeeklyQuestsViewProps {
  userId: string;
  groupId?: string;
}

export const WeeklyQuestsView: React.FC<WeeklyQuestsViewProps> = ({
  userId,
  groupId,
}) => {
  const [quests] = useState<Quest[]>([
    {
      id: 'quest-1',
      groupName: 'Computer Science Study Group',
      challengeType: 'relay',
      title: 'Algorithm Relay Challenge',
      description: 'Each member teaches one algorithm concept to the group. Members take turns explaining different algorithms, building a comprehensive knowledge base together.',
      progress: 8,
      target: 12,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'active',
      participants: [
        { id: 'user-1', name: 'Alex Chen', progress: 2, contribution: 2 },
        { id: 'user-2', name: 'Sarah Johnson', progress: 2, contribution: 2 },
        { id: 'user-3', name: 'Mike Davis', progress: 1, contribution: 1 },
        { id: 'user-4', name: 'Emma Wilson', progress: 3, contribution: 3 },
      ],
      isParticipating: false,
    },
    {
      id: 'quest-2',
      groupName: 'Language Learning Circle',
      challengeType: 'collective',
      title: '100 Vocabulary Words',
      description: 'Group goal: learn 100 new Spanish words together. Everyone contributes by learning and teaching new vocabulary words to the group.',
      progress: 67,
      target: 100,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'active',
      participants: [
        { id: 'user-5', name: 'David Lee', progress: 15, contribution: 15 },
        { id: 'user-6', name: 'Lisa Brown', progress: 12, contribution: 12 },
        { id: 'user-7', name: 'Tom Anderson', progress: 20, contribution: 20 },
        { id: 'user-8', name: 'Maria Garcia', progress: 20, contribution: 20 },
      ],
      isParticipating: true,
    },
  ]);

  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showQuestDetail, setShowQuestDetail] = useState(false);

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'relay':
        return RelayIcon;
      case 'collective':
        return CollectiveIcon;
      case 'individual':
        return IndividualIcon;
      default:
        return QuestIcon;
    }
  };

  const getDaysRemaining = (deadline: Date) => {
    const days = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Quests</Text>
        <Text style={styles.subtitle}>Active challenges and goals</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {quests.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <QuestIcon size={48} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>No Active Quests</Text>
            <Text style={styles.emptyText}>
              Join a group to participate in weekly learning challenges
            </Text>
          </View>
        ) : (
          quests.map((quest) => {
            const progressPercent = (quest.progress / quest.target) * 100;
            const daysRemaining = getDaysRemaining(quest.deadline);
            const IconComponent = getChallengeIcon(quest.challengeType);

            return (
              <View key={quest.id} style={styles.questCard}>
                <View style={styles.questHeader}>
                  <View style={styles.questIconContainer}>
                    <IconComponent size={24} color="#111827" />
                  </View>
                  <View style={styles.questInfo}>
                    <Text style={styles.questGroup}>{quest.groupName}</Text>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                  </View>
                  <View style={styles.questStatus}>
                    <View
                      style={[
                        styles.statusBadge,
                        quest.status === 'active' && styles.statusBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          quest.status === 'active' && styles.statusTextActive,
                        ]}
                      >
                        {quest.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.questDescription}>{quest.description}</Text>

                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressText}>
                      {quest.progress} / {quest.target}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.min(progressPercent, 100)}%` },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.questFooter}>
                  <View style={styles.footerItem}>
                    <TimeIcon size={16} color="#6b7280" />
                    <Text style={styles.footerText}>
                      {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => {
                      setSelectedQuest(quest);
                      setShowQuestDetail(true);
                    }}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <QuestDetailView
        visible={showQuestDetail}
        quest={selectedQuest}
        userId={userId}
        onClose={() => {
          setShowQuestDetail(false);
          setSelectedQuest(null);
        }}
        onParticipate={(questId) => {
          // Update quest participation status
          const updatedQuests = quests.map(q =>
            q.id === questId ? { ...q, isParticipating: true } : q
          );
          // In a real app, this would call an API
          console.log('Participating in quest:', questId);
          setShowQuestDetail(false);
        }}
        onLeave={(questId) => {
          // Update quest participation status
          const updatedQuests = quests.map(q =>
            q.id === questId ? { ...q, isParticipating: false } : q
          );
          // In a real app, this would call an API
          console.log('Leaving quest:', questId);
          setShowQuestDetail(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  questCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginBottom: 0,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  questIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f7f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questIcon: {
    fontSize: 24,
  },
  questInfo: {
    flex: 1,
  },
  questGroup: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  questStatus: {
    justifyContent: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  statusBadgeActive: {
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#888',
  },
  statusTextActive: {
    color: '#4caf50',
  },
  questDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  progressText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6B9B8A',
    borderRadius: 4,
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6B9B8A',
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

