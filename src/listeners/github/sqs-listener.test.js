import { sqsListener } from '~/src/listeners/github/sqs-listener'
import { githubEventsOpenedPullRequestFixture } from '~/src/__fixtures__/github_events'
import { handle } from '~/src/listeners/github/message-handler'
import { flushPromises } from '~/test-helpers/flush-promises'

const mockSqsSend = jest.fn()

jest.mock('~/src/listeners/github/message-handler')
jest.mock('@aws-sdk/client-sqs', () => ({
  ...jest.requireActual('@aws-sdk/client-sqs'),
  SQSClient: jest.fn().mockImplementation(() => ({ send: mockSqsSend }))
}))

describe('#sqsListener', () => {
  const mockServer = {
    logger: {
      info: jest.fn(),
      error: jest.fn()
    }
  }
  const response = {
    $metadata: {
      httpStatusCode: 200,
      attempts: 1,
      totalRetryDelay: 0
    },
    Messages: [
      {
        MessageId: '123456',
        ReceiptHandle: 'receipt-handle',
        Body: JSON.stringify(githubEventsOpenedPullRequestFixture)
      }
    ]
  }
  let listener

  afterEach(() => {
    listener.stop()
  })

  test('Should handle message as expected', async () => {
    mockSqsSend.mockResolvedValueOnce(response).mockResolvedValue({})

    listener = sqsListener(mockServer)

    await flushPromises()

    expect(handle).toHaveBeenCalledTimes(1)
    expect(handle).toHaveBeenCalledWith(
      mockServer,
      githubEventsOpenedPullRequestFixture
    )
  })

  test('Should handle errors as expected', async () => {
    mockSqsSend.mockRejectedValue(Error('Error processing message!'))

    listener = sqsListener(mockServer)

    await flushPromises()

    expect(mockServer.logger.error).toHaveBeenCalledTimes(1)
    expect(mockServer.logger.error).toHaveBeenCalledWith(
      'SQS receive message failed: Error processing message!'
    )
  })
})
