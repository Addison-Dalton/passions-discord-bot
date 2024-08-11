import { Client, Collection } from "discord.js";

import { grade, data, character } from "../commands";

export const handleCommands = (client: Client<boolean>) => {
  client.commands = new Collection();

  client.commands.set(grade.data.name, grade);
  client.commands.set(data.data.name, data);
  client.commands.set(character.data.name, character);
};
