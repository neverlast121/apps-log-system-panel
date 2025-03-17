FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# Prod Stage
# FROM node:18-alpine AS production 
# WORKDIR /usr/src/app
# COPY --from=build /usr/src/app/dist ./dist
# COPY package*.json ./
# COPY .env ./.env
# RUN npm install --omit=dev

EXPOSE 5000
CMD ["npm", "run", "start"]