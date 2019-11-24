FROM node:12.13.0-alpine

WORKDIR /home/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY ./ ./
RUN yarn run build


CMD ["node", "dist/index.js"]
