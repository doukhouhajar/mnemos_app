/**
 * Core Domain Types for MNEMOS
 * Shared between backend and frontend
 */

export type UserId = string;
export type MemoryObjectId = string;
export type LearningMomentId = string;
export type ReviewEventId = string;
export type GroupId = string;

export interface LearningMoment {
  id: LearningMomentId;
  user_id: UserId;
  timestamp: Date;
  raw_input: {
    text?: string;
    voice_url?: string;
    image_url?: string;
    link?: string;
  };
  source: 'manual' | 'ai-assisted';
  memory_object_id?: MemoryObjectId; // Linked after processing
  created_at: Date;
  updated_at: Date;
}

export interface MemoryObject {
  id: MemoryObjectId;
  owner_id: UserId;
  title: string;
  definition: string;
  intuition: string;
  examples: string[];
  common_misconceptions: string[];
  reference_links: string[];
  created_at: Date;
  updated_at: Date;
  metadata?: {
    tags?: string[];
    category?: string;
    difficulty_estimate?: number;
  };
}

export type RepresentationType = 
  | 'text_explanation'
  | 'recall_prompt'
  | 'application_prompt'
  | 'analogy'
  | 'image'
  | 'voice';

export interface Representation {
  id: string;
  memory_object_id: MemoryObjectId;
  type: RepresentationType;
  content: string;
  metadata?: {
    difficulty?: number;
    ai_generated?: boolean;
    source?: string;
  };
  created_at: Date;
}

export type ExperienceType =
  | 'free_recall'
  | 'cued_recall'
  | 'application'
  | 'explain_simply'
  | 'misconception_detection'
  | 'micro_teach'
  | 'mixed_interleaved';

export type RecallResult = 'correct' | 'incorrect' | 'partial';

export interface ReviewEvent {
  id: ReviewEventId;
  memory_object_id: MemoryObjectId;
  user_id: UserId;
  timestamp: Date;
  experience_type: ExperienceType;
  recall_result: RecallResult;
  confidence_score: number; // 0-100, self-reported
  response_latency_ms: number;
  metadata?: {
    representation_id?: string;
    user_response?: string;
    feedback?: string;
  };
}

export interface ScheduleState {
  memory_object_id: MemoryObjectId;
  user_id: UserId;
  last_reviewed: Date | null;
  next_due: Date;
  difficulty: number; // 0-1, scheduler-specific
  stability: number; // Days until recall probability drops to ~90%
  estimated_recall_probability: number; // 0-1
  review_count: number;
  consecutive_correct: number;
  scheduler_version: string; // Track scheduler algorithm version
  updated_at: Date;
}

export interface Group {
  id: GroupId;
  name: string;
  description?: string;
  owner_id: UserId;
  members: UserId[];
  shared_memory_objects: MemoryObjectId[];
  created_at: Date;
  updated_at: Date;
}

export interface WeeklyQuest {
  id: string;
  group_id: GroupId;
  week_start: Date;
  week_end: Date;
  challenge_type: 'relay' | 'collective' | 'individual';
  target_memory_objects: MemoryObjectId[];
  status: 'active' | 'completed' | 'cancelled';
  created_at: Date;
}

export interface MetacognitionMetrics {
  user_id: UserId;
  memory_object_id: MemoryObjectId;
  recall_accuracy: number; // Actual recall performance
  average_confidence: number; // Self-reported confidence
  calibration_error: number; // |accuracy - confidence|
  overconfidence_count: number;
  underconfidence_count: number;
  updated_at: Date;
}

