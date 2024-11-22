# Create a NodeJS base image with the codebase.
# The image is used for development and production.
FROM node:20-alpine AS base-node

# Set the environment to development, as we will install
# npm development dependencies in both child images.
ENV NODE_ENV=development

# Copy the project's files - some are ignored by .dockerignore
COPY --chown=node:node ./ /home/node/

# Make a node_modules directory, and set the owner to node.
RUN mkdir -p /home/node/node_modules && \
    chown -R node:node /home/node

# Set the working directory to the home directory.
WORKDIR /home/node/


# Create a development image, from the base image.
# The image is used for local development only.
FROM base-node AS dev

# Install nodemon globally - for watching file changes.
RUN npm i nodemon -g

RUN chmod +x ./bin/app-install.sh

USER 1000

ENTRYPOINT ["ash", "-c", "/home/node/bin/app-install.sh"]


# Create a production image, from the base image.
# The image is used for deployment, and can be run locally.
FROM base-node AS build-prod

RUN npm ci && \
    # Run the gulp build script
    npm run build && \
    # Remove dev dependencies
    npm prune --production

# Change the environment to production for runtime.
ENV NODE_ENV=production

USER 1000

# Execute NodeJS (not NPM script) to handle SIGTERM and SIGINT signals.
CMD ["node", "./index.js"]
