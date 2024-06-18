import { Client, ClientEvents } from "discord.js";
import { ready, interactionCreate } from "../events";

export const handleEvents = (client: Client<boolean>) => {
  client.once(ready.name as keyof ClientEvents, (...args) =>
    // @ts-ignore
    ready.execute(...args)
  );
  client.on(interactionCreate.name as keyof ClientEvents, (...args) =>
    // @ts-ignore
    interactionCreate.execute(...args)
  );
};
