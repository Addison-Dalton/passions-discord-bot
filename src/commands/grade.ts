import {
  SlashCommandBuilder,
  CommandInteraction,
  Message,
  Collection,
  Guild,
  User,
} from "discord.js";

import { sleep } from "../utils/sleep";
import {
  saveScore,
  saveScoredGifs,
  getRandomMatchingCharacter,
} from "../utils/prisma";
import { letterGrade } from "../utils/commands";

const passion_gif_candidates = [
  "i-love-your-passion-justin-murry-the-seafloor-cinema-tap-tapply-song-good-passion-gif-25834259",
  "passion-alex-learn-english-with-alex-its-my-passion-passionate-gif-23032424",
  "its-about-passion-passionate-desire-dream-love-of-it-gif-14955686",
  "explaining-proud-passion-this-is-my-passion-pauly-d-gif-12122018",
  "owen-wilson-gif-22691883",
  "passionate-passion-bobs-burgers-love-gif-4923358",
  "its-all-about-the-passion-pagkahilig-pagsinta-tungkol-lahat-sa-pagkahilig-desire-gif-16778954",
  "it's-my-passion-hemant-oberoi-pinkvilla-it's-my-hobby-it's-what-i-love-to-do-gif-8895691660290595113",
  "its-a-passion-of-mine-nora-radford-kate-burton-inventing-anna-one-of-my-passions-gif-25142945",
  "you-have-a-lot-of-passion-kenny-g-enthusiasm-musician-saxophonist-gif-19074422",
];

const passions_tabby_shade = "passions-tabitha-shade-look-back-gif-25490552";

export const data = new SlashCommandBuilder()
  .setName("grade")
  .setDescription("Grades the passion gifs just spammed.");

export async function execute(interaction: CommandInteraction) {
  // TODO - abtract this part to be used across all commands
  const channel = interaction.channel;
  if (!channel || channel.id !== process.env.DISCORD_PASSIONS_CHANNEL_ID) {
    await interaction.reply(
      "This command can only be used in the passions channel."
    );
    return;
  }

  // wait for messages to settle before grading
  await sleep(1000);

  // get the last 100 messages
  const messages = await interaction.channel?.messages.fetch({ limit: 100 });
  const gifMessages = gatherGifMessages(messages);
  console.info("gifMessages", gifMessages);

  if (gifMessages.length === 0) {
    await interaction.reply("No gifs found in the last minute.");
    return;
  }

  let score = scoreGifs(gifMessages);

  // add extra points for each gif that matches the randomly chosen character
  const { matchingGifs, chosenCharacter } = await getRandomMatchingCharacter(
    gifMessages
  );
  score += matchingGifs.length;

  const userGifs = groupGifsByUser(gifMessages);
  const grade = letterGrade(score);
  const reponse = response(score);

  let userScoreList = "";
  userGifs.forEach((user) => {
    userScoreList += `- **${user.name}**: ${user.gifs.length}\n`;
  });
  const userScoresString = `The following users posted gifs:\n${userScoreList}`;
  const chosenCharacterString = `You've been awarded **${matchingGifs.length}** extra points for posting gifs of **${chosenCharacter.name}**!`;
  const noGifsWithCharacterString = `No gifs were posted of **${chosenCharacter.name}**. No extra points for you!`;

  await interaction.reply(
    `${reponse} The score was ${score} resulting in a grade of **${grade}**.\n${
      matchingGifs.length > 0
        ? chosenCharacterString
        : noGifsWithCharacterString
    }\n\n${userScoresString}`
  );

  // save data to database
  const dbScore = await saveScore(score);
  await saveScoredGifs(dbScore.id, userGifs);
}

const response = (score: number) => {
  if (score === 100) {
    return "You're a true passionista!";
  } else if (score >= 90) {
    return "You've made Tabby proud!";
  } else if (score >= 80) {
    return "You can do better than that buttercup!";
  } else if (score >= 70) {
    return "You're not even trying!";
  } else {
    return "You're a disgrace to the passion community!";
  }
};

