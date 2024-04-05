FROM node:20.9.0-alpine AS build
ARG NPM_TOKEN
WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./yarn.lock ./
RUN echo "//npm.pkg.github.com/:_authToken=$NPM_TOKEN" >> .npmrc && \
    echo "@chinaza:registry=https://npm.pkg.github.com" >> .npmrc && \
    yarn install && \
    rm -f .npmrc

COPY . .
RUN yarn build

FROM node:20.9.0-alpine
WORKDIR /usr/src/app
EXPOSE 3000

COPY --from=build /usr/src/app/dist /usr/src/app
COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/package.json /usr/src/app/package.json

CMD [ "node", "index.js" ]
