FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy only production dependencies and built files
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

# Security best practice: avoid running as root
USER node

EXPOSE 4000

CMD ["node", "dist/main"]
