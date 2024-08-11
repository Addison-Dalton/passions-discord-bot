import { PrismaClient, Prisma } from "@prisma/client";
import { matchGifsWithCharacter } from "./character";

const prisma = new PrismaClient();

export const saveScore = async (score: number) => {
  const dbScore = await prisma.score.create({
    data: {
      score,
    },
  });

  return dbScore;
};

export const saveScoredGifs = async (scoreId: number, userGifs: UserGifs[]) => {
  for (const user of userGifs) {
    let userDb: Prisma.UserGetPayload<any> | null = null;
    userDb = await prisma.user.findUnique({
      where: { name: user.username },
    });

    // create user if not exists
    if (!userDb) {
      userDb = await prisma.user.create({
        data: {
          name: user.username,
        },
      });
    }

    const uniqueGifs = Array.from(new Set(user.gifs.map((gif) => gif.name)))
      .map((name) => user.gifs.find((gif) => gif.name === name))
      .filter((gif) => gif !== undefined);

    // get existing gifs and create new ones
    const existingGifsDb = await prisma.gif.findMany({
      where: { name: { in: uniqueGifs.map((gif) => gif.name) } },
    });

    const newGifs = uniqueGifs.filter(
      (gif) => !existingGifsDb.find((g) => g.name === gif.name)
    );
    const newGifsDb = await prisma.gif.createManyAndReturn({
      data: newGifs.map((gif) => ({ name: gif.name })),
    });
    const allGifsDb = [...existingGifsDb, ...newGifsDb];
    // create scored gifs
    await prisma.scoredGif.createMany({
      data: user.gifs.map((gif) => {
        const gifDb = allGifsDb.find((g) => g.name === gif.name);
        return {
          gifId: gifDb!.id, // this should never be undefined
          userId: userDb.id,
          scoreId,
        };
      }),
    });
  }
};

export const getScores = async (count = 5) => {
  const scores = await prisma.score.findMany({
    take: count,
    orderBy: { scoredAt: "desc" },
  });

  return scores;
};

export const getLeaderboard = async (count = 0) => {
  const result = await prisma.scoredGif.groupBy({
    by: ["userId"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
  });

  if (count > 0) {
    result.splice(count);
  }

  if (result.length === 0) return [];

  const userIds = result.map((r) => r.userId);
  // I think it's dumb to make another DB query, but I don't see where prisma
  // support relations in groupBy queries
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
  });

  const leaderboard = result.map((r) => {
    const user = users.find((u) => u.id === r.userId);
    return {
      user: user!.name,
      count: r._count.id,
    };
  });

  return leaderboard;
};

// roundUp to roundUp any score below 70 to 70
export const getAverageScore = async (roundUp = true) => {
  const scores = await prisma.score.findMany();

  const average = Math.round(
    scores.reduce((sum, { score }) => {
      // round up any score below 70 if roundUp is true
      if (roundUp && score < 70) {
        return sum + 70;
      }
      return sum + score;
    }, 0) / scores.length
  );

  return average;
};

export const getPassionCharacters = async () => {
  const characters = await prisma.character.findMany({
    include: { aliases: true },
    where: { aliasId: null }, // only primary characters,
  });

  return characters;
};

export const getScoredGifs = async () => {
  const scoredGifs = await prisma.scoredGif.findMany({
    include: { gif: true },
  });

  return scoredGifs;
};

export const getCharacterPopularity = async (characterName: string) => {
  const character = await prisma.character.findUnique({
    where: { name: characterName },
    include: { aliases: true },
  });
  const scoredGifs = await getScoredGifs();
  const gifNames = scoredGifs.map((scoredGif) => scoredGif.gif.name);

  if (!character) {
    return null;
  }

  const matchingGifs = matchGifsWithCharacter(gifNames, character);

  return matchingGifs.length;
};

export const getMostPopularCharacters = async (limit = 10) => {
  const characters = await getPassionCharacters();
  const scoredGifs = await getScoredGifs();
  const gifNames = scoredGifs.map((scoredGif) => scoredGif.gif.name);

  const popularCharacters = characters
    .map((character) => {
      const matchingGifs = matchGifsWithCharacter(gifNames, character);
      return {
        character,
        count: matchingGifs.length,
      };
    })
    .sort((a, b) => b.count - a.count);

  return popularCharacters.slice(0, limit);
};

export const getRandomMatchingCharacter = async (gifs: GifMessage[]) => {
  const characters = await getPassionCharacters();
  const chosenCharacterIndex = Math.floor(Math.random() * characters.length);
  const chosenCharacter = characters[chosenCharacterIndex];
  const gifNames = gifs.map((gif) => gif.name);
  console.info("Chosen character:", chosenCharacter.name);

  const matchingGifs = matchGifsWithCharacter(gifNames, chosenCharacter);

  return {
    matchingGifs,
    chosenCharacter,
  };
};
export default prisma;
