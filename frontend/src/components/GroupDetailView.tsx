/**
 * Group Detail View
 * Shows detailed information about a group, members, and shared memories
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
import { GroupIcon } from './Icons';
import { AddMemberForm } from './AddMemberForm';
import { MemoryObject } from '@shared/types/domain';

interface Member {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  contributionCount: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  activeQuests: number;
  members: Member[];
  sharedMemories: MemoryObject[];
  isMember: boolean;
  isOwner: boolean;
  ownerId: string;
}

interface GroupDetailViewProps {
  visible: boolean;
  group: Group | null;
  userId: string;
  onClose: () => void;
  onJoin: (groupId: string) => void;
  onLeave: (groupId: string) => void;
  onMemorySelect?: (memory: MemoryObject) => void;
  onMemberAdded?: () => void;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({
  visible,
  group,
  userId,
  onClose,
  onJoin,
  onLeave,
  onMemorySelect,
  onMemberAdded,
}) => {
  const [showAddMember, setShowAddMember] = useState(false);

  if (!group) return null;

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
              <GroupIcon size={32} color="#111827" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{group.name}</Text>
              <Text style={styles.subtitle}>
                {group.memberCount} member{group.memberCount !== 1 ? 's' : ''} • {group.activeQuests} active quest{group.activeQuests !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{group.description}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Members</Text>
              <View style={styles.sectionHeaderRight}>
                <Text style={styles.memberCount}>
                  {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                </Text>
                {group.isOwner && (
                  <TouchableOpacity
                    style={styles.addMemberButton}
                    onPress={() => setShowAddMember(true)}
                  >
                    <Text style={styles.addMemberButtonText}>+ Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {group.members.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No members yet</Text>
              </View>
            ) : (
              <View style={styles.membersList}>
                {group.members.map((member) => (
                  <View key={member.id} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberInitial}>
                          {member.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.memberDetails}>
                        <View style={styles.memberNameRow}>
                          <Text style={styles.memberName}>{member.name}</Text>
                          {member.id === userId && (
                            <View style={styles.youBadge}>
                              <Text style={styles.youBadgeText}>You</Text>
                            </View>
                          )}
                          {member.id === group.ownerId && (
                            <View style={styles.ownerBadge}>
                              <Text style={styles.ownerBadgeText}>Owner</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.memberEmail}>{member.email}</Text>
                        <Text style={styles.memberStats}>
                          {member.contributionCount} contribution{member.contributionCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shared Memories</Text>
              <Text style={styles.memoryCount}>
                {group.sharedMemories.length} memor{group.sharedMemories.length !== 1 ? 'ies' : 'y'}
              </Text>
            </View>

            {group.sharedMemories.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No shared memories yet</Text>
              </View>
            ) : (
              <View style={styles.memoriesList}>
                {group.sharedMemories.map((memory) => (
                  <TouchableOpacity
                    key={memory.id}
                    style={styles.memoryCard}
                    onPress={() => onMemorySelect && onMemorySelect(memory)}
                  >
                    <Text style={styles.memoryTitle}>{memory.title}</Text>
                    <Text style={styles.memoryDefinition} numberOfLines={2}>
                      {memory.definition}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.actionSection}>
            {group.isMember ? (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={() => onLeave(group.id)}
              >
                <Text style={styles.leaveButtonText}>Leave Group</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => onJoin(group.id)}
              >
                <Text style={styles.joinButtonText}>Join Group</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Add Member Modal */}
      <AddMemberForm
        visible={showAddMember}
        groupId={group.id}
        existingMemberIds={group.members.map(m => m.id)}
        onClose={() => setShowAddMember(false)}
        onSuccess={() => {
          setShowAddMember(false);
          if (onMemberAdded) {
            onMemberAdded();
          }
        }}
      />
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
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
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addMemberButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  addMemberButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
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
  memberCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  memoryCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#9ca3af',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#d1d5db',
    textAlign: 'center',
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6B9B8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memberInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  memberDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  youBadge: {
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  youBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  ownerBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ownerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  memberEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  memberStats: {
    fontSize: 13,
    color: '#9ca3af',
  },
  memoriesList: {
    gap: 12,
  },
  memoryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  memoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  memoryDefinition: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actionSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  joinButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  joinButtonText: {
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

