FROM node:20-alpine AS base-node

COPY --chown=node:node ./ /home/node/
WORKDIR /home/node/


FROM base-node AS dev

RUN npm i nodemon -g
RUN npm i

USER 1000

ENTRYPOINT ["ash", "-c", "npm run dev"]
