import { SlashCommandBuilder, CommandInteraction } from "discord.js";

import { getScores, getLeaderboard, getAverageScore } from "../utils/prisma";
import { letterGrade } from "../utils/commands";

export const data = new SlashCommandBuilder()
  .setName("gif_data")
  .setDescription("Sends requested data on gif scores")
  .addStringOption((option) =>
    option
      .setName("data_option")
      .setDescription("The option of what data to send")
      .setRequired(true)
      .addChoices(
        { name: "Previous Scores", value: "scores" },
        { name: "Gif Leaderboard", value: "leaderboard" },
        { name: "Average Score", value: "averageScore" }
      )
  );

export async function execute(interaction: CommandInteraction) {
  const channel = interaction.channel;
  if (!channel || channel.id !== process.env.DISCORD_PASSIONS_CHANNEL_ID) {
    await interaction.reply(
      "This command can only be used in the passions channel."
    );
    return;
  }

  // @ts-expect-error - CommandInteraction type is incomplete, getString exists
  const option = interaction.options.getString(
    "data_option"
  ) as DataCommandOptions;

  switch (option) {
    case "scores":
      await sendScores(interaction);
      break;
    case "leaderboard":
      await sendLeaderboard(interaction);
      break;
    case "averageScore":
      await sendAverageScore(interaction);
      break;
    default:
      await interaction.reply(
        "Somehow you gave me an invalid option. Tabby will hear about this."
      );
  }
}

const sendScores = async (interaction: CommandInteraction) => {
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
};

const sendLeaderboard = async (interaction: CommandInteraction) => {
  const leaderboard = await getLeaderboard();

  if (leaderboard.length === 0) {
    await interaction.reply("There are no scores to display.");
    return;
  }

  const members = await interaction.guild?.members.fetch();
  const leaderboardWithDisplayNames = leaderboard.map((leader) => {
    const member = members?.find((m) => m.user.username === leader.user);

    return {
      user: member?.displayName ?? leader.user,
      count: leader.count,
    };
  });

  const introductionResponse = "Here is the current leaderboard:";
  const leaderboardResponse = leaderboardWithDisplayNames
    .map((leader) => {
      return `- **${leader.user}**: ${leader.count}`;
    })
    .join("\n");

  await interaction.reply(`${introductionResponse}\n${leaderboardResponse}`);
};

const sendAverageScore = async (interaction: CommandInteraction) => {
  const averageScore = await getAverageScore();
  const averageGrade = letterGrade(averageScore);

  await interaction.reply(
    `The average grade is **${averageGrade}**! Tabby rounded up the scores some, so be grateful.`
  );
};

const command = { data, execute };
export default command;
