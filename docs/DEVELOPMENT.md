# Development

## Getting started
### Configuration
The following `.env` configuration is the bare minimum required for development. It must be placed in the top dir. 
```ini
; Database
MYSQL_ROOT_PASSWORD=cern
OPENID_ID=
OPENID_SECRET=
OPENID_REDIRECT=

JWT_SECRET=

ATTACHMENT_PATH=/var/storage
```

On mac, the file database/configuration/my.cnf must be modified to set this variable to 1 : 
```
lower_case_table_names=1
```

### Running

Execute `npm run docker-run` to launch the application. Once it is running, go to [localhost:4000](localhost:4000).

## Sequlize (CLI)

In order to run those commands locally, you can either install `sequelize-cli` globally or simply run `npm i`.

### Usage
```sh
$ npx sequelize-cli [command]
```

### Show help
```sh
$ npx sequelize-cli --help
```

### Generates a new migration file
```sh
$ npx sequelize-cli migration:generate --name <MIGRATION_FILE_NAME>
```

### Run pending migrations
```sh
$ npx sequelize-cli db:migrate
```

### Generates a new seed file
```sh
$ npx sequelize-cli seed:generate --name <SEEDER_FILE_NAME>
```

### Run every seeder
```sh
$ npx sequelize-cli db:seed:all
```
