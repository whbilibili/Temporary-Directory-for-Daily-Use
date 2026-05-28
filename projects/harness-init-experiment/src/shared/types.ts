import { z } from 'zod';

export type TaskPriority = 1 | 2 | 3; // 1=高, 2=中, 3=低
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Task {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  priority: TaskPriority;
  status: TaskStatus;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  estimatedDuration?: number;
}

export const taskSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1),
  payload: z.record(z.unknown()),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),
  retryCount: z.number().int().min(0).default(0),
  maxRetries: z.number().int().min(0).default(3),
  createdAt: z.number().default(() => Date.now()),
  estimatedDuration: z.number().optional(),
});
