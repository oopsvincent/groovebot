import type { Command } from '../types';
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ApplicationCommandOptionChoiceData,
} from 'discord.js';
import {
  listColumns,
  listGenresFromColumns,
  randomSongsAny,
  randomSongsByGenreColumn,
  type TrackLike,
} from '../database/supabase';
import { trackEmbed } from '../utils/helper';

// /song [genre] [column] [limit]
const song: Command = {
  data: new SlashCommandBuilder()
    .setName('song')
    .setDescription('Fetch a random song, optionally filtered by genre.')
    .addStringOption(opt =>
      opt
        .setName('genre')
        .setDescription('Pick a genre')
        .setAutocomplete(true)
        .setRequired(false),
    )
    .addIntegerOption(opt =>
      opt
        .setName('limit')
        .setDescription('How many songs (1–5)')
        .setMinValue(1)
        .setMaxValue(5)
        .setRequired(false),
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const genreColumn = interaction.options.getString('genre'); // this is the *_music column
    const limit = interaction.options.getInteger('limit') ?? 1;

    const rows = genreColumn
      ? await randomSongsByGenreColumn(genreColumn, limit)
      : await randomSongsAny(limit);

    if (!rows.length) {
      await interaction.editReply('No songs found. Try another genre.');
      return;
    }

    await interaction.editReply({ embeds: rows.map(r => trackEmbed(r)) });
  },

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused(true);
    if (focused.name !== 'genre') { await interaction.respond([]); return; }

    const rows = await listGenresFromColumns(); // [{ genre, column_name }]
    const q = String(focused.value ?? '').toLowerCase();
    await interaction.respond(
      rows
        .filter(r => r.genre.toLowerCase().includes(q))
        .slice(0, 25)
        .map(r => ({ name: r.genre, value: r.column_name })) // pretty name, pass column
    );
  },
};

const columns: Command = {
  data: new SlashCommandBuilder().setName('columns').setDescription('List all table columns.'),
  async execute(interaction) {
    const cols = await listColumns();
    await interaction.reply(cols.length ? 'Columns: ' + cols.join(', ') : 'No columns found.');
  },
};

export const commands: Command[] = [song, columns];
