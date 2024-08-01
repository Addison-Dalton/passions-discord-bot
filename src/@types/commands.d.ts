type GifMessage = {
  name: string;
  timestamp: number;
  authorDisplayName: string;
  authorName: string;
};

type UserGifs = {
  name: string;
  username: string;
  gifs: Array<{ name: string }>;
};

type DataCommandOptions = "scores" | "leaderboard" | "averageScore";
