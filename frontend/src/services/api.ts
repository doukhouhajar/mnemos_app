/**
 * API Client for MNEMOS Backend
 */

import axios, { AxiosInstance } from 'axios';
import {
  LearningMoment,
  MemoryObject,
  ReviewEvent,
  ScheduleState,
} from '@shared/types/domain';
import { ExperienceInstance } from '@shared/types/experience';

// For Android emulator, use 10.0.2.2 to access host machine's localhost
// For iOS simulator, use localhost
// In production, this should be set via environment variable
import { Platform } from 'react-native';
const API_BASE_URL = 
  process.env.API_BASE_URL || 
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

export class MnemosAPI {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token interceptor (implement when auth is ready)
    this.client.interceptors.request.use((config) => {
      // const token = getAuthToken();
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
    });
  }

  // Learning Moments
  async createLearningMoment(
    userId: string,
    rawInput: LearningMoment['raw_input'],
    source: 'manual' | 'ai-assisted' = 'manual'
  ): Promise<LearningMoment> {
    const response = await this.client.post('/api/memory/learning-moments', {
      user_id: userId,
      raw_input: rawInput,
      source,
    });
    return response.data;
  }

  async getLearningMoments(userId: string, date?: string): Promise<LearningMoment[]> {
    const params: any = { user_id: userId };
    if (date) {
      params.date = date;
    }
    const response = await this.client.get('/api/memory/learning-moments', {
      params,
    });
    return response.data;
  }

  // Memory Objects
  async createMemoryObject(
    learningMomentId: string,
    memoryData: Omit<MemoryObject, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MemoryObject> {
    const response = await this.client.post('/api/memory/memory-objects', {
      learning_moment_id: learningMomentId,
      ...memoryData,
    });
    return response.data;
  }

  async getMemoryObjects(userId: string): Promise<MemoryObject[]> {
    const response = await this.client.get('/api/memory/memory-objects', {
      params: { user_id: userId },
    });
    return response.data;
  }

  async getMemoryObject(memoryObjectId: string): Promise<MemoryObject> {
    const response = await this.client.get(`/api/memory/memory-objects/${memoryObjectId}`);
    return response.data;
  }

  async getDueMemories(userId: string): Promise<MemoryObject[]> {
    const response = await this.client.get('/api/memory/due', {
      params: { user_id: userId },
    });
    return response.data;
  }

  // Reviews
  async recordReview(
    userId: string,
    memoryObjectId: string,
    experienceType: string,
    recallResult: 'correct' | 'incorrect' | 'partial',
    confidenceScore: number,
    responseLatencyMs: number,
    metadata?: any
  ): Promise<ReviewEvent> {
    const response = await this.client.post('/api/reviews', {
      user_id: userId,
      memory_object_id: memoryObjectId,
      experience_type: experienceType,
      recall_result: recallResult,
      confidence_score: confidenceScore,
      response_latency_ms: responseLatencyMs,
      metadata,
    });
    return response.data;
  }

  async getReviewHistory(
    userId: string,
    memoryObjectId: string
  ): Promise<ReviewEvent[]> {
    const response = await this.client.get(`/api/reviews/${memoryObjectId}`, {
      params: { user_id: userId },
    });
    return response.data;
  }

  async getScheduleState(
    userId: string,
    memoryObjectId: string
  ): Promise<ScheduleState> {
    const response = await this.client.get(`/api/reviews/${memoryObjectId}/schedule`, {
      params: { user_id: userId },
    });
    return response.data;
  }

  async generateExperiences(
    memoryObjectId: string,
    count: number = 3
  ): Promise<ExperienceInstance[]> {
    const response = await this.client.get(`/api/reviews/${memoryObjectId}/experiences`, {
      params: { count },
    });
    return response.data;
  }

  // AI Services
  async structureWithAI(rawInput: string): Promise<Omit<MemoryObject, 'id' | 'owner_id' | 'created_at' | 'updated_at'>> {
    const response = await this.client.post('/api/memory/ai-structure', {
      raw_input: { text: rawInput },
    });
    return response.data;
  }
}

// Singleton instance
export const api = new MnemosAPI();

