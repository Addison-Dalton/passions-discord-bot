import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";

import { handleCommands } from "./utils/handle-commands";
import { handleEvents } from "./utils/handle-events";

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});
handleCommands(client);
handleEvents(client);

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
