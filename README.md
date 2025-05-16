# Discord Passions Bot
This is a discord bot created to grade the gif spam that follows the Passions theme intro. It's only been created for my specific discord, and was not built with the intention to be used across multiple servers.

## Local Development
To develop and run this locally, follow these steps:

1. Create a `.env` file, and copy the contents of the `.sample-env` file into it.
2. Install deps using `pnpm install`.
3. The bot can be started with `pnpm start`. If any commands are added or changed, they will need to be deployed again. This can be done with `pnpm deploy-commands`.

## Publishing
This was built to be published / hosted locally using docker. Assuming docker is setup on your machine, this can be done with:

1. `docker compose build`
2. `docker compose up`

## If the bot stops reporting gifs.
Look at the calculation for `oneMinuteAgo` in `grade.ts`. For whatever reason this seems to drift off. I seem to have to increment the starting value to fix.