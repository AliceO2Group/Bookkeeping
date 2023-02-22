# Getting started

## Prerequisite

Local development requires the following programs to run:
- docker ([documentation](https://docs.docker.com/engine/install/))
- npm, which is bundled with nodejs ([download](https://nodejs.org/en/download/))

For recent versions of docker, `docker-compose` utility is now part of docker (in `docker compose`). 
For compatibility reasons, create an alias or a script that aliases `docker-compose` to `docker compose`.

## Installation

Clone the bookeeping project

```sh
git clone git@github.com:AliceO2Group/Bookkeeping.git
cd Bookkeeping
```

## Run the docker stack

Use the npm script (the `docker-compose` command must be available to npm)

```sh
npm run docker-run
```

You will then see in this tabs the server's log

### Run seeders

For the first time, database can be feed with fake data. To do so:

Wait until you see the log

```
[DATABASE] info: Executed pending migrations
```

Then you can run seeders to populate your database

```sh
docker-compose exec application npm run sequelize -- db:seed:all
```

### You are ready

You can now open the app at [http://localhost:4000](http://localhost:4000)
