import { z } from 'zod';

export const ipv4Schema = z.ipv4();

export const routerSchema = z.object({
  id: z.string().min(1),
  ip: ipv4Schema,
  name: z.string().trim().min(1).max(64).optional(),
});

export type Router = z.infer<typeof routerSchema>;

export const createRouterSchema = z.object({
  ip: ipv4Schema,
  name: z.string().trim().min(1).max(64).optional(),
});

export type CreateRouterInput = z.infer<typeof createRouterSchema>;

export const applyModeSchema = z.enum(['save', 'apply']);
export type ApplyMode = z.infer<typeof applyModeSchema>;

export const applyRequestSchema = z.object({
  content: z.string().min(1),
  routerIds: z.array(z.string().min(1)).min(1),
  mode: applyModeSchema,
});

export type ApplyRequest = z.infer<typeof applyRequestSchema>;

export type ApplyStage = 'save' | 'restart' | 'backup';

export interface ApplyRouterResult {
  routerId: string;
  ok: boolean;
  stage?: ApplyStage;
  error?: string;
  backupName?: string;
}

export const backupRequestSchema = z.object({
  routerIds: z.array(z.string().min(1)).min(1),
});

export type BackupRequest = z.infer<typeof backupRequestSchema>;

export interface HealthStatus {
  routerId: string;
  online: boolean;
  running?: boolean;
  currentCore?: string;
  error?: string;
}
