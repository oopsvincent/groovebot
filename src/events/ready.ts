// src/events/ready.ts
import { Client, Events, ActivityType } from 'discord.js';
import { supabase, TABLE } from '../database/supabase';

export default (client: Client) => {
  client.once(Events.ClientReady, async () => {
    if (!client.user) return;
    console.log(`✅ Logged in as ${client.user.tag}`);

    // 1) Set something instantly so you SEE it even if metrics fail
    client.user.setPresence({
      status: 'online',
      activities: [{ name: '/song • try it', type: ActivityType.Listening }],
    });

    async function metrics() {
      // defensive: never throw
      try {
        const [{ data: cols, error: e1 }, { count, error: e2 }] = await Promise.all([
          supabase.rpc('list_genre_columns', { tbl: TABLE, suffix: '_music' }),
          supabase.from(TABLE).select('id', { count: 'exact', head: true }),
        ]);
        if (e1 || e2) return { genres: 0, rows: 0 };
        return { genres: (cols ?? []).length, rows: count ?? 0 };
      } catch {
        return { genres: 0, rows: 0 };
      }
    }

    let i = 0;
    const rotate = async () => {
      const { genres, rows } = await metrics();
      const variants = [
        { name: `/song • ${genres} genres`, type: ActivityType.Listening as const },
        { name: `${rows} rows of grooves`, type: ActivityType.Playing as const },
        { name: `tip: /song genre:pop`, type: ActivityType.Watching as const },
        { name: 'Groove live', type: ActivityType.Streaming, url: 'https://twitch.tv/oopsvincent' }
      ];
      const v = variants[i % variants.length];
      client.user!.setPresence({ status: 'online', activities: [v] });
      i++;
    };

    // 2) Keep it fresh, but never block presence
    setInterval(rotate, 30_000);
    
  });
};
