import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import { env } from './config';
import ready from './events/ready';
import { commands } from './commands';
import type { Command } from './types';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commandMap = new Collection<string, Command>();
for (const c of commands) commandMap.set(c.data.name, c);

// Register slash commands (guild for fast iteration)
async function registerCommands() {
// src/index.ts (inside registerCommands)
const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
const body = commands.map(c => c.data.toJSON());

// Always global; no guild route
await rest.put(Routes.applicationCommands(env.DISCORD_APP_ID), { body });
console.log('🌍 Global commands registered');
}

// Wire events
ready(client);

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = commandMap.get(interaction.commandName);
      if (!cmd) return;
      await cmd.execute(interaction);
    } else if (interaction.isAutocomplete()) {
      const cmd = commandMap.get(interaction.commandName);
      if (!cmd?.autocomplete) return;
      await cmd.autocomplete(interaction);
    }
  } catch (err) {
    console.error(err);
    if (interaction.isRepliable()) {
      const content = 'Something went sideways. Check logs.';
      if (interaction.deferred || interaction.replied) await interaction.editReply(content);
      else await interaction.reply({ content, ephemeral: true });
    }
  }
});

// Bootstrap
registerCommands()
  .then(() => client.login(env.DISCORD_TOKEN))
  .catch((e) => {
    console.error('Startup error:', e);
    process.exit(1);
  });
