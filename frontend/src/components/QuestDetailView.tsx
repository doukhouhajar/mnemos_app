/**
 * Quest Detail View
 * Shows detailed information about a quest, participants, and allows participation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { RelayIcon, CollectiveIcon, IndividualIcon, TimeIcon, QuestIcon } from './Icons';

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

interface QuestDetailViewProps {
  visible: boolean;
  quest: Quest | null;
  userId: string;
  onClose: () => void;
  onParticipate: (questId: string) => void;
  onLeave: (questId: string) => void;
}

export const QuestDetailView: React.FC<QuestDetailViewProps> = ({
  visible,
  quest,
  userId,
  onClose,
  onParticipate,
  onLeave,
}) => {
  if (!quest) return null;

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

  const progressPercent = (quest.progress / quest.target) * 100;
  const daysRemaining = getDaysRemaining(quest.deadline);
  const IconComponent = getChallengeIcon(quest.challengeType);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <IconComponent size={32} color="#111827" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.groupName}>{quest.groupName}</Text>
              <Text style={styles.title}>{quest.title}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{quest.description}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Overall Progress</Text>
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
              <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.infoRow}>
              <TimeIcon size={20} color="#6b7280" />
              <Text style={styles.infoText}>
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
              </Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{quest.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Participants</Text>
              <Text style={styles.participantCount}>
                {quest.participants.length} member{quest.participants.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {quest.participants.length === 0 ? (
              <View style={styles.emptyParticipants}>
                <Text style={styles.emptyText}>No participants yet</Text>
              </View>
            ) : (
              <View style={styles.participantsList}>
                {quest.participants.map((participant) => (
                  <View key={participant.id} style={styles.participantCard}>
                    <View style={styles.participantInfo}>
                      <View style={styles.participantAvatar}>
                        <Text style={styles.participantInitial}>
                          {participant.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.participantDetails}>
                        <Text style={styles.participantName}>{participant.name}</Text>
                        <Text style={styles.participantContribution}>
                          {participant.contribution} contribution{participant.contribution !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.participantProgress}>
                      <Text style={styles.participantProgressText}>
                        {participant.progress}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.actionSection}>
            {quest.isParticipating ? (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={() => onLeave(quest.id)}
              >
                <Text style={styles.leaveButtonText}>Leave Quest</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.participateButton}
                onPress={() => onParticipate(quest.id)}
              >
                <Text style={styles.participateButtonText}>Join Quest</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
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
  headerContent: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f7f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  groupName: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
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
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  progressCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6B9B8A',
    borderRadius: 5,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4caf50',
    letterSpacing: 0.5,
  },
  participantCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyParticipants: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#9ca3af',
  },
  participantsList: {
    gap: 12,
  },
  participantCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B9B8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  participantContribution: {
    fontSize: 13,
    color: '#6b7280',
  },
  participantProgress: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  participantProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  actionSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  participateButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  participateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  leaveButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});

