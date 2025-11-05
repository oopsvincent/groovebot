import { createClient } from '@supabase/supabase-js';
import { env } from '../config';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
export const TABLE = env.SUPABASE_TABLE; // e.g. 'music_recommendations'

export type TrackLike = { song: string; genre: string };

// 1) List ALL columns (generic) — uses your existing RPC: list_table_columns(tbl)
export async function listColumns(): Promise<string[]> {
  const { data, error } = await supabase.rpc('list_table_columns', { tbl: TABLE });
  if (error) throw error;
  return (data ?? []).map((r: { column_name: string }) => r.column_name);
}

// 2) “Genres” = columns that end with _music — uses list_genre_columns(tbl, suffix)
export async function listGenresFromColumns(suffix = '_music'): Promise<
  { genre: string; column_name: string }[]
> {
  const { data, error } = await supabase.rpc('list_genre_columns', { tbl: TABLE, suffix });
  if (error) throw error;
  return (data ?? []) as { genre: string; column_name: string }[];
}

// 3) Random picks by a specific genre column
export async function randomSongsByGenreColumn(column: string, limit = 1): Promise<TrackLike[]> {
  const { data, error } = await supabase.rpc('random_songs_by_column', {
    tbl: TABLE,
    col: column,
    _limit: limit,
  });
  if (error) throw error;
  return (data ?? []) as TrackLike[];
}

// 4) Random picks from any genre column
export async function randomSongsAny(limit = 1, suffix = '_music'): Promise<TrackLike[]> {
  const { data, error } = await supabase.rpc('random_songs_any', {
    tbl: TABLE,
    _limit: limit,
    suffix,
  });
  if (error) throw error;
  return (data ?? []) as TrackLike[];
}
