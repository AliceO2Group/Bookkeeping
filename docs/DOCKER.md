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

### Base command
```sh
$ docker-compose -f docker-compose.yml -f docker-compose.dev.yml 
```

### Starting the development environment
```sh
$ {BASE_COMMAND} up --build
```
