import 'dotenv/config';
import { z } from 'zod';

const Env = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_APP_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().optional(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_TABLE: z.string().min(1).default('tracks'),
});

export const env = Env.parse(process.env);
