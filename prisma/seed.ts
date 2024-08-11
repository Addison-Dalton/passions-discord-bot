import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const passionCharacters = [
  {
    name: "Tabitha Lenox",
    aliases: ["tabitha", "tabby", "bagitha"],
  },
  {
    name: "Timmy Lenox",
    aliases: ["timmy", "tim-tim", "dollboy"],
  },
  {
    name: "Julian Crane",
    aliases: ["julian"],
  },
  {
    name: "Ethan Winthrop",
    aliases: ["ethan", "himbo", "dumb"],
  },
  {
    name: "Theresa Lopez-Fitzgerald",
    aliases: ["theresa"],
  },
  {
    name: "Gwen Hotchkiss",
    aliases: ["gwen"],
  },
  {
    name: "Rebecca Hotchkiss",
    aliases: ["rebecca"],
  },
  {
    name: "Ivy Winthrop",
    aliases: ["ivy", "vampivy"],
  },
  {
    name: "Sam Bennett",
    aliases: ["sam"],
  },
  {
    name: "Grace Bennett",
    aliases: ["grace", "boring"],
  },
  {
    name: "Kay Bennett",
    aliases: ["kay"],
  },
  {
    name: "Miguel Lopez-Fitzgerald",
    aliases: ["miguel"],
  },
  {
    name: "Luis Lopez-Fitzgerald",
    aliases: ["luis", "louse"],
  },
  {
    name: "Sheridan Crane",
    aliases: ["sheridan", "diana"],
  },
  {
    name: "Pilar Lopez-Fitzgerald",
    aliases: ["pilar", "pol pot"],
  },
  {
    name: "Jessica Bennett",
    aliases: ["jessica"],
  },
  {
    name: "Simone Russell",
    aliases: ["simone"],
  },
  {
    name: "Whitney Russell",
    aliases: ["whitney"],
  },
  {
    name: "Chad",
    aliases: ["chad"],
  },
  {
    name: "Eve Russell",
    aliases: ["eve"],
  },
  {
    name: "TC Russell",
    aliases: ["tc"],
  },
  {
    name: "Alistair Crane",
    aliases: ["alistair"],
  },
  {
    name: "Beth Wallace",
    aliases: ["beth"],
  },
  {
    name: "Norma Bates",
    aliases: ["norma", "nasty norma"],
  },
  {
    name: "Reese Durkee",
    aliases: ["reese", "ross", "rude boy"],
  },
  {
    name: "Father Lonigan",
    aliases: ["lonigan"],
  },
  {
    name: "Hank Bennett",
    aliases: ["hank", "chank"],
  },
  {
    name: "Hotdog",
    aliases: ["hotdog", "assassin"],
  },
  {
    name: "Faith Standish",
    aliases: ["faith"],
  },
  {
    name: "Dick monster",
    aliases: ["dick", "hell"],
  },
  {
    name: "Hecuba",
    aliases: ["hecuba"],
  },
];

async function main() {
  for (const character of passionCharacters) {
    const createdCharacter = await prisma.character.create({
      data: {
        name: character.name,
      },
    });

    for (const alias of character.aliases) {
      await prisma.character.create({
        data: {
          name: alias,
          primaryName: {
            connect: { id: createdCharacter.id },
          },
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(`Error seeding DB: ${e}`);
    await prisma.$disconnect();
    process.exit(1);
  });
