#
# ---- Base ----
FROM node:16.16.0-alpine3.16 as base

# Create app directory
WORKDIR /usr/src/app

# Expose the port to the Docker instance (not the host!)
EXPOSE 4000

RUN apk add --no-cache \
    bash=5.1.16-r2


#
# ---- Development Dependencies ----
FROM base as developmentdependencies

# Installs Git and packages required for Puppeteer
RUN apk add --no-cache \
    chromium-102.0.5005.173-r0 \
    freetype=2.12.1-r0 \
    freetype-dev=2.12.1-r0 \
    git=2.36.2-r0 \
    harfbuzz=4.3.0-r0 \
    ca-certificates=20220614-r0 \
    ttf-freefont=20120503-r2

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
