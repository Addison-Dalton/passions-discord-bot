import { PrismaClient, Prisma } from "@prisma/client";

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

    // get existing gifs and create new ones
    const existingGifsDb = await prisma.gif.findMany({
      where: { name: { in: user.gifs.map((gif) => gif.name) } },
    });
    const newGifsDb = await prisma.gif.createManyAndReturn({
      data: user.gifs
        .filter((gif) => !existingGifsDb.find((g) => g.name === gif.name))
        .map((gif) => ({ name: gif.name })),
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

export default prisma;
