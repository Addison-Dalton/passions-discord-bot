import { SlashCommandBuilder, CommandInteraction } from "discord.js";

import { getScores } from "../utils/prisma";
import { letterGrade } from "../utils/commands";

export const data = new SlashCommandBuilder()
  .setName("score")
  .setDescription("Returns the scores of the previous 5 scores.");

export async function execute(interaction: CommandInteraction) {
  const channel = interaction.channel;
  if (!channel || channel.id !== process.env.DISCORD_PASSIONS_CHANNEL_ID) {
    await interaction.reply(
      "This command can only be used in the passions channel."
    );
    return;
  }

  const scores = await getScores();

  const introductionResponse = "Here are the previous 5 scores:";
  const scoreResponse = scores
    .map((score) => {
      const date = new Date(score.scoredAt);
      return `- On **${date.toDateString()}** the score was **${
        score.score
      }** resulting in a **${letterGrade(score.score)}**`;
    })
    .join("\n");

  await interaction.reply(`${introductionResponse}\n${scoreResponse}`);
}

const command = { data, execute };
export default command;
