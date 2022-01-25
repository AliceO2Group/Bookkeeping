# Docker

## Windows Subsystem for Linux
Note that there are some issue with version 2 of Windows Subsystem for Linux, so be aware. Especially the development environment has some issue due to file changes not always triggering an event inside the container.

## Unsatisfiable constraints
For achieving consistent builds, the dependencies you rely on must be pinned down to a specific version. Why is that? If you don't pin down version numbers, your images are dependent on the point of time when they are built. When package maintainers decide to release a new version, it will be automatically installed as soon as you rebuild your image the next time. Unfortunately Alpine Linux does not keep old packages. Thus from time to time GitHub Actions or the staging server will not built/update as the dependency (or dependencies) at that specific version cannot be found in the repository. To solve this read the error output and update the `Dockerfile` to match the newer version.

```
Step 6/15 : RUN apk add --no-cache chromium=86.0.4240.111-r0
 ---> Running in 732bc1a77c88
fetch http://dl-cdn.alpinelinux.org/alpine/v3.12/main/x86_64/APKINDEX.tar.gz
fetch http://dl-cdn.alpinelinux.org/alpine/v3.12/community/x86_64/APKINDEX.tar.gz
ERROR: unsatisfiable constraints:
  chromium-83.0.4103.116-r0:
    breaks: world[chromium=86.0.4240.111-r0]
Service 'application' failed to build: The command '/bin/sh -c apk add --no-cache chromium=86.0.4240.111-r0' returned a non-zero code: 1
##[error]Process completed with exit code 1.
```

## Production

### Base command
```sh
$ docker-compose -f docker-compose.yml
```

### Starting the production environment
```sh
$ {BASE_COMMAND} up --build
```

## Staging
The `docker-compose.staging.yml` is designed to be used in a staging environment.

### Base command
```sh
$ docker-compose -f docker-compose.yml -f docker-compose.staging.yml
```

### Starting the staging environment
```sh
$ {BASE_COMMAND} up --build
```

## Development
The `docker-compose.dev.yml` is designed to be used during development.

### Base command
```sh
$ docker-compose -f docker-compose.yml -f docker-compose.dev.yml
```

### Starting the development environment
```sh
$ {BASE_COMMAND} up --build
```

## Test
The `docker-compose.test.yml` is designed to include everything that is necessary to test the application.

### Base command
```sh
$ docker-compose -f docker-compose.yml -f docker-compose.test.yml
```

### Execute the test suite
```sh
$ {BASE_COMMAND} up --build --abort-on-container-exit
```
