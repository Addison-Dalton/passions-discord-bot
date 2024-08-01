import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import prisma from "./utils/prisma";

import { handleCommands } from "./utils/handle-commands";
import { handleEvents } from "./utils/handle-events";

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel],
});

async function main() {
  handleCommands(client);
  handleEvents(client);

  // Log in to Discord with your client's token
  client.login(process.env.DISCORD_TOKEN);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
