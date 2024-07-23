import timeunit from 'timeunit'

const collectionName = 'queue-events'
const lockId = crypto.randomUUID()

async function queueEvent(db, repositoryName, eventType, item, logger) {
  try {
    return await db.collection(collectionName).insertOne({
      repositoryName,
      eventType,
      item,
      status: 'queued',
      retryCount: 0,
      requestedAt: new Date()
    })
  } catch (error) {
    if (error.code === 11000) {
      logger.error('Event already exists - not queuing')
      return undefined
    }
  }
}

async function getNextQueuedEvent(
  db,
  eventType,
  logger,
  ttlInMillis = timeunit.minutes.toMillis(5),
  maxRetries = 1
) {
  const latestEvent = await db
    .collection(collectionName)
    .findOne({ eventType, status: { $ne: 'processed' } }, null, {
      sort: { requestedAt: 1 }
    })

  const nowMillis = new Date().getTime()
  const lockedOrExpired =
    latestEvent?.lockId &&
    latestEvent?.lockTimestamp?.getTime() &&
    latestEvent.lockTimestamp.getTime() + ttlInMillis >= nowMillis

  if (latestEvent && latestEvent.retryCount > maxRetries) {
    await db.collection(collectionName).findOneAndUpdate(
      {
        repositoryName: latestEvent.repositoryName,
        eventType: latestEvent.eventType
      },
      {
        $set: {
          message: 'Max retry count reached - event will not be processed'
        }
      }
    )
  }

  logger.info(
    latestEvent,
    `latest event was ${lockedOrExpired ? '' : 'not '}'locked or expired'}`
  )

  if (!lockedOrExpired) {
    return await db.collection(collectionName).findOneAndUpdate(
      {
        eventType,
        retryCount: { $lte: maxRetries },
        status: { $ne: 'processed' }
      },
      {
        $inc: { retryCount: 1 },
        $set: { lockId, status: 'processing', lockTimestamp: new Date() }
      },
      {
        upsert: false,
        sort: { requestedAt: 1 },
        returnDocument: 'after'
      }
    )
  }
}

async function ackEvent(db, repositoryName, eventType) {
  return await db.collection(collectionName).findOneAndUpdate(
    {
      repositoryName,
      eventType
    },
    {
      $set: { status: 'processed' },
      $unset: { lockId: '', lockTimestamp: '' }
    },
    { upsert: false, returnDocument: 'after' }
  )
}

async function findAll(db, predicate = {}) {
  return await db.collection(collectionName).find(predicate).toArray()
}

async function resetEvent(db, repositoryName, eventType) {
  return await db.collection(collectionName).findOneAndUpdate(
    {
      eventType,
      repositoryName
    },
    {
      $set: {
        status: 'queued',
        retryCount: 0
      },
      $unset: { lockId: '', lockTimestamp: '' }
    },
    {
      upsert: false,
      returnDocument: 'after'
    }
  )
}

export { queueEvent, getNextQueuedEvent, ackEvent, findAll, resetEvent }
