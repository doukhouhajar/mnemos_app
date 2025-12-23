/**
 * Groups View Component
 * Shows user's learning groups and group activities
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { GroupIcon } from './Icons';
import { GroupDetailView } from './GroupDetailView';
import { CreateGroupForm } from './CreateGroupForm';
import { MemoryObject } from '@shared/types/domain';
import { api } from '../services/api';

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

interface GroupsViewProps {
  userId: string;
  onGroupSelect?: (groupId: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  userId,
  onGroupSelect,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupDetail, setShowGroupDetail] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadGroups();
  }, [userId]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const fetchedGroups = await api.getUserGroups(userId);
      
      // Transform API response to match Group interface
      const transformedGroups: Group[] = await Promise.all(
        fetchedGroups.map(async (group: any) => {
          // Fetch members details
          let members: Member[] = [];
          try {
            const memberData = await api.getGroupMembers(group.id);
            members = memberData.map((m: any) => ({
              id: m.id,
              name: m.name || 'Unknown',
              email: m.email || '',
              joinedAt: new Date(), // API doesn't return this yet
              contributionCount: 0, // API doesn't return this yet
            }));
          } catch (error) {
            console.error('Error fetching members:', error);
          }

          return {
            id: group.id,
            name: group.name,
            description: group.description || '',
            memberCount: group.members?.length || 0,
            activeQuests: 0, // TODO: Fetch from quests API
            members,
            sharedMemories: [], // TODO: Fetch from memory objects API
            isMember: group.members?.includes(userId) || false,
            isOwner: group.owner_id === userId,
            ownerId: group.owner_id,
          };
        })
      );
      
      setGroups(transformedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateForm(true)}
        >
          <Text style={styles.createButtonText}>+ Create Group</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : groups.length === 0 ? (
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
        onJoin={async (groupId) => {
          try {
            await api.joinGroup(groupId, userId);
            loadGroups();
            setShowGroupDetail(false);
          } catch (error) {
            console.error('Error joining group:', error);
          }
        }}
        onLeave={async (groupId) => {
          try {
            await api.leaveGroup(groupId, userId);
            loadGroups();
            setShowGroupDetail(false);
          } catch (error) {
            console.error('Error leaving group:', error);
          }
        }}
        onMemorySelect={(memory) => {
          if (onGroupSelect) {
            onGroupSelect(selectedGroup!.id);
          }
        }}
        onMemberAdded={() => {
          loadGroups();
        }}
      />

      {/* Create Group Form */}
      <CreateGroupForm
        visible={showCreateForm}
        userId={userId}
        onClose={() => setShowCreateForm(false)}
        onSuccess={() => {
          loadGroups();
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});

