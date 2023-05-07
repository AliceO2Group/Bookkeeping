#
# ---- Base ----
FROM node:18-alpine3.17 as base

# Create app directory
WORKDIR /usr/src/app

# Expose the port to the Docker instance (not the host!)
EXPOSE 4000

RUN apk add --no-cache \
    bash=5.2.15-r0


#
# ---- Development Dependencies ----
FROM base as developmentdependencies

# Installs Git and packages required for Puppeteer
# https://pkgs.alpinelinux.org/packages
RUN apk add --no-cache \
    chromium=112.0.5615.165-r0 \
    freetype=2.12.1-r0 \
    freetype-dev=2.12.1-r0 \
    git=2.38.5-r0 \
    harfbuzz=5.3.1-r1 \
    ca-certificates=20230506-r0 \
    ttf-freefont=20120503-r3

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Installs modules from package-lock.json, this ensures reproducible build
RUN npm --silent ci

# Copy all files, except those ignored by .dockerignore, to the container
COPY . .


#
# ---- Development ----
FROM developmentdependencies as development

# Run start script as specified in package.json
CMD [ "/opt/wait-for-it.sh", "-t", "0", "database:3306", "--", "npm", "run", "start:dev" ]


#
# ---- Test ----
FROM developmentdependencies as test

# Run start script as specified in package.json
CMD [ "/opt/wait-for-it.sh", "-t", "0", "database:3306", "--", "npm", "run", "test" ]

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
