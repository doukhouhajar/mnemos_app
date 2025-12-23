/**
 * Memory Experience Templates
 * Define the structure and scoring logic for different retrieval experiences
 */

import { ExperienceType, RecallResult } from './domain';

export interface ExperienceTemplate {
  type: ExperienceType;
  name: string;
  description: string;
  difficulty_levels: number[]; // 1-5 or similar
  expected_format: 'free_text' | 'multiple_choice' | 'true_false' | 'voice' | 'mixed';
  scoring_logic: (userResponse: string, expectedContent: any) => RecallResult;
  generatePrompt: (memoryObject: any, difficulty: number) => string;
  metadata: {
    priority: number; // Higher = more important for memory retention
    estimated_time_seconds: number;
    cognitive_load: 'low' | 'medium' | 'high';
  };
}

export interface ExperienceInstance {
  id: string;
  memory_object_id: string;
  template_type: ExperienceType;
  prompt: string;
  difficulty: number;
  expected_response?: string;
  options?: string[]; // For multiple choice
  created_at: Date;
  metadata?: {
    representation_id?: string;
    hints?: string[];
  };
}

export interface ExperienceResult {
  experience_id: string;
  user_response: string;
  recall_result: RecallResult;
  confidence_score: number;
  response_latency_ms: number;
  feedback?: string;
  timestamp: Date;
}

