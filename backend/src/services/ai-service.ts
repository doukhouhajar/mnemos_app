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
    
    // Check if API key is set and not a placeholder
    if (!apiKey) {
      console.warn('OPENAI_API_KEY not set. AI features will be disabled.');
      return;
    }
    
    // Detect common placeholder values
    const placeholderPatterns = [
      /^your[_\s]?actual[_\s]?api[_\s]?key/i,
      /placeholder/i,
      /example/i,
      /replace/i,
      /your_key/i,
      /^sk-your/i,
    ];
    
    const isPlaceholder = placeholderPatterns.some(pattern => pattern.test(apiKey));
    
    // Valid OpenAI API keys start with "sk-" and are typically 32+ characters
    const isValidFormat = apiKey.startsWith('sk-') && apiKey.length >= 32;
    
    if (isPlaceholder || !isValidFormat) {
      console.warn('OPENAI_API_KEY appears to be a placeholder or invalid format. AI features will be disabled.');
      console.warn('Please set a valid OpenAI API key in backend/.env file.');
      console.warn('Get your API key at: https://platform.openai.com/account/api-keys');
      return;
    }
    
    this.client = new OpenAI({
      apiKey,
    });
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

    const systemPrompt = `You are an expert at structuring learning content into clear, memorable memory objects. You must respond with ONLY valid JSON, no markdown, no code blocks, no explanations. Just the JSON object.`;

    const userPrompt = `Given the following learning moment, extract and structure it into a memory object.

Learning moment:
${rawInput}

Respond with ONLY a JSON object (no markdown, no code blocks) containing:
{
  "title": "A brief, memorable title (max 100 characters)",
  "definition": "A precise, clear definition",
  "intuition": "How to think about this concept in practical terms",
  "examples": ["example 1", "example 2", "example 3"],
  "common_misconceptions": ["misconception 1", "misconception 2"],
  "reference_links": ["link1", "link2"]
}

Return ONLY the JSON object, nothing else.`;

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
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Try to extract JSON from the response (might be wrapped in markdown code blocks)
      let jsonContent = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonContent.startsWith('```')) {
        const lines = jsonContent.split('\n');
        const startIndex = lines.findIndex(line => line.includes('```'));
        const endIndex = lines.findIndex((line, idx) => idx > startIndex && line.includes('```'));
        if (startIndex !== -1 && endIndex !== -1) {
          jsonContent = lines.slice(startIndex + 1, endIndex).join('\n');
        } else {
          // Try to find JSON object boundaries
          const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonContent = jsonMatch[0];
          }
        }
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonContent);
      } catch (parseError) {
        // If JSON parsing fails, try to extract fields manually
        console.warn('Failed to parse JSON, attempting manual extraction:', parseError);
        
        // Fallback: create a basic structure from the raw input
        return {
          title: rawInput.substring(0, 100).split('\n')[0] || 'Untitled',
          definition: rawInput.substring(0, 500),
          intuition: 'Think about this concept in practical terms.',
          examples: [],
          common_misconceptions: [],
          reference_links: [],
          metadata: { raw_ai_response: content },
        };
      }
      
      // Validate and structure the response
      return {
        title: parsed.title || rawInput.substring(0, 100).split('\n')[0] || 'Untitled',
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
      
      // Provide more helpful error messages
      if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Incorrect API key')) {
        throw new Error('AI processing failed: Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
      } else if (error.status === 429 || error.message?.includes('429')) {
        throw new Error('AI processing failed: Rate limit exceeded. Please try again later.');
      } else if (error.status === 500 || error.message?.includes('500')) {
        throw new Error('AI processing failed: OpenAI service error. Please try again later.');
      } else {
        throw new Error(`AI processing failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Get availability status with reason
   */
  getAvailabilityStatus(): { available: boolean; reason?: string } {
    if (!process.env.OPENAI_API_KEY) {
      return { 
        available: false, 
        reason: 'OPENAI_API_KEY not set in environment variables' 
      };
    }
    
    const apiKey = process.env.OPENAI_API_KEY;
    const isValidFormat = apiKey.startsWith('sk-') && apiKey.length >= 32;
    
    if (!isValidFormat) {
      return { 
        available: false, 
        reason: 'OPENAI_API_KEY appears to be invalid or a placeholder. Please set a valid API key in backend/.env file. Get your key at https://platform.openai.com/account/api-keys' 
      };
    }
    
    if (!this.client) {
      return { 
        available: false, 
        reason: 'AI service client not initialized' 
      };
    }
    
    return { available: true };
  }
}

