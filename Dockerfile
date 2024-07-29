FROM node:latest

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --verbose

# Copy the rest of the application code
COPY . .

# Initialize Prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the project
RUN npm run build

# Start the application
CMD ["npm", "start"]