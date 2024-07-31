# B. :telescope: I want to use Bookkeeping and connect it to other systems already deployed
## Getting started

Below instructions, are provided for those who would like to deploy and setup Bookkeeping on its own. For this, you will need:
- npm, which is bundled with nodejs ([download](https://nodejs.org/en/download/))
- mariaDB ([download](https://mariadb.org/download/))
### Configuration

The following `.env` configuration is the bare minimum required for setup. It must be placed in the top dir. 
```ini
; Database
MYSQL_ROOT_PASSWORD=cern
OPENID_ID=
OPENID_SECRET=
OPENID_REDIRECT=

JWT_SECRET=

ATTACHMENT_PATH=/var/storage

NOTIFICATION_BROKER=
```

On mac, the file `database/configuration/my.cnf` must be modified to set this variable to `1`: 
```
lower_case_table_names=1
```

### Running

Execute `npm run start:prod` to launch the application. Once it is running, go to [localhost:4000](localhost:4000).

## Sequlize (CLI)
Bookkeeping uses **sequalize** to migrate schemas from one version of Bookkeeping to another. It is also used for seed data into the existing database setup.
In order to run below commands locally, you can either install `sequelize-cli` globally or simply run `npm ci`.

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
