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

## Commit naming convention
We use the [`Conventional Commits`](https://www.conventionalcommits.org/en/v1.0.0/) format, which is a specification for adding human and machine readable meaning to commit messages.

## Versioning

example: ```R.Arsenic.sp1.v0.0.1```

Format:
- ```R.``` (release)
- ```Arsenic.``` (team name)
- ```sp1.``` (sprint 1)
- ```v0.0.1``` (version major, minor, patch)

## Changelog generation
The `CHANGELOG.md` is generated using the [Standard CHANGELOG](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/standard-changelog) package, an opinionated approach to CHANGELOG generation using angular commit conventions.

```sh
$ npx standard-changelog
```
