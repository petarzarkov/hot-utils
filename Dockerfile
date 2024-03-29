FROM node:14.18.0-alpine3.11 AS base

ARG NPM_TOKEN
RUN apk update && apk add bash
RUN npm -g install npm@7.20

FROM base AS appbase
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
COPY --chown=node:node . /app
RUN ls -lah /app
RUN cd /app && \
    npm ci && \
    npm run lint && \
    npm run build && \
    npm config set '//registry.npmjs.org/:_authToken' "${NPM_TOKEN}" && \
    npm run publish
