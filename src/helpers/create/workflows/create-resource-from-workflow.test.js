import { MongoClient } from 'mongodb'

import { createLogger } from '~/src/helpers/logging/logger.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'
import { createResourceFromWorkflow } from '~/src/helpers/create/workflows/create-resource-from-workflow.js'
import { initCreationStatus } from '~/src/helpers/create/init-creation-status.js'
import { creations } from '~/src/constants/creations.js'
import { statuses } from '~/src/constants/statuses.js'

const logger = createLogger()
let connection
let db

beforeEach(async () => {
  await db.collection('status').deleteMany({})
})

beforeAll(async () => {
  connection = await MongoClient.connect(globalThis.__MONGO_URI__, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  db = connection.db(globalThis.__MONGO_DB_NAME__)
})

afterAll(async () => {
  await connection.close()
})

jest.mock('~/src/helpers/github/trigger-workflow')

describe('#createResourceFromWorkflow', () => {
  test('Should create a resource', async () => {
    triggerWorkflow.mockResolvedValue({})
    const request = {
      db,
      logger
    }
    const org = 'ORG'
    const serviceName = 'foo'
    const workflowRepo = 'cdp-test-workflows'
    await initCreationStatus(
      db,
      org,
      creations.microservice,
      serviceName,
      '',
      'public',
      { teamId: '1', name: 'team1' },
      { id: '1', displayName: 'user' },
      [workflowRepo]
    )

    await createResourceFromWorkflow(
      request,
      'foo',
      org,
      workflowRepo,
      'create-foo.yml',
      { foo: 'bar' }
    )

    const status = await db
      .collection('status')
      .findOne({ repositoryName: serviceName })

    expect(status[workflowRepo].status).toEqual(statuses.requested)
  })
})
