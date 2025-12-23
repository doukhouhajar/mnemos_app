/**
 * AI Service
 * Uses OpenAI to structure learning moments into memory objects
 */

import OpenAI from 'openai';
import { MemoryObject } from '@shared/types/domain';

export class AIService {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
      });
    } else {
      console.warn('OPENAI_API_KEY not set. AI features will be disabled.');
    }
  }

  /**
   * Structure a learning moment into a memory object using AI
   */
  async structureLearningMoment(
    rawInput: string
  ): Promise<Omit<MemoryObject, 'id' | 'owner_id' | 'created_at' | 'updated_at'>> {
    if (!this.client) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert at structuring learning content into clear, memorable memory objects. Always respond with valid JSON only, following the exact format specified.`;

    const userPrompt = `Given the following learning moment, extract and structure it into a memory object.

Learning moment:
${rawInput}

Respond with a JSON object containing:
- title: A brief, memorable title (max 100 characters)
- definition: A precise, clear definition
- intuition: How to think about this concept in practical terms
- examples: 2-4 concrete examples (as a JSON array of strings)
- common_misconceptions: 1-3 common misconceptions (as a JSON array of strings)
- reference_links: Any relevant links mentioned (as a JSON array of strings)

Format your response as JSON only.`;

    try {
      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(content);
      
      // Validate and structure the response
      return {
        title: parsed.title || 'Untitled',
        definition: parsed.definition || rawInput.substring(0, 500),
        intuition: parsed.intuition || 'Think about this concept in practical terms.',
        examples: Array.isArray(parsed.examples) ? parsed.examples : [],
        common_misconceptions: Array.isArray(parsed.common_misconceptions) 
          ? parsed.common_misconceptions 
          : [],
        reference_links: Array.isArray(parsed.reference_links) ? parsed.reference_links : [],
        metadata: {},
      };
    } catch (error: any) {
      console.error('Error calling OpenAI:', error);
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return this.client !== null;
  }
}

