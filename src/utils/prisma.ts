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

export default prisma;
