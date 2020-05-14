#
# ---- Base ----
FROM node:12.16.3-alpine as base

# Create app directory
WORKDIR /usr/src/app

# Expose the port to the Docker instance (not the host!)
EXPOSE 4000

RUN apk add --no-cache \
    bash=5.0.11-r1


#
# ---- Package ----
FROM base as package

# Copy package.json and package-lock.json to the container
COPY package*.json ./


#
# ---- Development Dependencies ----
FROM package as developmentDependencies

# Installs Git and packages required for Puppeteer
RUN apk add --no-cache \
    chromium=81.0.4044.113-r0 \
    nss=3.48-r0 \
    freetype=2.10.1-r0 \
    freetype-dev=2.10.1-r0 \
    git=2.24.3-r0 \
    harfbuzz=2.6.4-r0 \
    ca-certificates=20191127-r1 \
    ttf-freefont=20120503-r1

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Installs modules from package-lock.json, this ensures reproducible build
RUN npm --silent ci


#
# ---- Development ----
FROM developmentDependencies as development

# Run start script as specified in package.json
CMD [ "/opt/wait-for-it.sh", "-t", "0", "database:3306", "--", "npm", "run", "start:dev" ]


#
# ---- Test ----
FROM developmentDependencies as test

# Run start script as specified in package.json
CMD [ "/opt/wait-for-it.sh", "-t", "0", "database:3306", "--", "npm", "run", "coverage" ]


#
# ---- Production Dependencies ----
FROM package as productionDependencies

# Installs modules from package-lock.json, this ensures reproducible build
RUN npm --silent ci --production

# Copy all files, except those ignored by .dockerignore, to the container
COPY . .


#
# ---- Production ----
FROM productionDependencies as production

# Run start script as specified in package.json
CMD [ "/opt/wait-for-it.sh", "-t", "0", "database:3306", "--", "node", "lib/main.js" ]