const gatherGifMessages = (messages: Collection<string, Message<boolean>>) => {
  const gifMessages: GifMessage[] = [];
  const oneMinuteAgo = Date.now() - 3 * 60 * 1000;
  const messagesWithinLastMinute = messages.filter(
    (message) => message.createdTimestamp >= oneMinuteAgo
  );

  if (messagesWithinLastMinute.size === 0) return gifMessages;

  messagesWithinLastMinute.forEach((message: Message) => {
    if (
      message.embeds.length > 0 && // gif should count as an embed
      /^https:.*gif/.test(message.content) // starts with https and contains gif in the name
    ) {
      try {
        const gifName = new URL(message.content).pathname.split("/").pop();
        if (!gifName) {
          throw new Error("Gif name not found");
        }
        gifMessages.push({
          name: gifName,
          timestamp: message.createdTimestamp,
          authorDisplayName: getUserNickname(message.author, message.guild),
          authorName: message.author.username,
        });
      } catch (error) {
        console.error(
          `Error parsing gif from message with content: ${message.content}. Error encountered is: ${error}`
        );
      }
    }
  });

  return gifMessages;
};

const scoreGifs = (gifMessages: GifMessage[]) => {
  let points = 100;
  // sort by timestamp oldest to newest
  gifMessages.sort((a, b) => a.timestamp - b.timestamp);
  // gif messages must end with passions_tabby_shade directly followed by one of the passion_gif_candidates
  const [firstGif, secondGif] = gifMessages.slice(-2);
  if (
    firstGif.name == passions_tabby_shade &&
    passion_gif_candidates.includes(secondGif.name)
  ) {
    // subtract points if the approved gifs are too far apart
    // 1200ms (1.2s) is the ideal time between the two gifs
    const timeDifference = secondGif.timestamp - firstGif.timestamp;
    const deviation = Math.abs(timeDifference - 1200);
    if (deviation < 100) {
      points -= 0;
    } else if (deviation < 300) {
      points -= 15;
    } else if (deviation < 500) {
      points -= 25;
    } else if (deviation < 700) {
      points -= 35;
    } else if (deviation < 900) {
      points -= 50;
    } else {
      points = 0;
    }
  } else {
    points = 0;
  }

  // calc extra points for same gifs in a row
  const groupedGifs = groupGifs(gifMessages);
  for (const group of groupedGifs) {
    if (group.length > 4) {
      points -= 5;
    } else if ((group.length = 3)) {
      points += 5;
    } else if ((group.length = 2)) {
      points += 3;
    }
  }

  return points;
};

const groupGifsByUser = (gifMessages: GifMessage[]) => {
  const usersGifs = gifMessages.reduce((acc, message) => {
    const userIndex = acc.findIndex(
      (user) => user.name === message.authorDisplayName
    );
    if (userIndex !== -1) {
      acc[userIndex].gifs.push({ name: message.name });
    } else {
      acc.push({
        name: message.authorDisplayName,
        username: message.authorName,
        gifs: [{ name: message.name }],
      });
    }
    return acc;
  }, [] as UserGifs[]);
  return usersGifs.sort((a, b) => b.gifs.length - a.gifs.length);
};

const groupGifs = (gifMessages: GifMessage[]) => {
  const groups: GifMessage[][] = [];
  let currentGroup: GifMessage[] = [];
  const groupedNames = new Set();

  for (let i = 0; i < gifMessages.length; i++) {
    if (currentGroup.length === 0) {
      currentGroup.push(gifMessages[i]);
    } else if (currentGroup[0].name === gifMessages[i].name) {
      currentGroup.push(gifMessages[i]);
    } else {
      if (currentGroup.length > 1 && !groupedNames.has(currentGroup[0].name)) {
        groups.push(currentGroup);
        groupedNames.add(currentGroup[0].name);
      }
      currentGroup = [gifMessages[i]];
    }
  }
  // Push the last group if it contains at least 2 items
  if (currentGroup.length > 1 && !groupedNames.has(currentGroup[0].name)) {
    groups.push(currentGroup);
  }

  return groups;
};

const getUserNickname = (user: User, guild: Guild | null) => {
  if (!guild) {
    return user.displayName;
  }
  return guild.members.cache.get(user.id)?.nickname || user.displayName;
};

const command = { data, execute };
export default command;
