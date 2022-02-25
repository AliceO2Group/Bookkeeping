# Development

## Getting started
### Configuration
The following `.env` configuration is the bare minimum required for development. At the moment of writing there are two OpenID configurations, one dedicated to the staging server and one for all developers to use for local development.
```ini
; Database
MYSQL_ROOT_PASSWORD=<TODO>

; JWT
JWT_SECRET=<TODO>

; OpenID
OPENID_ID=<TODO>
OPENID_SECRET=<TODO>
OPENID_REDIRECT=http://localhost:4000/callback

ATTACHMENT_PATH='/var/storage'
```

## Sequlize (CLI)

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
$ npx sequelize-cli migration:generate --name <MIGRATION NAME>
```

### Run pending migrations
```sh
$ npx sequelize-cli db:migrate
```

### Generates a new seed file
```sh
$ npx sequelize-cli seed:generate --name <MIGRATION NAME>
```

### Run every seeder
```sh
$ npx sequelize-cli db:seed:all
```

## Versioning

example: ```R.Arsenic.sp1.v0.0.1```

Format:
- ```R.``` (release)
- ```Arsenic.``` (team name)
- ```sp1.``` (sprint 1)
- ```v0.0.1``` (version major, minor, patch)

## Creating a new release
Executing the following command will update the package(-lock).json, update the CHANGELOG.md and create a Git tag.
```sh
$ npx standard-version --release-as X.Y.Z
```

## Updating (transitive) dependencies
```sh
rm node_modules/ -rf && npm update && git add package-lock.json && git commit -m "chore(deps): bump transitive dependency versions"
rm node_modules/ -rf && npm update -D && git add package-lock.json && git commit -m "chore(deps-dev): bump transitive dependency versions"
```
