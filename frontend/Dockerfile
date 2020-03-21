#
# ---- Base ----
FROM node:12.16.1 as base

# Create app directory
WORKDIR /usr/src/app

# Expose the port to the Docker instance (not the host!)
EXPOSE 3000


#
# ---- Development ----
FROM base as development

# Run start script as specified in package.json
CMD [ "npm", "run", "start:dev" ]


#
# ---- Dependency ----
FROM base as dependencies

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Installs modules from package-lock.json, this ensures reproducible build
RUN npm --silent ci


#
# ---- Build ----
FROM dependencies as build

# Copy all files, except those ignored by .dockerignore, to the container
COPY . .


#
# ---- Release ----
FROM build as production

# Run start script as specified in package.json
CMD [ "node", "run", "start:prod" ]
