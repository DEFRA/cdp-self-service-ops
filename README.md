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
  º- [Licence](#licence)
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

#### To run locally with docker images

To run the application alongside `cdp-local-environment` docker images,
you need to include env vars from `cdp-local-environment` files e.g:

```
AWS_ACCESS_KEY_ID=test
AWS_REGION=eu-west-2
AWS_SECRET_ACCESS_KEY=test
AWS_SECRET_KEY=test
GITHUB_BASE_URL=http://localhost:3939
SQS_GITHUB_QUEUE=http://localhost:4566/000000000000/github-events
USER_SERVICE_BACKEND_URL=http:/localhost:3001
PORTAL_BACKEND_URL=http://localhost:5094
OIDC_WELL_KNOWN_CONFIGURATION_URL=http://cdp.127.0.0.1.sslip.io:3939/63983fc2-cfff-45bb-8ec2-959e21062b9a/v2.0/.well-known/openid-configuration
```

#### Updating dependencies

To update dependencies, globally install https://www.npmjs.com/package/npm-check-updates. Then run the below script,
run tests, test the application and commit the altered `package.json` and `package-lock.json` files. For more
options around updates check the package docs.

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

## Troubleshooting queued events

| Endpoint                                         | Description                                              |
| :----------------------------------------------- | :------------------------------------------------------- |
| `GET: /queued-events`                            | query queued events                                      |
| `PATCH: /queued-events/eventType/repositoryName` | Reset an event and trigger create service infra listener |

### GET /queued-events

| Optional query parameters | Description                                                                            |
| :------------------------ | :------------------------------------------------------------------------------------- |
| `eventType`               | Restrict the eventType in response. Currently only `service.infra.create` is supported |
| `repositoryName`          | Restrict response to a specific repository                                             |
| `includeProcessed`        | Return results that are processed in response (these are not returned by default)      |

#### Curl

`service.infra.create` events:

```bash
curl --location 'localhost:3009/queued-events?eventType=service.infra.create'
```

Specific repository:

```bash
curl --location 'localhost:3009/queued-events?repositoryName=my-service&eventType=service.infra.create'
```

Include processed events:

```bash
curl --location 'localhost:3009/queued-events?eventType=service.infra.create&includeProcessed=true'
```

### PATCH /queued-events/eventType/repositoryName

#### Curl

```bash
curl --location --request PATCH 'localhost:3009/queued-events/service.infra.create/my-service'
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
- The [GitHub Actions workflow](./.github/workflows/publish.yml) will tag and push your `major` or `patch`
  version tags to your GitHub Repository and release your `major` or `patch` versioned code

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
