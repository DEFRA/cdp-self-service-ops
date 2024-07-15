import { generateDeployMessage } from '~/src/api/deploy/helpers/generate-deploy-message'

describe('#generateDeployMessage', () => {
  test('should prefix deployments with sha and use global_fixed', async () => {
    const configSha = '6d96270004515a0486bb7f76196a72b40c55a47f'
    const env = 'test'
    const msg = await generateDeployMessage(
      '1234',
      'foo-backend',
      '0.1.0',
      env,
      'public',
      1,
      '1024',
      '1024',
      'user',
      configSha
    )

    expect(
      msg.env_files.every((c) =>
        c.value.startsWith(
          `arn:aws:s3:::cdp-${env}-service-configs/${configSha}`
        )
      )
    ).toBe(true)

    expect(msg.env_files[0].value).toBe(
      `arn:aws:s3:::cdp-${env}-service-configs/${configSha}/global/global_fixed.env`
    )
  })
})
