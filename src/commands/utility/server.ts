import { SlashCommandBuilder, CommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Replies with server info!");

export async function execute(interaction: CommandInteraction) {
  await interaction.reply(
    `Server name: ${interaction?.guild?.name}\nTotal members: ${interaction?.guild?.memberCount}`
  );
}
