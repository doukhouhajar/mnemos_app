/**
 * Experience Generator Service
 * Generates retrieval experiences for memory objects
 */

import { MemoryObject } from '@shared/types/domain';
import { ExperienceInstance, ExperienceTemplate } from '@shared/types/experience';
import { getExperienceTemplate, getAllTemplates } from './templates';

export class ExperienceGenerator {
  /**
   * Generate a single experience instance for a memory object
   */
  generateExperience(
    memoryObject: MemoryObject,
    experienceType?: string,
    difficulty?: number
  ): ExperienceInstance {
    const type = (experienceType as any) || this.selectOptimalType(memoryObject);
    const template = getExperienceTemplate(type);
    const selectedDifficulty = difficulty || this.selectOptimalDifficulty(memoryObject, template);

    const prompt = template.generatePrompt(memoryObject, selectedDifficulty);

    return {
      id: this.generateId(),
      memory_object_id: memoryObject.id,
      template_type: type,
      prompt,
      difficulty: selectedDifficulty,
      created_at: new Date(),
    };
  }

  /**
   * Generate multiple experiences for variety
   */
  generateExperienceSet(
    memoryObject: MemoryObject,
    count: number = 3
  ): ExperienceInstance[] {
    const templates = getAllTemplates();
    const experiences: ExperienceInstance[] = [];

    // Prioritize high-priority experiences
    const sortedTemplates = templates.sort((a, b) => b.priority - a.priority);

    for (let i = 0; i < count && i < sortedTemplates.length; i++) {
      const template = sortedTemplates[i];
      experiences.push(
        this.generateExperience(memoryObject, template.type)
      );
    }

    return experiences;
  }

  /**
   * Select optimal experience type based on memory state
   */
  private selectOptimalType(memoryObject: MemoryObject): string {
    // For MVP: prioritize free recall, then application
    // Can be enhanced with ML/AI later
    const priorityOrder = ['free_recall', 'application', 'cued_recall', 'explain_simply'];
    return priorityOrder[0]; // Start with free recall
  }

  /**
   * Select optimal difficulty based on memory object and template
   */
  private selectOptimalDifficulty(
    memoryObject: MemoryObject,
    template: ExperienceTemplate
  ): number {
    // For MVP: use middle difficulty
    // Can be enhanced with adaptive difficulty based on past performance
    const midPoint = Math.floor(template.difficulty_levels.length / 2);
    return template.difficulty_levels[midPoint] || 3;
  }

  private generateId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

