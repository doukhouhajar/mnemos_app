/**
 * MNEMOS Logo Component
 * Stylized golden "M" with memory/calendar symbolism
 * Using text-based approach for simplicity
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MnemosLogoProps {
  size?: number;
  color?: string;
}

export const MnemosLogo: React.FC<MnemosLogoProps> = ({ 
  size = 32, 
  color = '#D4AF37' // Metallic gold
}) => {
  // For "MNEMOS" text, use a more appropriate font size
  const fontSize = Math.max(size * 0.35, 12);
  return (
    <View style={styles.container}>
      <Text style={[styles.logoText, { fontSize, color }]}>
        MNEMOS
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: '700',
    fontFamily: 'System',
    letterSpacing: 1.5,
  },
});

