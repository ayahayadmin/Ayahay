FROM node:18-alpine AS multistage

WORKDIR /usr/src/app

ENV DATABASE_URL postgres

# COPY api/package.json ./
# COPY api/yarn.lock ./
# COPY packages ./

COPY . .

RUN yarn install \
    && cd api \
    && yarn run build

######################
##### PRODUCTION #####
######################

FROM node:18-alpine

WORKDIR /usr/src/app

COPY /api/package.json ./

RUN yarn install

COPY --from=multistage /usr/src/app/api/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]