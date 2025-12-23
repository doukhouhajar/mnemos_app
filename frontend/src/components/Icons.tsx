/**
 * Simple Unicolor Icons
 * Text-based icons matching Cursor's minimal aesthetic
 */

import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const BrainIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>M</Text>
);

export const LightbulbIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>I</Text>
);

export const ToolIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>A</Text>
);

export const BookIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>B</Text>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>✓</Text>
);

export const TeachIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>T</Text>
);

export const GroupIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>G</Text>
);

export const QuestIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>Q</Text>
);

export const TimeIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>⏱</Text>
);

export const SparkleIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>*</Text>
);

export const WarningIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>!</Text>
);

export const InfoIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>i</Text>
);

export const RelayIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>R</Text>
);

export const CollectiveIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>C</Text>
);

export const IndividualIcon: React.FC<IconProps> = ({ size = 20, color = '#111827', style }) => (
  <Text style={[styles.icon, { fontSize: size, color }, style]}>I</Text>
);

const styles = StyleSheet.create({
  icon: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

