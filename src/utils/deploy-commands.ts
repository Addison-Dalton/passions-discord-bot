import "dotenv/config";
import { REST, Routes } from "discord.js";
import { readCommandFiles } from "./read-command-files";

const commandsToJson = [];
const { commands } = readCommandFiles();

for (const command of commands) {
  commandsToJson.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

// deploy commands
(async () => {
  try {
    console.log(
      `Started refreshing ${commandsToJson.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
        Routes.applicationGuildCommands(
            process.env.DISCORD_CLIENT_ID!,
            process.env.DISCORD_GUILD_ID!
        ),
        { body: commandsToJson }
    ) as unknown as object[];

    console.log(
        `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
