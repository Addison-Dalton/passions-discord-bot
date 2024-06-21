import {
  SlashCommandBuilder,
  CommandInteraction,
  Message,
  Collection,
} from "discord.js";

import { sleep } from "../utils/sleep";

type GifMessage = {
  name: string;
  timestamp: number;
};

const passion_gif_candidates = [
  "i-love-your-passion-justin-murry-the-seafloor-cinema-tap-tapply-song-good-passion-gif-25834259",
  "passion-alex-learn-english-with-alex-its-my-passion-passionate-gif-23032424",
  "its-about-passion-passionate-desire-dream-love-of-it-gif-14955686",
];

const passions_tabby_shade = "passions-tabitha-shade-look-back-gif-25490552";

export const data = new SlashCommandBuilder()
  .setName("grade")
  .setDescription("Grades the passion gifs just spammed.");

export async function execute(interaction: CommandInteraction) {
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
  console.log("gifMessages", gifMessages);
  const score = scoreGifs(gifMessages);
  const grade = gradeGifs(score);
  const reponse = response(score);
  await interaction.reply(
    `${reponse} The score was ${score} resulting in a grade of **${grade}**.`
  );
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
  const currentDay = new Date();
  currentDay.setHours(0, 0, 0, 0); // Start of the current day

  messages?.forEach((message: Message) => {
    if (
      message.createdTimestamp >= currentDay.getTime() &&
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
    const timeDifference = secondGif.timestamp - firstGif.timestamp;
    if (timeDifference < 100) {
      points -= 0;
    } else if (timeDifference < 300) {
      points -= 15;
    } else if (timeDifference < 500) {
      points -= 25;
    } else if (timeDifference < 700) {
      points -= 35;
    } else if (timeDifference < 900) {
      points -= 50;
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

const gradeGifs = (points: number) => {
  const grades = [
    { grade: "S+++", threshold: 100 },
    { grade: "A+", threshold: 97 },
    { grade: "A", threshold: 93 },
    { grade: "A-", threshold: 90 },
    { grade: "B+", threshold: 87 },
    { grade: "B", threshold: 83 },
    { grade: "B-", threshold: 80 },
    { grade: "C+", threshold: 77 },
    { grade: "C", threshold: 73 },
    { grade: "C-", threshold: 70 },
    { grade: "D+", threshold: 67 },
    { grade: "D", threshold: 63 },
    { grade: "D-", threshold: 60 },
    { grade: "F", threshold: 10 },
    { grade: "Z-", threshold: 0 },
  ];

  const grade = grades.find((g) => points >= g.threshold);
  return grade ? grade.grade : "F";
};

const command = { data, execute };
export default command;