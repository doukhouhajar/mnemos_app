/**
 * Memory Card Actions Menu
 * Edit, Delete, Duplicate actions with proper UX
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { MemoryObject } from '@shared/types/domain';

interface MemoryCardActionsProps {
  visible: boolean;
  memory: MemoryObject | null;
  onClose: () => void;
  onEdit: (memory: MemoryObject) => void;
  onDelete: (memory: MemoryObject) => void;
  onDuplicate: (memory: MemoryObject) => void;
}

export const MemoryCardActions: React.FC<MemoryCardActionsProps> = ({
  visible,
  memory,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible]);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (memory) {
      onDelete(memory);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  if (!memory) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <>
      <Modal
        visible={visible && !showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              {
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onEdit(memory);
                  onClose();
                }}
              >
                <Text style={styles.menuItemText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onDuplicate(memory);
                  onClose();
                }}
              >
                <Text style={styles.menuItemText}>Duplicate</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemDestructive]}
                onPress={handleDelete}
              >
                <Text style={[styles.menuItemText, styles.menuItemTextDestructive]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Delete Memory?</Text>
            <Text style={styles.confirmText}>
              This will permanently delete "{memory.title}". This action cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonCancel]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.confirmButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonDelete]}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmButtonTextDelete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  menu: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  menuItemDestructive: {
    marginTop: 4,
  },
  menuItemText: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '400',
  },
  menuItemTextDestructive: {
    color: '#dc2626',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 4,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmDialog: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  confirmText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  confirmButtonCancel: {
    backgroundColor: '#f3f4f6',
  },
  confirmButtonDelete: {
    backgroundColor: '#dc2626',
  },
  confirmButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  confirmButtonTextDelete: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

