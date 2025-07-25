import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../oktokit/oktokit.js', () => ({
  octokit: vi.fn(),
  graphql: vi.fn()
}))

describe('#retry', () => {
  let logger
  let retry

  beforeAll(async () => {
    const commitGitHubFiles = await import('./commit-github-file.js')
    retry = commitGitHubFiles.retry
  })

  beforeEach(() => {
    logger = { error: vi.fn() }
  })

  test('resolves immediately if fn succeeds', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await retry(logger, fn)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(logger.error).not.toHaveBeenCalled()
  })

  test('retries the function on failure and eventually succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockResolvedValue('success')

    const result = await retry(logger, fn, 3, 10)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
    expect(logger.error).toHaveBeenCalledTimes(1)
  })

  test('throws after exhausting retries', async () => {
    const error = new Error('fail forever')
    const fn = vi.fn().mockRejectedValue(error)

    await expect(retry(logger, fn, 2, 10)).rejects.toThrow(error)
    expect(fn).toHaveBeenCalledTimes(3) // initial try + 2 retries
    expect(logger.error).toHaveBeenCalledTimes(3)
  })

  test('does not retry if shouldRetry returns false', async () => {
    const error = new Error('fatal error')
    const fn = vi.fn().mockRejectedValue(error)
    const shouldRetry = () => false

    await expect(retry(logger, fn, 5, 10, shouldRetry)).rejects.toThrow(error)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledTimes(1)
  })

  test('respects shouldRetry and stops retrying accordingly', async () => {
    const errorRetry = new Error('retryable')
    const errorNoRetry = new Error('no-retry')
    const fn = vi
      .fn()
      .mockRejectedValueOnce(errorRetry)
      .mockRejectedValueOnce(errorNoRetry)

    const shouldRetry = (err) => err.message === 'retryable'

    await expect(retry(logger, fn, 5, 10, shouldRetry)).rejects.toThrow(
      errorNoRetry
    )
    expect(fn).toHaveBeenCalledTimes(2)
    expect(logger.error).toHaveBeenCalledTimes(2)
  })
})
