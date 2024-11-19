import { MongoClient } from 'mongodb'
import timeunit from 'timeunit'
import { setTimeout } from 'timers/promises'

import { config } from '~/src/config/index.js'
import { createIndexes } from '~/src/plugins/mongodb.js'
import {
  ackEvent,
  findAll,
  getNextQueuedEvent,
  queueEvent
} from '~/src/helpers/queued-events/queued-events.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

const eventType = config.get('serviceInfraCreateEvent')
const logger = createLogger()
let connection
let db

beforeEach(async () => {
  await db.collection('queue-events').deleteMany({})
})

beforeAll(async () => {
  connection = await MongoClient.connect(globalThis.__MONGO_URI__, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  db = await connection.db(globalThis.__MONGO_DB_NAME__)
  await createIndexes(db)
})

afterAll(async () => {
  await connection.close()
})

describe('#queueEvent', () => {
  test('Should queue events', async () => {
    const repositoryName = crypto.randomUUID()

    await queueEvent(db, repositoryName, eventType, { zone: 'public' }, logger)

    const events = await findAll(db, { repositoryName, eventType })

    expect(events).toMatchObject([
      { eventType, repositoryName, status: 'queued' }
    ])
  })

  test('Should not queue duplicate events', async () => {
    const repositoryName = crypto.randomUUID()
    await queueEvent(db, repositoryName, eventType, { zone: 'public' }, logger)
    await queueEvent(db, 'repository', eventType, { zone: 'public' }, logger)

    const events = await findAll(db, { repositoryName, eventType })

    expect(events).toMatchObject([
      {
        eventType,
        repositoryName,
        status: 'queued'
      }
    ])
  })
})

describe('#getNextQueuedEvent', () => {
  test('should retrieve the oldest ', async () => {
    const repositoryName = crypto.randomUUID()

    await queueEvent(db, repositoryName, eventType, { zone: 'public' }, logger)
    await queueEvent(
      db,
      crypto.randomUUID(),
      eventType,
      { zone: 'public' },
      logger
    )
    await queueEvent(
      db,
      crypto.randomUUID(),
      eventType,
      { zone: 'public' },
      logger
    )

    const event = await getNextQueuedEvent(db, eventType, logger)

    expect(event).toMatchObject({
      eventType,
      repositoryName,
      status: 'processing',
      retryCount: 1
    })
  })
  test('should not return an event if one is currently being processed', async () => {
    const repositoryName = crypto.randomUUID()

    await queueEvent(db, repositoryName, eventType, { zone: 'public' }, logger)
    await queueEvent(
      db,
      crypto.randomUUID(),
      eventType,
      { zone: 'public' },
      logger
    )

    const event = await getNextQueuedEvent(db, eventType, logger)
    const event2 = await getNextQueuedEvent(db, eventType, logger)

    expect(event).toMatchObject({
      eventType,
      repositoryName,
      status: 'processing',
      retryCount: 1
    })

    expect(event2).toBeUndefined()
  })
  test('should return same event and increment retryCount if ttl has expired', async () => {
    const repositoryName = crypto.randomUUID()
    await queueEvent(db, repositoryName, eventType, { zone: 'public' })

    const event = await getNextQueuedEvent(db, eventType, logger, 5, 3)

    await setTimeout(50)
    const event2 = await getNextQueuedEvent(db, eventType, logger, 5, 3)
    await setTimeout(50)
    const event3 = await getNextQueuedEvent(db, eventType, logger, 5, 3)

    expect(event).toMatchObject({
      eventType,
      repositoryName,
      status: 'processing',
      retryCount: 1
    })
    expect(event2).toMatchObject({
      eventType,
      repositoryName,
      status: 'processing',
      retryCount: 2
    })
    expect(event3).toMatchObject({
      eventType,
      repositoryName,
      status: 'processing',
      retryCount: 3
    })
  })
  test('should return next event if retryCount has been reached (maxRetries 1 means we try twice)', async () => {
    const repository1 = crypto.randomUUID()
    await queueEvent(db, repository1, eventType, { zone: 'public' }, logger)
    const repository2 = crypto.randomUUID()
    await queueEvent(db, repository2, eventType, { zone: 'public' }, logger)

    const event = await getNextQueuedEvent(db, eventType, logger, 5, 1)
    await setTimeout(50)
    const event2 = await getNextQueuedEvent(db, eventType, logger, 5, 1)
    await setTimeout(50)
    const event3 = await getNextQueuedEvent(db, eventType, logger, 5, 1)

    const maxRetriedEvent = await findAll(db, {
      repositoryName: repository1,
      eventType
    })

    expect(event).toMatchObject({
      eventType,
      repositoryName: repository1,
      status: 'processing',
      retryCount: 1
    })
    expect(event2).toMatchObject({
      eventType,
      repositoryName: repository1,
      status: 'processing',
      retryCount: 2
    })
    expect(maxRetriedEvent).toMatchObject([
      {
        eventType,
        repositoryName: repository1,
        status: 'processing',
        retryCount: 2,
        message: 'Max retry count reached - event will not be processed'
      }
    ])

    expect(event3).toMatchObject({
      eventType,
      repositoryName: repository2,
      status: 'processing',
      retryCount: 1
    })
  })
})
describe('#ackEvent', () => {
  test('should mark acknowledged event as processed', async () => {
    const repository1 = crypto.randomUUID()
    await queueEvent(db, repository1, eventType, { zone: 'public' }, logger)
    const repository2 = crypto.randomUUID()
    await queueEvent(db, repository2, eventType, { zone: 'public' }, logger)

    const event1 = await getNextQueuedEvent(
      db,
      eventType,
      logger,
      timeunit.minutes.toMillis(5),
      3
    )

    const event1Ack = await ackEvent(db, repository1, eventType)

    const event2 = await getNextQueuedEvent(
      db,
      eventType,
      logger,
      timeunit.minutes.toMillis(5),
      3
    )
    expect(event1).toMatchObject({
      eventType,
      repositoryName: repository1,
      status: 'processing',
      retryCount: 1
    })
    expect(event1Ack).toMatchObject({
      eventType,
      repositoryName: repository1,
      status: 'processed',
      retryCount: 1
    })
    expect(event1Ack?.lockId).toBeUndefined()
    expect(event1Ack?.lockTimestamp).toBeUndefined()

    expect(event2).toMatchObject({
      eventType,
      repositoryName: repository2,
      status: 'processing',
      retryCount: 1
    })
  })
  test('should return next event if previous event is acknowledged before dequeued', async () => {
    const repository1 = crypto.randomUUID()
    await queueEvent(db, repository1, eventType, { zone: 'public' }, logger)
    const repository2 = crypto.randomUUID()
    await queueEvent(db, repository2, eventType, { zone: 'public' }, logger)

    await ackEvent(db, repository1, eventType)

    const event2 = await getNextQueuedEvent(
      db,
      eventType,
      logger,
      timeunit.minutes.toMillis(5),
      3
    )
    expect(event2).toMatchObject({
      eventType,
      repositoryName: repository2,
      status: 'processing',
      retryCount: 1
    })
  })
  test('should return nothing if all events are acknowledged', async () => {
    const repository1 = crypto.randomUUID()
    await queueEvent(db, repository1, eventType, { zone: 'public' }, logger)
    const repository2 = crypto.randomUUID()
    await queueEvent(db, repository2, eventType, { zone: 'public' }, logger)

    const event1 = await ackEvent(db, repository1, eventType)
    const event2 = await ackEvent(db, repository2, eventType)
    const event3 = await getNextQueuedEvent(
      db,
      eventType,
      logger,
      timeunit.minutes.toMillis(5),
      3
    )

    expect(event1).toMatchObject({
      eventType,
      repositoryName: repository1,
      status: 'processed',
      retryCount: 0
    })
    expect(event2).toMatchObject({
      eventType,
      repositoryName: repository2,
      status: 'processed',
      retryCount: 0
    })
    expect(event3).toBeNull()
  })
})
