import { EmbedBuilder } from 'discord.js';
import type { TrackLike } from '../database/supabase';

export function trackEmbed(t: TrackLike, extraField?: { name: string; value: string }) {
  const embed = new EmbedBuilder()
    .setTitle(t.song || 'Untitled')
    .setDescription(`Genre: ${t.genre}`)
    .setTimestamp(new Date());

  if (extraField) embed.addFields({ name: extraField.name, value: extraField.value, inline: false });
  return embed;
}
