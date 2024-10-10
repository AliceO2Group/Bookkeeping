# Parallel testing

## Prerequisites

Parallel testing requires the following programs to run:
- docker ([documentation](https://docs.docker.com/engine/install/))
- npm, which is bundled with nodejs ([download](https://nodejs.org/en/download/))

# How it works
Parallel testing is implemented to decrease the time it takes to run all test suites by distributing them across multiple Docker containers.
the `child_process` module of Node.js is used to spawn worker processes. Each worker process is responsible for running a portion of the test suites.
The main.js script begins by building a Docker image using the Docker Compose files. This image is then tagged for use by the worker containers.
Before starting the workers, any existing test logs are cleaned up to ensure a fresh environment for the new test runs. 

Workers are spawned based on the predefined number set in the variable `amountOfWorkers` in main.js. Each worker is a Node.js process created using the fork() method from the child_process module.
These workers are isolated in that they can execute independently and in parallel, each in their own Docker container.

Each worker initially requests a test suite to execute from the testSuites stack. Once a worker completes a test suite, it requests the next available suite from the stack.
This continues until there are no more test suites left to assign in the stack, at which point the worker will shut down.

Inside each worker, the test-runner.js script handles the execution of the test suites. This script is responsible for reaching the target in the Dockerfile which will initiate a test run based on the `TEST_TYPE` given by main.js.
Custom logging and results handling are implemented using a custom Mocha reporter (custom-mocha-reporter.js). This reporter logs the results of the test executions into separate files.
These log files are then used to create the final result output.



# How to configure
All configuration can be done in main.js:
1. Set amountOfWorkers to as many as your system can handle (default is 3)
2. Make sure the testSuites stack in main.js is populated with all necessary suites
3. Run the tests in parallel

# How to run
After configuring everything, simply run:
```sh
npm run docker-test:parallel
```
The amount of workers can also be set using the environment variable WORKERS:
```sh
WORKERS=5 npm run docker-test:parallel
```
And the path where the result logs are stored can also be set:
```sh
STORAGE_PATH='./path/of/choice' npm run docker-test:parallel
```

## Docker configuration files

### Docker Compose files

There are two Docker Compose files used in this setup:

1. `docker-compose.test-parallel-base.yml` - Sets up the base testing environment including the application and database services.
2. `docker-compose.test-parallel-local.yml` - Configures the test-specific settings like image and target.

### Dockerfile

The `Dockerfile` is structured in multiple stages:

- **Base:** Sets up the Node.js environment.
- **Development Dependencies:** Installs tools and libraries required for testing.
- **Test Parallel Local:** Runs the command to execute a subset of tests.

## Testing scripts

### npm command

- **test:subset-local**: Executes the Mocha test runner for a subset of tests specified by the `TEST_TYPE` environment variable, and uses the custom-mocha-reporter to create logs which are used in the Node.js scripts.

### Node.js scripts

- **main.js**: Handles the initialization and distribution of tests across multiple worker processes.
- **test-runner.js**: Manages the execution of tests for a given subset, handling the Docker commands and environment setup.
- **custom-mocha-reporter.js**: A custom Mocha reporter that logs test results into separate files which are used in main.js to create the final result output.

### Test suites
For every test suite that needs to be ran by one of the workers, a script is provided in the test/scripts directory named test-suiteName. The suite name is given by the Node.js scripts and used in the npm command.
