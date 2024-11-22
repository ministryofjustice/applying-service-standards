FROM node:20-alpine AS base-node

COPY --chown=node:node ./ /home/node/
WORKDIR /home/node/
RUN chmod +x ./bin/app-install.sh


FROM base-node AS dev

ENV NODE_ENV=development

RUN npm i nodemon -g

USER 1000

ENTRYPOINT ["ash", "-c", "/home/node/bin/app-install.sh"]


FROM base-node AS build-prod

ENV NODE_ENV=production

RUN npm i

USER 1000

# Execute NodeJS (not NPM script) to handle SIGTERM and SIGINT signals.
CMD ["node", "./index.js"]
