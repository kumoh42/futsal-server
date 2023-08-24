FROM public.ecr.aws/lambda/nodejs:18

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["dist/serverless.handler"]

# # DEVELOPMENT
# FROM amazon/aws-lambda-nodejs:18 As development
# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build



# # PRODUCTION
# FROM amazon/aws-lambda-nodejs:18 As production

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm ci --only=production

# COPY . .

# COPY --from=development /usr/src/app/dist ./dist

# EXPOSE 3000

# CMD ["dist/serverless.handler" ]