#
# ---- Base ----
FROM node:22-alpine3.20 as base

# Create app directory
WORKDIR /usr/src/app

# Expose the port to the Docker instance (not the host!)
EXPOSE 4000

RUN apk add --no-cache \
    bash=5.2.26-r0

#
# ---- Development Dependencies ----
FROM base AS developmentdependencies

# Installs Git and packages required for Puppeteer
# https://pkgs.alpinelinux.org/packages
RUN apk add --no-cache \
    chromium=131.0.6778.108-r0 \
    freetype=2.13.2-r0 \
    freetype-dev=2.13.2-r0 \
    harfbuzz=8.5.0-r0 \
    ca-certificates=20241121-r1

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy all files, except those ignored by .dockerignore, to the container
COPY . .

# Installs modules from package-lock.json if there are changes, this ensures reproducible build
RUN npm install

#
# ---- Development ----
FROM developmentdependencies AS development

# Run start script as specified in package.json
CMD [ "npm", "run", "start:dev" ]

#
# ---- Test ----
FROM developmentdependencies AS test

# Run start script as specified in package.json
CMD [ "npm", "run", "test" ]

#
# ---- Test parallel for CI ----
FROM developmentdependencies AS test_parallel_ci

CMD [ "npm", "run", "test:subset" ]

#
# ---- Test parallel local ----
FROM developmentdependencies AS test_parallel_local

CMD [ "npm", "run", "test:subset-local" ]

#
# ---- Coverage ----
FROM developmentdependencies AS coverage

# Run start script as specified in package.json
CMD [ "npm", "run", "coverage" ]

#
# ---- Production Dependencies ----
FROM base AS productiondependencies

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Installs modules from package-lock.json, this ensures reproducible build
RUN npm --silent ci --production

# Copy all files, except those ignored by .dockerignore, to the container
COPY ./lib ./lib

#
# ---- Production ----
FROM productiondependencies AS production

# Run start script as specified in package.json
CMD [ "node", "lib/main.js" ]
