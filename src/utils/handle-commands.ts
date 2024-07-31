import { Client, Collection } from "discord.js";

import { grade, score } from "../commands";

export const handleCommands = (client: Client<boolean>) => {
  client.commands = new Collection();

  client.commands.set(grade.data.name, grade);
  client.commands.set(score.data.name, score);
};
