/**
 * Metacognition Dashboard - Cursor-Inspired Design
 * Clean, data-focused insights view
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { api } from '../services/api';
import { MemoryObject } from '@shared/types/domain';

interface MetacognitionDashboardProps {
  userId: string;
  memoryObjectId?: string;
}

interface MetacognitionMetrics {
  recall_accuracy: number;
  average_confidence: number;
  calibration_error: number;
  overconfidence_count: number;
  underconfidence_count: number;
}

export const MetacognitionDashboard: React.FC<MetacognitionDashboardProps> = ({
  userId,
  memoryObjectId,
}) => {
  const [metrics, setMetrics] = useState<MetacognitionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [memoryObjects, setMemoryObjects] = useState<MemoryObject[]>([]);

  useEffect(() => {
    loadMetrics();
  }, [userId, memoryObjectId]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMetrics({
        recall_accuracy: 0.75,
        average_confidence: 0.68,
        calibration_error: 0.12,
        overconfidence_count: 15,
        underconfidence_count: 8,
      });

      const memories = await api.getMemoryObjects(userId);
      setMemoryObjects(memories);
    } catch (error) {
      console.error('Error loading metacognition metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No data available yet</Text>
      </View>
    );
  }

  const calibrationScore = 100 - (metrics.calibration_error * 100);
  const accuracyScore = metrics.recall_accuracy * 100;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Your learning performance</Text>
      </View>

      <View style={styles.scoresContainer}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Calibration</Text>
          <Text style={styles.scoreValue}>{calibrationScore.toFixed(0)}%</Text>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${calibrationScore}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Accuracy</Text>
          <Text style={styles.scoreValue}>{accuracyScore.toFixed(0)}%</Text>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${accuracyScore}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.metricsCard}>
        <Text style={styles.sectionTitle}>Metrics</Text>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Average Confidence</Text>
          <Text style={styles.metricValue}>
            {(metrics.average_confidence * 100).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Calibration Error</Text>
          <Text style={styles.metricValue}>
            {(metrics.calibration_error * 100).toFixed(1)}%
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Overconfidence</Text>
          <Text style={styles.metricValue}>{metrics.overconfidence_count}</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Underconfidence</Text>
          <Text style={styles.metricValue}>{metrics.underconfidence_count}</Text>
        </View>
      </View>

      <View style={styles.insightsCard}>
        <Text style={styles.sectionTitle}>Insights</Text>
        
        {metrics.calibration_error > 0.15 && (
          <View style={styles.insightItem}>
            <View style={styles.insightIconContainer}>
              <Text style={styles.insightIcon}>i</Text>
            </View>
            <Text style={styles.insightText}>
              Your confidence doesn't always match your performance. Try to be more realistic about your knowledge.
            </Text>
          </View>
        )}

        {metrics.overconfidence_count > metrics.underconfidence_count && (
          <View style={styles.insightItem}>
            <View style={styles.insightIconContainer}>
              <Text style={styles.insightIcon}>!</Text>
            </View>
            <Text style={styles.insightText}>
              You tend to be overconfident. Consider reviewing concepts more thoroughly.
            </Text>
          </View>
        )}

        {metrics.recall_accuracy > 0.8 && (
          <View style={styles.insightItem}>
            <View style={styles.insightIconContainer}>
              <Text style={styles.insightIcon}>*</Text>
            </View>
            <Text style={styles.insightText}>
              Great recall accuracy! You're effectively retaining what you learn.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
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
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  scoresContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  scoreLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -1,
  },
  scoreBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: '#111827',
    borderRadius: 3,
  },
  metricsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  metricLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  insightsCard: {
    padding: 24,
    marginTop: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  insightIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  insightIcon: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 40,
  },
});
