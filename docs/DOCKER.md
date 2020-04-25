# Docker

## Production

### Base command
```sh
$ docker-compose -f docker-compose.yml
```

### Starting the production environment
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
