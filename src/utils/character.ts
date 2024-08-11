import { Prisma } from "@prisma/client";

export type CharacterWithAlias = Prisma.CharacterGetPayload<{
  include: { aliases: true };
}>;

export const matchGifsWithCharacter = (
  gifs: string[],
  character: CharacterWithAlias
) => {
  const characterAliases = character.aliases.reduce((acc, alias) => {
    if (alias.name) {
      acc.push(alias.name);
    }
    return acc;
  }, [] as string[]);
  const characterRegex = new RegExp(
    [character.name, ...characterAliases].join("|"),
    "i"
  );
  const matchingGifs = gifs.filter((gif) => characterRegex.test(gif));

  return matchingGifs;
};
