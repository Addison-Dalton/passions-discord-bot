import { Client, Collection } from "discord.js";

import { readCommandFiles } from "./read-command-files";

export const handleCommands = (client: Client<boolean>) => {
  client.commands = new Collection();

  const { commands } = readCommandFiles();

  for (const command of commands) {
    client.commands.set(command.data.name, command);
  }
};
