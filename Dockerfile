# DEVELOPMENT
FROM node:18-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build



# PRODUCTION
FROM node:18-alpine As production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]