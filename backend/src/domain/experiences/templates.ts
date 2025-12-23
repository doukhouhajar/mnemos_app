/**
 * Memory Experience Templates
 * Define different types of retrieval experiences with their scoring logic
 */

import { ExperienceType, MemoryObject, RecallResult } from '@shared/types/domain';
import { ExperienceTemplate } from '@shared/types/experience';

/**
 * Free Recall Template
 * Highest priority - user must recall from memory without cues
 */
export const freeRecallTemplate: ExperienceTemplate = {
  type: 'free_recall',
  name: 'Free Recall',
  description: 'Recall the concept from memory without any cues',
  difficulty_levels: [1, 2, 3, 4, 5],
  expected_format: 'free_text',
  priority: 10, // Highest priority
  estimated_time_seconds: 60,
  cognitive_load: 'high',
  generatePrompt: (memoryObject: MemoryObject, difficulty: number) => {
    if (difficulty <= 2) {
      return `What is ${memoryObject.title}? Explain it in your own words.`;
    } else if (difficulty <= 4) {
      return `Explain ${memoryObject.title} without looking at any notes. Include the definition, key intuition, and an example.`;
    } else {
      return `Provide a comprehensive explanation of ${memoryObject.title}. Include definition, intuition, examples, and common misconceptions.`;
    }
  },
  scoring_logic: (userResponse: string, expectedContent: MemoryObject): RecallResult => {
    // Simple keyword matching for MVP - can be enhanced with AI/NLP
    const lowerResponse = userResponse.toLowerCase();
    const titleWords = expectedContent.title.toLowerCase().split(/\s+/);
    const definitionWords = expectedContent.definition.toLowerCase().split(/\s+/).slice(0, 10); // First 10 words
    
    let matchCount = 0;
    const totalChecks = titleWords.length + definitionWords.length;
    
    titleWords.forEach(word => {
      if (lowerResponse.includes(word)) matchCount++;
    });
    
    definitionWords.forEach(word => {
      if (word.length > 3 && lowerResponse.includes(word)) matchCount++;
    });
    
    const matchRatio = matchCount / totalChecks;
    
    if (matchRatio >= 0.7) return 'correct';
    if (matchRatio >= 0.4) return 'partial';
    return 'incorrect';
  },
};

/**
 * Cued Recall Template
 * Medium priority - user gets a cue to help recall
 */
export const cuedRecallTemplate: ExperienceTemplate = {
  type: 'cued_recall',
  name: 'Cued Recall',
  description: 'Recall the concept with a helpful cue',
  difficulty_levels: [1, 2, 3, 4],
  expected_format: 'free_text',
  priority: 7,
  estimated_time_seconds: 45,
  cognitive_load: 'medium',
  generatePrompt: (memoryObject: MemoryObject, difficulty: number) => {
    const cues = [
      `Remember: ${memoryObject.intuition.substring(0, 100)}...`,
      `Think about: ${memoryObject.examples[0] || 'an example'}`,
      `Context: This relates to ${memoryObject.title}`,
    ];
    const cue = cues[difficulty % cues.length];
    return `${cue}\n\nNow explain ${memoryObject.title}.`;
  },
  scoring_logic: (userResponse: string, expectedContent: MemoryObject): RecallResult => {
    return freeRecallTemplate.scoring_logic(userResponse, expectedContent);
  },
};

/**
 * Application Template
 * High priority - user applies the concept to a new situation
 */
export const applicationTemplate: ExperienceTemplate = {
  type: 'application',
  name: 'Application',
  description: 'Apply the concept to a new situation or problem',
  difficulty_levels: [2, 3, 4, 5],
  expected_format: 'free_text',
  priority: 9,
  estimated_time_seconds: 90,
  cognitive_load: 'high',
  generatePrompt: (memoryObject: MemoryObject, difficulty: number) => {
    const scenarios = [
      `How would you apply ${memoryObject.title} to solve a real-world problem?`,
      `Give a new example of ${memoryObject.title} that you haven't seen before.`,
      `How would ${memoryObject.title} help you understand [related concept]?`,
      `Design a scenario where ${memoryObject.title} would be crucial.`,
    ];
    return scenarios[Math.min(difficulty - 2, scenarios.length - 1)];
  },
  scoring_logic: (userResponse: string, expectedContent: MemoryObject): RecallResult => {
    // For application, we check if the response shows understanding
    // and relates to the concept, even if not exact match
    const lowerResponse = userResponse.toLowerCase();
    const titleLower = expectedContent.title.toLowerCase();
    
    if (userResponse.length < 20) return 'incorrect';
    if (!lowerResponse.includes(titleLower.split(' ')[0])) return 'incorrect';
    
    // Check for application indicators
    const applicationKeywords = ['apply', 'use', 'example', 'scenario', 'situation', 'problem'];
    const hasApplicationLanguage = applicationKeywords.some(kw => lowerResponse.includes(kw));
    
    if (hasApplicationLanguage && userResponse.length > 50) return 'correct';
    if (userResponse.length > 30) return 'partial';
    return 'incorrect';
  },
};

