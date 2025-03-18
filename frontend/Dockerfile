# Build Stage
FROM node:18-alpine AS build
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source code and build
COPY . .
RUN npm run build 

# Production Stage
FROM node:18-alpine AS production
WORKDIR /usr/src/app

# Install serve for static file hosting
RUN npm install -g serve

# Copy only the built files
COPY --from=build /usr/src/app/build /usr/src/app/build

# Expose the application port
EXPOSE 3000

# Serve the React build
CMD ["serve", "-s", "build", "-l", "3000"]


# # Build Stage
# FROM node:18-alpine AS build
# WORKDIR /usr/src/app

# # Copy package files and install dependencies
# COPY package*.json ./
# RUN npm ci --omit=dev

# # Copy source code and build
# COPY . .
# RUN npm run build 

# # Production Stage
# FROM node:18-alpine AS production
# WORKDIR /usr/src/app

# # Install serve for static file hosting
# RUN npm install -g serve

# # Copy built files from build stage
# COPY --from=build /usr/src/app/build /usr/src/app/build

# # Expose the application port
# EXPOSE 3000
# # Use JSON syntax for CMD to prevent unintended behavior
# CMD ["npm", "run", "start"]
