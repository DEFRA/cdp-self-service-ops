import { createRecordTestRun } from '~/src/api/deploy-test-suite/helpers/record-test-run.js'
import { randomUUID } from 'node:crypto'

describe('#recordTestRun', () => {
  test('Schema should pass validation without errors', async () => {
    jest.mock('~/src/helpers/fetcher.js', () => ({
      fetcher: jest.fn().mockResolvedValue({})
    }))

    const res = await createRecordTestRun(
      'some-service',
      randomUUID(),
      'test',
      {
        id: 'some-id',
        displayName: 'My Name'
      },
      'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2'
    )

    expect(res).not.toBeNull()
  })
})
