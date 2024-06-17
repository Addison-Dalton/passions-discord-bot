import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";

import { handleCommands } from "./utils/handle-commands";
import { handleEvents } from "./utils/handle-events";

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
handleCommands(client);
handleEvents(client);

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
