# FROM node:18-alpine AS build
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install
# COPY . .

# # Prod Stage
# # FROM node:18-alpine AS production 
# # WORKDIR /usr/src/app
# # COPY --from=build /usr/src/app/dist ./dist
# # COPY package*.json ./
# # COPY .env ./.env
# # RUN npm install --omit=dev

# EXPOSE 5000
# CMD ["npm", "run", "start"]

# Use Node.js base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files first (for caching dependencies)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the application
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
