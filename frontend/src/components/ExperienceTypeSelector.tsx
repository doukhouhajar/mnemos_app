/**
 * Experience Type Selector - Cursor-Inspired Design
 * Clean, modern selection interface
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ExperienceType } from '@shared/types/domain';
import { BrainIcon, LightbulbIcon, ToolIcon, BookIcon, CheckIcon, TeachIcon } from './Icons';

interface ExperienceTypeOption {
  type: ExperienceType;
  name: string;
  description: string;
  IconComponent: React.FC<{ size?: number; color?: string }>;
  estimatedTime: string;
}

const EXPERIENCE_TYPES: ExperienceTypeOption[] = [
  {
    type: 'free_recall',
    name: 'Free Recall',
    description: 'Recall from memory without cues',
    IconComponent: BrainIcon,
    estimatedTime: '2-3 min',
  },
  {
    type: 'cued_recall',
    name: 'Cued Recall',
    description: 'Recall with helpful prompts',
    IconComponent: LightbulbIcon,
    estimatedTime: '1-2 min',
  },
  {
    type: 'application',
    name: 'Application',
    description: 'Apply the concept to solve problems',
    IconComponent: ToolIcon,
    estimatedTime: '3-5 min',
  },
  {
    type: 'explain_simply',
    name: 'Explain Simply',
    description: 'Explain as if teaching someone else',
    IconComponent: BookIcon,
    estimatedTime: '2-3 min',
  },
  {
    type: 'misconception_detection',
    name: 'Misconception Check',
    description: 'Identify and correct misunderstandings',
    IconComponent: CheckIcon,
    estimatedTime: '2-3 min',
  },
  {
    type: 'micro_teach',
    name: 'Micro Teach',
    description: 'Teach the concept in your own words',
    IconComponent: TeachIcon,
    estimatedTime: '3-4 min',
  },
];

interface ExperienceTypeSelectorProps {
  selectedType?: ExperienceType;
  onSelect: (type: ExperienceType) => void;
}

export const ExperienceTypeSelector: React.FC<ExperienceTypeSelectorProps> = ({
  selectedType,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose experience type</Text>
        <Text style={styles.subtitle}>Select how you want to review this memory</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {EXPERIENCE_TYPES.map((option) => {
          const isSelected = selectedType === option.type;
          return (
            <TouchableOpacity
              key={option.type}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => onSelect(option.type)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                  <option.IconComponent 
                    size={24} 
                    color={isSelected ? '#ffffff' : '#111827'} 
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
                    {option.name}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <View style={styles.optionMeta}>
                  <Text style={styles.optionTime}>{option.estimatedTime}</Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 24,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  optionCardSelected: {
    borderColor: '#111827',
    backgroundColor: '#f9fafb',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: '#111827',
  },
  optionIcon: {
    fontSize: 24,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  optionNameSelected: {
    color: '#111827',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  optionMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  optionTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});
