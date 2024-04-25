# CDP Self Service Ops

Core delivery platform Self-Service Ops Node.js Backend.

[![Publish](https://github.com/DEFRA/cdp-self-service-ops/actions/workflows/publish.yml/badge.svg)](https://github.com/DEFRA/cdp-self-service-ops/actions/workflows/publish.yml)

[![Integration Tests](https://github.com/DEFRA/cdp-self-service-ops/actions/workflows/integration-tests.yml/badge.svg)](https://github.com/DEFRA/cdp-self-service-ops/actions/workflows/integration-tests.yml)

- [Requirements](#requirements)
  - [Authentication](#authentication)
  - [Node.js](#nodejs)
- [Local development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
    - [Updating dependencies](#updating-dependencies)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
- [API endpoints](#api-endpoints)
- [Calling API endpoints](#calling-api-endpoints)
  - [Postman](#postman)
  - [Curl](#curl)
- [Testing](#testing)
  - [Run individual test](#run-individual-test)
- [Versioning](#versioning)
  - [Auto minor versioning](#auto-minor-versioning)
  - [Major or Patch versioning](#major-or-patch-versioning)
- [Docker](#docker)
  - [Development Image](#development-image)
  - [Production Image](#production-image)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Requirements

### Authentication

For local development you need to provide a GitHub Private Key in the env `GITHUB_API_AUTH_APP_PRIVATE_KEY` that
allows the creation of pull requests against the various Org infrastructure repositories. For further details see the
[Wiki](https://dev.azure.com/defragovuk/DEFRA-CDP/_wiki/wikis/DEFRA-CORE-DELIVERY-PLATFORM/14473/GitHub-API-Authentication-App)

### Node.js

Please install [Node.js](http://nodejs.org/) `>= v20.3.0` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
$ cd cdp-self-service-ops
$ nvm use
```

## Local development

### Setup

Install application dependencies:

```bash
$ npm install
```

### Development

To run the application in `development` mode run:

```bash
$ npm run dev
```

#### Updating dependencies

To update dependencies globally install https://www.npmjs.com/package/npm-check-updates

> Run the script below, run tests, test teh application and commit the altered package.json and package-lock.json files

```bash
ncu -i
```

### Production

To mimic the application running in `production` mode locally run:

```bash
$ npm start
```

### Npm scripts

All available Npm scripts can be seen in [package.json](./package.json)
To view them in your command line run:

```bash
$ npm run
```

## API endpoints

| Endpoint                                              | Description                             |
| :---------------------------------------------------- | :-------------------------------------- |
| `GET: /health`                                        | Health                                  |
| `POST: /create-service`                               | Create a service                        |
| `POST: /deploy-service`                               | Deploy a service                        |
| `GET: /deploy-service/options`                        | Deploy a service memory and cpu options |
| `GET: /deploy-service/info/{environment}/{imageName}` | Deploy a service exisiting service info |

## Calling API endpoints

### Postman

A [Postman](https://www.postman.com/) collection and environment are available for making calls to the Self Service Ops
API. Simply import the collection and environment into Postman.

- [Self Service Ops Postman Collection](postman/self-service-ops.postman_collection.json)
- [Self Service Ops Postman Environment](postman/self-service-ops.postman_environment.json)

### Curl

Deploy a service:

```bash
curl -H "Content-type: application/json" -d '{"imageName": "foo-frontend", "version": "v0.1.0", "environment": "snd",
 "cpu": 1024, "memory": 2048, "instanceCount": 1}' 'http://localhost:3009/cdp-self-service-ops/deploy-service'
```

Create a service:

```bash
curl -H "Content-type: application/json" -d '{"repositoryName": "foo-backend", "serviceType": "cdp-node-backend-template", "owningTeam": "fisheries"}' 'http://localhost:3009/cdp-self-service-ops/create-service'
```

Retrieve current deployment config for a service in an environment:

```bash
curl 'http://localhost:3009/cdp-self-service-ops/deploy-service/info/snd/service-name'
```

Retrieve the allowed cpu and memory configurations

```bash
curl 'http://localhost:3009/cdp-self-service-ops/deploy-service/options'
```

## Testing

### Run individual test

To run one test in your cli:

```bash
$ npm test -t <test-path-and-filename>
```

## Versioning

### Auto minor versioning

The [deploy GitHub Actions workflow](./.github/workflows/publish.yml) auto versions a Pull Requests code with a `minor`
version once it has been merged into the `main` branch.
All you have to do is commit your code and raise a Pull Request and the pipeline will auto version your code for you.

### Major or Patch versioning

If you wish to `patch` or `major` version your codebase use:

```bash
$ npm version <patch|major>
```

Then:

- Push this code with the auto generated commit to your GitHub Repository
- Raise a Pull Request
- Merge your code into the `main` branch
- The [deploy GitHub Actions workflow](./.github/workflows/deploy.yml) will tag and push your `major` or `patch`
  version tags to your GitHub Repository
- The [deploy GitHub Actions workflow](./.github/workflows/deploy.yml) will release your `major` or `patch`
  versioned code

## Docker

Build:

```bash
docker build --no-cache --tag cdp-self-service-ops .
```

Run:

```bash
$ docker run -p 3009:3009 cdp-self-service-ops
```

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
