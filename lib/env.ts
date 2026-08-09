import { z } from 'zod';

const envSchema = z.object({
  DATA_DIR: z.string().min(1).default('./data'),
  MIHOMO_CONFIG_PATH: z
    .string()
    .min(1)
    .default('/opt/etc/mihomo/config.yaml'),
  XKEEN_UI_PORT: z.coerce.number().int().positive().default(1000),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) {
    return cached;
  }

  const parsed = envSchema.safeParse({
    DATA_DIR: process.env.DATA_DIR,
    MIHOMO_CONFIG_PATH: process.env.MIHOMO_CONFIG_PATH,
    XKEEN_UI_PORT: process.env.XKEEN_UI_PORT,
  });

  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }

  cached = parsed.data;

  return cached;
}
