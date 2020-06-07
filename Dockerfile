#
# ---- Base ----
FROM node:12.18.0-alpine3.11 as base

# Create app directory
WORKDIR /usr/src/app

# Expose the port to the Docker instance (not the host!)
EXPOSE 4000

RUN apk add --no-cache \
    bash=5.0.11-r1


#
# ---- Development Dependencies ----
FROM base as developmentDependencies

# Installs Git and packages required for Puppeteer
RUN apk add --no-cache \
    alpine-baselayout=3.2.0-r3 \
    alpine-keys=2.1-r2 \
    alsa-lib=1.2.1.2-r0 \
    apk-tools=2.10.5-r0 \
    at-spi2-atk=2.34.1-r0 \
    at-spi2-core=2.34.0-r0 \
    atk=2.34.1-r0 \
    avahi-libs=0.7-r4 \
    busybox=1.31.1-r9 \
    ca-certificates=20191127-r2 \
    ca-certificates-cacert=20191127-r2 \
    cairo=1.16.0-r2 \
    cairo-gobject=1.16.0-r2 \
    chromium=81.0.4044.113-r0 \
    cups-libs=2.2.12-r1 \
    dbus-libs=1.12.16-r3 \
    encodings=1.0.5-r0 \
    eudev-libs=3.2.9-r1 \
    expat=2.2.9-r1 \
    ffmpeg-libs=4.2.1-r3 \
    flac=1.3.3-r0 \
    fontconfig=2.13.1-r2 \
    freetype=2.10.1-r0 \
    freetype-dev=2.10.1-r0 \
    fribidi=1.0.8-r0 \
    gdk-pixbuf=2.40.0-r0 \
    git=2.24.3-r0 \
    glib=2.62.6-r0 \
    gmp=6.1.2-r1 \
    gnutls=3.6.10-r1 \
    graphite2=1.3.13-r1 \
    gtk+3.0=3.24.13-r0 \
    gtk-update-icon-cache=2.24.32-r1 \
    harfbuzz=2.6.4-r0 \
    hicolor-icon-theme=0.17-r1 \
    lame=3.100-r0 \
    libass=0.14.0-r0 \
    libblkid=2.34-r1 \
    libbsd=0.10.0-r0 \
    libbz2=1.0.8-r1 \
    libc-utils=0.7.2-r0 \
    libcrypto1.1=1.1.1g-r0 \
    libcurl=7.67.0-r0 \
    libdrm=2.4.100-r0 \
    libepoxy=1.5.4-r0 \
    libevent=2.1.11-r0 \
    libffi=3.2.1-r6 \
    libfontenc=1.1.4-r0 \
    libgcc=9.2.0-r4 \
    libgcrypt=1.8.5-r0 \
    libgpg-error=1.36-r2 \
    libintl=0.20.1-r2 \
    libjpeg-turbo=2.0.4-r0 \
    libmount=2.34-r1 \
    libogg=1.3.4-r0 \
    libpciaccess=0.16-r0 \
    libpng=1.6.37-r1 \
    libpng-dev=1.6.37-r1 \
    libssl1.1=1.1.1g-r0 \
    libstdc++=9.2.0-r4 \
    libtasn1=4.15.0-r0 \
    libtheora=1.1.1-r14 \
    libtls-standalone=2.9.1-r0 \
    libunistring=0.9.10-r0 \
    libuuid=2.34-r1 \
    libva=2.6.0-r0 \
    libvdpau=1.3-r0 \
    libvorbis=1.3.6-r2 \
    libvpx=1.8.1-r0 \
    libwebp=1.0.3-r0 \
    libx11=1.6.9-r0 \
    libxau=1.0.9-r0 \
    libxcb=1.13.1-r0 \
    libxcomposite=0.4.5-r0 \
    libxcursor=1.2.0-r0 \
    libxdamage=1.1.5-r0 \
    libxdmcp=1.1.3-r0 \
    libxext=1.3.4-r0 \
    libxfixes=5.0.3-r2 \
    libxft=2.3.3-r0 \
    libxi=1.7.10-r0 \
    libxinerama=1.1.4-r1 \
    libxkbcommon=0.9.1-r0 \
    libxml2=2.9.10-r3 \
    libxrandr=1.5.2-r0 \
    libxrender=0.9.10-r3 \
    libxscrnsaver=1.2.3-r0 \
    libxslt=1.1.34-r0 \
    libxtst=1.2.3-r3 \
    mesa=19.2.7-r0 \
    mesa-gbm=19.2.7-r0 \
    mkfontscale=1.2.1-r1 \
    musl=1.1.24-r2 \
    musl-utils=1.1.24-r2 \
    ncurses-libs=6.1_p20200118-r4 \
    ncurses-terminfo-base=6.1_p20200118-r4 \
    nettle=3.5.1-r0 \
    nghttp2-libs=1.40.0-r0 \
    nspr=4.24-r0 \
    nss=3.48-r0 \
    opus=1.3.1-r0 \
    p11-kit=0.23.18.1-r0 \
    pango=1.44.7-r0 \
    pcre=8.43-r0 \
    pcre2=10.34-r1 \
    pixman=0.38.4-r0 \
    pkgconf=1.6.3-r0 \
    re2=2019.12.01-r0 \
    readline=8.0.1-r0 \
    scanelf=1.2.4-r0 \
    sdl2=2.0.10-r0 \
    shared-mime-info=1.15-r0 \
    snappy=1.1.7-r1 \
    sqlite-libs=3.30.1-r2 \
    ssl_client=1.31.1-r9 \
    tiff=4.1.0-r0 \
    ttf-freefont=20120503-r1 \
    ttf-opensans=1.10-r0 \
    v4l-utils-libs=1.18.0-r0 \
    wayland-libs-client=1.17.0-r0 \
    wayland-libs-cursor=1.17.0-r0 \
    wayland-libs-egl=1.17.0-r0 \
    wayland-libs-server=1.17.0-r0 \
    x264-libs=20191119-r0 \
    x265-libs=3.2.1-r0 \
    xvidcore=1.3.5-r0 \
    xz-libs=5.2.4-r0 \
    zlib=1.2.11-r3 \
    zlib-dev=1.2.11-r3

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
FROM base as productionDependencies

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Installs modules from package-lock.json, this ensures reproducible build
RUN npm --silent ci --production

# Copy all files, except those ignored by .dockerignore, to the container
COPY ./lib ./lib


#
# ---- Production ----
FROM productionDependencies as production

# Run start script as specified in package.json
CMD [ "/opt/wait-for-it.sh", "-t", "0", "database:3306", "--", "node", "lib/main.js" ]
