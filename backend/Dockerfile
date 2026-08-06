# Base image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build NestJS app
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --only=production

# Copy built app
COPY --from=builder /app/dist ./dist

# Expose port (Render sets PORT env variable automatically)
EXPOSE 3000

# Start command
CMD ["node", "dist/main"]
