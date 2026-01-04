FROM node:18-alpine

RUN apk add --no-cache openssl
WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# Use new entrypoint
CMD ["node", "index.js"]
