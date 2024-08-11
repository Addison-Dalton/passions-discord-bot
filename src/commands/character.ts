import {
  SlashCommandBuilder,
  CommandInteraction,
  AutocompleteInteraction,
} from "discord.js";

import {
  getMostPopularCharacters,
  getPassionCharacters,
  getCharacterPopularity,
} from "../utils/prisma";

const data = new SlashCommandBuilder()
  .setName("character_info")
  .setDescription("Returns requested data of character info")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("most_popular_characters")
      .setDescription("Returns the most popular characters")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("character_popularity")
      .setDescription("Returns the popularity of a specific character")
      .addStringOption((option) =>
        option
          .setName("character")
          .setDescription("The name of the character to search for")
          .setAutocomplete(true)
      )
  );

const autocomplete = async (interaction: AutocompleteInteraction) => {
  const focusedValue = interaction.options.getFocused();
  const characters = await getPassionCharacters();
  const filteredCharacters = characters.filter((character) => {
    const allNames = [
      character.name,
      ...character.aliases.map((alias) => alias.name),
    ];
    return allNames.some((name) => name?.startsWith(focusedValue));
  }).splice(0, 25);

  // @ts-expect-error - complains that filtered character could have a null name - this shouldn't happen since we're working on primary characters and not alias characters
  await interaction.respond(filteredCharacters.map(({ name }) => ({ name, value: name })));
};

const execute = async (interaction: CommandInteraction) => {
  const channel = interaction.channel;
  if (!channel || channel.id !== process.env.DISCORD_PASSIONS_CHANNEL_ID) {
    await interaction.reply(
      "This command can only be used in the passions channel."
    );
    return;
  }

  // @ts-expect-error - CommandInteraction type is incomplete, getSubcommand exists
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case "most_popular_characters":
      await sendMostPopularCharacters(interaction);
      break;
    case "character_popularity":
      await sendCharacterPopularity(interaction);
      break;
    default:
      await interaction.reply(
        "Somehow you gave me an invalid option. Tabby will hear about this."
      );
  }
};

const sendMostPopularCharacters = async (interaction: CommandInteraction) => {
  const popularCharacters = await getMostPopularCharacters();

  const popularCharactersList = popularCharacters
    .map(({ character, count }) => `• **${character.name}**: ${count}`)
    .join("\n");

  await interaction.reply(
    `The most popular posted characters are:\n${popularCharactersList}`
  );
};

const sendCharacterPopularity = async (interaction: CommandInteraction) => {
  // @ts-expect-error - CommandInteraction type is incomplete, getString exists
  const characterName = interaction.options.getString("character");
  const count = await getCharacterPopularity(characterName);

  if (count === null) {
    await interaction.reply(
      `No character found with the name ${characterName}`
    );
    return;
  }

  await interaction.reply(
    `The character ${characterName} has been posted ${count} times.`
  );
};

const command = { data, execute, autocomplete };
export default command;