/**
 * Explain Simply Template
 * Medium priority - user explains to a beginner
 */
export const explainSimplyTemplate: ExperienceTemplate = {
  type: 'explain_simply',
  name: 'Explain Simply',
  description: 'Explain the concept as if to a beginner',
  difficulty_levels: [1, 2, 3],
  expected_format: 'free_text',
  priority: 6,
  estimated_time_seconds: 75,
  cognitive_load: 'medium',
  generatePrompt: (memoryObject: MemoryObject, difficulty: number) => {
    return `Explain ${memoryObject.title} in simple terms that a beginner could understand. Use analogies if helpful.`;
  },
  scoring_logic: (userResponse: string, expectedContent: MemoryObject): RecallResult => {
    // Check for simplicity indicators and core concept understanding
    const lowerResponse = userResponse.toLowerCase();
    const hasSimpleLanguage = ['simple', 'think', 'imagine', 'like', 'similar'].some(
      word => lowerResponse.includes(word)
    );
    
    const coreMatch = freeRecallTemplate.scoring_logic(userResponse, expectedContent);
    if (coreMatch === 'correct' && hasSimpleLanguage) return 'correct';
    return coreMatch;
  },
};

/**
 * Misconception Detection Template
 * Medium priority - user identifies common misconceptions
 */
export const misconceptionDetectionTemplate: ExperienceTemplate = {
  type: 'misconception_detection',
  name: 'Misconception Detection',
  description: 'Identify and correct common misconceptions',
  difficulty_levels: [3, 4, 5],
  expected_format: 'free_text',
  priority: 7,
  estimated_time_seconds: 60,
  cognitive_load: 'medium',
  generatePrompt: (memoryObject: MemoryObject, difficulty: number) => {
    if (memoryObject.common_misconceptions.length > 0) {
      const misconception = memoryObject.common_misconceptions[
        difficulty % memoryObject.common_misconceptions.length
      ];
      return `Someone says: "${misconception}"\n\nIs this correct? Explain why or why not.`;
    }
    return `What is a common misconception about ${memoryObject.title}? Explain why it's incorrect.`;
  },
  scoring_logic: (userResponse: string, expectedContent: MemoryObject): RecallResult => {
    const lowerResponse = userResponse.toLowerCase();
    const misconceptionKeywords = ['misconception', 'wrong', 'incorrect', 'not true', 'false'];
    const hasMisconceptionLanguage = misconceptionKeywords.some(kw => lowerResponse.includes(kw));
    
    if (hasMisconceptionLanguage && userResponse.length > 40) return 'correct';
    if (userResponse.length > 20) return 'partial';
    return 'incorrect';
  },
};

/**
 * Registry of all experience templates
 */
export const experienceTemplates: Record<ExperienceType, ExperienceTemplate> = {
  free_recall: freeRecallTemplate,
  cued_recall: cuedRecallTemplate,
  application: applicationTemplate,
  explain_simply: explainSimplyTemplate,
  misconception_detection: misconceptionDetectionTemplate,
  micro_teach: {
    ...freeRecallTemplate,
    type: 'micro_teach',
    name: 'Micro Teach',
    description: 'Teach the concept to someone else',
    priority: 8,
  },
  mixed_interleaved: {
    ...freeRecallTemplate,
    type: 'mixed_interleaved',
    name: 'Mixed Challenge',
    description: 'Combination of different experience types',
    priority: 5,
  },
};

/**
 * Get experience template by type
 */
export function getExperienceTemplate(type: ExperienceType): ExperienceTemplate {
  return experienceTemplates[type];
}

/**
 * Get all experience templates, sorted by priority
 */
export function getAllTemplates(): ExperienceTemplate[] {
  return Object.values(experienceTemplates).sort((a, b) => b.priority - a.priority);
}

