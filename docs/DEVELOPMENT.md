# Development

## Sequlize (CLI)

### Usage
```sh
$ npm run sequelize -- [command]
```

### Show help
```sh
$ npm run sequelize -- --help
```

### Generates a new migration file
```sh
$ npm run sequelize -- migration:generate --name <MIGRATION NAME>
```

### Run pending migrations
```sh
$ npm run sequelize -- db:migrate
```

### Generates a new seed file
```sh
$ npm run sequelize -- seed:generate --name <MIGRATION NAME>
```

### Run every seeder
```sh
$ npm run sequelize -- db:seed:all
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
