/**
 * Database Seed Script
 * Creates comprehensive test data for development
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mnemos',
  user: process.env.DB_USER || process.env.USER,
  password: process.env.DB_PASSWORD || '',
});

// Test user IDs
const MAIN_USER_ID = '00000000-0000-0000-0000-000000000123';
const USERS = [
  { id: MAIN_USER_ID, email: 'test@mnemos.app', name: 'Test User' },
  { id: '00000000-0000-0000-0000-000000000001', email: 'alex@example.com', name: 'Alex Chen' },
  { id: '00000000-0000-0000-0000-000000000002', email: 'sarah@example.com', name: 'Sarah Johnson' },
  { id: '00000000-0000-0000-0000-000000000003', email: 'mike@example.com', name: 'Mike Davis' },
  { id: '00000000-0000-0000-0000-000000000004', email: 'emma@example.com', name: 'Emma Wilson' },
];

const LEARNING_MOMENTS = [
  {
    text: 'Binary Search is a search algorithm that finds the position of a target value within a sorted array. It compares the target value to the middle element of the array.',
    subject: 'Computer Science',
    dateOffset: -10,
  },
  {
    text: 'Hash Tables are data structures that implement an associative array abstract data type. They use a hash function to compute an index into an array of buckets.',
    subject: 'Computer Science',
    dateOffset: -9,
  },
  {
    text: 'The Krebs cycle, also known as the citric acid cycle, is a series of chemical reactions used by all aerobic organisms to release stored energy.',
    subject: 'Biology',
    dateOffset: -8,
  },
  {
    text: 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar.',
    subject: 'Biology',
    dateOffset: -7,
  },
  {
    text: 'The Spanish verb "ser" is used for permanent characteristics, while "estar" is used for temporary states. Ser describes what something is, estar describes how something is.',
    subject: 'Language',
    dateOffset: -6,
  },
  {
    text: 'Present tense conjugation in Spanish: -ar verbs end in -o, -as, -a, -amos, -áis, -an. Example: hablar (to speak) becomes hablo, hablas, habla, hablamos, habláis, hablan.',
    subject: 'Language',
    dateOffset: -5,
  },
  {
    text: 'Newton\'s First Law: An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an unbalanced force.',
    subject: 'Physics',
    dateOffset: -4,
  },
  {
    text: 'F=ma (Force equals mass times acceleration) is Newton\'s Second Law. It describes the relationship between force, mass, and acceleration.',
    subject: 'Physics',
    dateOffset: -3,
  },
  {
    text: 'The concept of recursion in programming: a function that calls itself. Base case stops the recursion, recursive case calls the function again with modified parameters.',
    subject: 'Computer Science',
    dateOffset: -2,
  },
  {
    text: 'React hooks allow functional components to use state and lifecycle features. useState manages component state, useEffect handles side effects.',
    subject: 'Computer Science',
    dateOffset: -1,
  },
  {
    text: 'The mitochondria is the powerhouse of the cell. It produces ATP through cellular respiration, converting glucose and oxygen into energy.',
    subject: 'Biology',
    dateOffset: 0,
  },
  {
    text: 'The French subjunctive mood is used to express doubt, emotion, desire, or uncertainty. It\'s triggered by certain conjunctions and expressions.',
    subject: 'Language',
    dateOffset: 1,
  },
];

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Clear existing data
    console.log('Clearing existing data...');
    await client.query('DELETE FROM review_events');
    await client.query('DELETE FROM schedule_states');
    await client.query('DELETE FROM experience_instances');
    await client.query('DELETE FROM metacognition_metrics');
    await client.query('DELETE FROM weekly_quests');
    await client.query('DELETE FROM groups');
    await client.query('DELETE FROM learning_moments');
    await client.query('DELETE FROM memory_objects');
    await client.query('DELETE FROM users');

    // Insert users
    console.log('Inserting users...');
    for (const user of USERS) {
      await client.query(
        `INSERT INTO users (id, email, name) VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET email = $2, name = $3`,
        [user.id, user.email, user.name]
      );
    }

    // Insert learning moments and memory objects
    console.log('Inserting learning moments and memory objects...');
    const memoryObjects: any[] = [];

    for (let i = 0; i < LEARNING_MOMENTS.length; i++) {
      const moment = LEARNING_MOMENTS[i];
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() + moment.dateOffset);
      timestamp.setHours(10 + (i % 8), 30, 0, 0);

      // Insert learning moment
      const momentResult = await client.query(
        `INSERT INTO learning_moments (user_id, timestamp, raw_input, source)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          MAIN_USER_ID,
          timestamp,
          JSON.stringify({ text: moment.text }),
          i % 3 === 0 ? 'ai-assisted' : 'manual',
        ]
      );

      const momentId = momentResult.rows[0].id;

      // Create memory object
      const title = moment.text.split('.')[0].substring(0, 100);
      const definition = moment.text;
      const intuition = `Think about ${moment.subject.toLowerCase()} concepts in practical terms.`;
      const examples = [
        `Example 1: ${moment.subject} application`,
        `Example 2: Real-world use case`,
      ];
      const misconceptions = [
        `Common mistake: Misunderstanding the core concept`,
      ];
      const referenceLinks: string[] = [];

      const memoryResult = await client.query(
        `INSERT INTO memory_objects (
          owner_id, title, definition, intuition, examples,
          common_misconceptions, reference_links, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, created_at`,
        [
          MAIN_USER_ID,
          title,
          definition,
          intuition,
          JSON.stringify(examples),
          JSON.stringify(misconceptions),
          JSON.stringify(referenceLinks),
          JSON.stringify({ subject: moment.subject }),
        ]
      );

      const memoryId = memoryResult.rows[0].id;

      // Link learning moment to memory object
      await client.query(
        `UPDATE learning_moments SET memory_object_id = $1 WHERE id = $2`,
        [memoryId, momentId]
      );

      // Create schedule state with varied intervals
      const daysAgo = Math.abs(moment.dateOffset);
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + (i % 5)); // Vary due dates

      const difficulty = 0.2 + (i % 5) * 0.15;
      const stability = 1.0 + (i % 3) * 2.0;
      const reviewCount = Math.floor(i / 2);

      await client.query(
        `INSERT INTO schedule_states (
          memory_object_id, user_id, last_reviewed, next_due,
          difficulty, stability, estimated_recall_probability,
          review_count, consecutive_correct, scheduler_version
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          memoryId,
          MAIN_USER_ID,
          daysAgo > 0 ? new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000) : null,
          nextDue,
          difficulty,
          stability,
          0.85 - (i % 5) * 0.1,
          reviewCount,
          Math.min(reviewCount, 3),
          'sm2-v1',
        ]
      );

      // Insert some review events
      for (let j = 0; j < Math.min(reviewCount, 3); j++) {
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() - (daysAgo + j * 2));

        await client.query(
          `INSERT INTO review_events (
            memory_object_id, user_id, timestamp, experience_type,
            recall_result, confidence_score, response_latency_ms, metadata
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            memoryId,
            MAIN_USER_ID,
            reviewDate,
            ['free_recall', 'cued_recall', 'application'][j % 3],
            j === 0 ? 'correct' : j === 1 ? 'partial' : 'incorrect',
            70 + (j * 10),
            3000 + (j * 1000),
            JSON.stringify({}),
          ]
        );
      }

      memoryObjects.push({ id: memoryId, title, subject: moment.subject });
    }

    // Create groups
    console.log('Creating groups...');
    const group1Result = await client.query(
      `INSERT INTO groups (id, name, description, owner_id, members, shared_memory_objects)
       VALUES (
         gen_random_uuid(),
         'Computer Science Study Group',
         'Learning algorithms, data structures, and system design together.',
         $1,
         $2,
         $3
       )
       RETURNING id`,
      [
        USERS[1].id,
        JSON.stringify([USERS[1].id, USERS[2].id, MAIN_USER_ID]),
        JSON.stringify([memoryObjects[0].id, memoryObjects[1].id, memoryObjects[8].id]),
      ]
    );

    const group1Id = group1Result.rows[0].id;

    const group2Result = await client.query(
      `INSERT INTO groups (id, name, description, owner_id, members, shared_memory_objects)
       VALUES (
         gen_random_uuid(),
         'Language Learning Circle',
         'Spanish and French vocabulary and grammar practice.',
         $1,
         $2,
         $3
       )
       RETURNING id`,
      [
        USERS[3].id,
        JSON.stringify([USERS[3].id, USERS[4].id]),
        JSON.stringify([memoryObjects[4].id, memoryObjects[5].id]),
      ]
    );

    const group2Id = group2Result.rows[0].id;

    // Create weekly quests
    console.log('Creating weekly quests...');
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() || 7) + 1);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    await client.query(
      `INSERT INTO weekly_quests (id, group_id, week_start, week_end, challenge_type, target_memory_objects, status)
       VALUES (
         gen_random_uuid(),
         $1,
         $2,
         $3,
         'relay',
         $4,
         'active'
       )`,
      [
        group1Id,
        weekStart,
        weekEnd,
        JSON.stringify([memoryObjects[0].id, memoryObjects[1].id]),
      ]
    );

    await client.query(
      `INSERT INTO weekly_quests (id, group_id, week_start, week_end, challenge_type, target_memory_objects, status)
       VALUES (
         gen_random_uuid(),
         $1,
         $2,
         $3,
         'collective',
         $4,
         'active'
       )`,
      [
        group2Id,
        weekStart,
        weekEnd,
        JSON.stringify([memoryObjects[4].id, memoryObjects[5].id]),
      ]
    );

    await client.query('COMMIT');
    console.log('✅ Seed completed successfully!');
    console.log(`   - ${USERS.length} users created`);
    console.log(`   - ${LEARNING_MOMENTS.length} learning moments created`);
    console.log(`   - ${memoryObjects.length} memory objects created`);
    console.log(`   - 2 groups created`);
    console.log(`   - 2 weekly quests created`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);

