# FROM public.ecr.aws/lambda/nodejs:18

# COPY package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD ["dist/serverless.handler"]



###################
# build for local development
FROM public.ecr.aws/lambda/nodejs:18 As development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
FROM public.ecr.aws/lambda/nodejs:18 As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

RUN npm run build

RUN npm ci --only=production && npm cache clean --force

USER node



###################
# PRODUCTION
FROM public.ecr.aws/lambda/nodejs:18 As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

EXPOSE 3000

CMD [ "dist/serverless.handler" ]
