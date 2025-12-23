-- MNEMOS Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (simplified - integrate with your auth system)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning Moments
CREATE TABLE IF NOT EXISTS learning_moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL,
  raw_input JSONB NOT NULL, -- {text, voice_url, image_url, link}
  source VARCHAR(20) NOT NULL CHECK (source IN ('manual', 'ai-assisted')),
  memory_object_id UUID, -- Set after processing
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_moments_user_id ON learning_moments(user_id);
CREATE INDEX idx_learning_moments_timestamp ON learning_moments(timestamp);
CREATE INDEX idx_learning_moments_memory_object_id ON learning_moments(memory_object_id);

-- Memory Objects
CREATE TABLE IF NOT EXISTS memory_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  definition TEXT NOT NULL,
  intuition TEXT NOT NULL,
  examples JSONB NOT NULL DEFAULT '[]', -- Array of strings
  common_misconceptions JSONB NOT NULL DEFAULT '[]', -- Array of strings
  reference_links JSONB NOT NULL DEFAULT '[]', -- Array of strings
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_memory_objects_owner_id ON memory_objects(owner_id);
CREATE INDEX idx_memory_objects_created_at ON memory_objects(created_at);

-- Representations
CREATE TABLE IF NOT EXISTS representations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_object_id UUID NOT NULL REFERENCES memory_objects(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'text_explanation', 'recall_prompt', 'application_prompt', 
    'analogy', 'image', 'voice'
  )),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_representations_memory_object_id ON representations(memory_object_id);
CREATE INDEX idx_representations_type ON representations(type);

-- Schedule States
CREATE TABLE IF NOT EXISTS schedule_states (
  memory_object_id UUID NOT NULL REFERENCES memory_objects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_reviewed TIMESTAMP,
  next_due TIMESTAMP NOT NULL,
  difficulty REAL NOT NULL DEFAULT 0.3 CHECK (difficulty >= 0 AND difficulty <= 1),
  stability REAL NOT NULL DEFAULT 1.0, -- Days
  estimated_recall_probability REAL NOT NULL DEFAULT 0.9 CHECK (
    estimated_recall_probability >= 0 AND estimated_recall_probability <= 1
  ),
  review_count INTEGER NOT NULL DEFAULT 0,
  consecutive_correct INTEGER NOT NULL DEFAULT 0,
  scheduler_version VARCHAR(50) NOT NULL DEFAULT 'sm2-v1',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (memory_object_id, user_id)
);

CREATE INDEX idx_schedule_states_user_id ON schedule_states(user_id);
CREATE INDEX idx_schedule_states_next_due ON schedule_states(next_due);
CREATE INDEX idx_schedule_states_user_next_due ON schedule_states(user_id, next_due);

-- Review Events
CREATE TABLE IF NOT EXISTS review_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_object_id UUID NOT NULL REFERENCES memory_objects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  experience_type VARCHAR(50) NOT NULL CHECK (experience_type IN (
    'free_recall', 'cued_recall', 'application', 'explain_simply',
    'misconception_detection', 'micro_teach', 'mixed_interleaved'
  )),
  recall_result VARCHAR(20) NOT NULL CHECK (recall_result IN ('correct', 'incorrect', 'partial')),
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  response_latency_ms INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_events_memory_object_id ON review_events(memory_object_id);
CREATE INDEX idx_review_events_user_id ON review_events(user_id);
CREATE INDEX idx_review_events_timestamp ON review_events(timestamp);

-- Groups
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  members JSONB NOT NULL DEFAULT '[]', -- Array of user IDs
  shared_memory_objects JSONB NOT NULL DEFAULT '[]', -- Array of memory object IDs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_groups_owner_id ON groups(owner_id);

-- Weekly Quests
CREATE TABLE IF NOT EXISTS weekly_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  week_start TIMESTAMP NOT NULL,
  week_end TIMESTAMP NOT NULL,
  challenge_type VARCHAR(50) NOT NULL CHECK (challenge_type IN ('relay', 'collective', 'individual')),
  target_memory_objects JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weekly_quests_group_id ON weekly_quests(group_id);
CREATE INDEX idx_weekly_quests_status ON weekly_quests(status);

-- Metacognition Metrics
CREATE TABLE IF NOT EXISTS metacognition_metrics (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  memory_object_id UUID NOT NULL REFERENCES memory_objects(id) ON DELETE CASCADE,
  recall_accuracy REAL NOT NULL DEFAULT 0.0,
  average_confidence REAL NOT NULL DEFAULT 0.0,
  calibration_error REAL NOT NULL DEFAULT 0.0,
  overconfidence_count INTEGER NOT NULL DEFAULT 0,
  underconfidence_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, memory_object_id)
);

CREATE INDEX idx_metacognition_user_id ON metacognition_metrics(user_id);

-- Experience Instances (for tracking generated experiences)
CREATE TABLE IF NOT EXISTS experience_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_object_id UUID NOT NULL REFERENCES memory_objects(id) ON DELETE CASCADE,
  template_type VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
  expected_response TEXT,
  options JSONB, -- For multiple choice
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_experience_instances_memory_object_id ON experience_instances(memory_object_id);

