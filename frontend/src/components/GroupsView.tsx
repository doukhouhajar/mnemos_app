/**
 * Groups View Component
 * Shows user's learning groups and group activities
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { GroupIcon } from './Icons';
import { GroupDetailView } from './GroupDetailView';
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
}

interface GroupsViewProps {
  userId: string;
  onGroupSelect?: (groupId: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  userId,
  onGroupSelect,
}) => {
  const [groups] = useState<Group[]>([
    {
      id: 'group-1',
      name: 'Computer Science Study Group',
      description: 'Learning algorithms, data structures, and system design. We focus on practical problem-solving and collaborative learning.',
      memberCount: 12,
      activeQuests: 2,
      members: [
        { id: 'user-1', name: 'Alex Chen', email: 'alex@example.com', joinedAt: new Date('2024-01-15'), contributionCount: 15 },
        { id: 'user-2', name: 'Sarah Johnson', email: 'sarah@example.com', joinedAt: new Date('2024-01-20'), contributionCount: 12 },
        { id: 'user-3', name: 'Mike Davis', email: 'mike@example.com', joinedAt: new Date('2024-02-01'), contributionCount: 8 },
        { id: userId, name: 'You', email: 'you@example.com', joinedAt: new Date('2024-02-10'), contributionCount: 5 },
      ],
      sharedMemories: [
        { id: 'mem-1', owner_id: userId, title: 'Binary Search', definition: 'A search algorithm that finds the position of a target value within a sorted array.', intuition: 'Divide and conquer approach', examples: [], common_misconceptions: [], reference_links: [], metadata: {}, created_at: new Date(), updated_at: new Date() },
        { id: 'mem-2', owner_id: userId, title: 'Hash Tables', definition: 'A data structure that implements an associative array abstract data type.', intuition: 'Key-value mapping for fast lookups', examples: [], common_misconceptions: [], reference_links: [], metadata: {}, created_at: new Date(), updated_at: new Date() },
      ],
      isMember: true,
      isOwner: false,
      ownerId: 'user-1',
    },
    {
      id: 'group-2',
      name: 'Language Learning Circle',
      description: 'Spanish vocabulary and grammar practice. We share learning resources and practice together weekly.',
      memberCount: 8,
      activeQuests: 1,
      members: [
        { id: 'user-5', name: 'David Lee', email: 'david@example.com', joinedAt: new Date('2024-01-10'), contributionCount: 20 },
        { id: 'user-6', name: 'Lisa Brown', email: 'lisa@example.com', joinedAt: new Date('2024-01-12'), contributionCount: 18 },
      ],
      sharedMemories: [
        { id: 'mem-3', owner_id: userId, title: 'Present Tense Conjugation', definition: 'Regular verb endings in Spanish present tense.', intuition: 'Pattern-based conjugation rules', examples: [], common_misconceptions: [], reference_links: [], metadata: {}, created_at: new Date(), updated_at: new Date() },
      ],
      isMember: false,
      isOwner: false,
      ownerId: 'user-5',
    },
  ]);

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupDetail, setShowGroupDetail] = useState(false);

  const renderGroupCard = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => {
        setSelectedGroup(item);
        setShowGroupDetail(true);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.groupHeader}>
                  <View style={styles.groupIcon}>
                    <GroupIcon size={24} color="#111827" />
                  </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
      
      <View style={styles.groupStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.memberCount}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.activeQuests}</Text>
          <Text style={styles.statLabel}>Active Quests</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Groups</Text>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+ Create Group</Text>
        </TouchableOpacity>
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <GroupIcon size={48} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>No Groups Yet</Text>
          <Text style={styles.emptyText}>
            Join or create a group to collaborate on learning
          </Text>
          <TouchableOpacity style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Create Your First Group</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroupCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <GroupDetailView
        visible={showGroupDetail}
        group={selectedGroup}
        userId={userId}
        onClose={() => {
          setShowGroupDetail(false);
          setSelectedGroup(null);
        }}
        onJoin={(groupId) => {
          // Update group membership status
          const updatedGroups = groups.map(g =>
            g.id === groupId ? { ...g, isMember: true } : g
          );
          // In a real app, this would call an API
          console.log('Joining group:', groupId);
          setShowGroupDetail(false);
        }}
        onLeave={(groupId) => {
          // Update group membership status
          const updatedGroups = groups.map(g =>
            g.id === groupId ? { ...g, isMember: false } : g
          );
          // In a real app, this would call an API
          console.log('Leaving group:', groupId);
          setShowGroupDetail(false);
        }}
        onMemorySelect={(memory) => {
          if (onGroupSelect) {
            onGroupSelect(selectedGroup!.id);
          }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  createButton: {
    backgroundColor: '#6B9B8A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f7f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupIconText: {
    fontSize: 28,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  groupStats: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B9B8A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
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
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#6B9B8A',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

