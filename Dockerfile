#
# ---- Base ----
FROM node:18-alpine3.18 as base

# Create app directory
WORKDIR /usr/src/app

# Expose the port to the Docker instance (not the host!)
EXPOSE 4000

RUN apk add --no-cache \
    bash=5.2.15-r5


#
# ---- Development Dependencies ----
FROM base as developmentdependencies

# Copy all files, except those ignored by .dockerignore, to the container
COPY . .

# Installs modules from package-lock.json, this ensures reproducible build
RUN npm ci --verbose

#
# ---- Development ----
FROM developmentdependencies as development

# Run start script as specified in package.json
CMD [ "/opt/wait-for-it.sh", "-t", "0", "database:3306", "--", "npm", "run", "start:dev" ]


#
# ---- Test ----
FROM developmentdependencies as test

# Installs Git and packages required for Puppeteer
# https://pkgs.alpinelinux.org/packages
RUN apk add --no-cache \
    chromium=119.0.6045.159-r0 \
    freetype=2.13.0-r5 \
    freetype-dev=2.13.0-r5 \
    git=2.40.1-r0 \
    harfbuzz=7.3.0-r0 \
    ca-certificates=20240226-r0

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Run start script as specified in package.json
CMD [ "/opt/wait-for-it.sh", "-t", "0", "database:3306", "--", "npm", "run", "test" ]

#
# ---- Test parallel for CI ----
FROM developmentdependencies as test_parallel

# Set ARG and ENV for TEST_TYPE
ARG TEST_TYPE
ENV TEST_TYPE=${TEST_TYPE}

CMD [ "sh", "-c", "/opt/wait-for-it.sh -t 0 test_db:3306 -- npm run test:subset" ]

#
# ---- Coverage ----
FROM developmentdependencies as coverage

# Run start script as specified in package.json
CMD [ "/opt/wait-for-it.sh", "-t", "0", "database:3306", "--", "npm", "run", "coverage" ]


#
# ---- Production Dependencies ----
FROM base as productiondependencies

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Installs modules from package-lock.json, this ensures reproducible build
RUN npm --silent ci --production

# Copy all files, except those ignored by .dockerignore, to the container
COPY ./lib ./lib


#
# ---- Production ----
FROM productiondependencies as production

# Run start script as specified in package.json
CMD [ "/opt/wait-for-it.sh", "-t", "0", "database:3306", "--", "node", "lib/main.js" ]
