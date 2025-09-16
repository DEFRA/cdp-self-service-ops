import { generateDeployMessage } from './generate-deploy-message.js'

describe('#generateDeployMessage', () => {
  test('should prefix deployments with sha and use global_fixed', () => {
    const configSha = '6d96270004515a0486bb7f76196a72b40c55a47f'
    const env = 'test'
    const msg = generateDeployMessage(
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

  test('should add service code if present', () => {
    const configSha = '6d96270004515a0486bb7f76196a72b40c55a47f'
    const env = 'test'
    const msg = generateDeployMessage(
      '1234',
      'foo-backend',
      '0.1.0',
      env,
      'public',
      1,
      '1024',
      '1024',
      'user',
      configSha,
      'CDP'
    )
    expect(msg.service_code).toBe('CDP')
  })

  test('should not add service code if missing', () => {
    const configSha = '6d96270004515a0486bb7f76196a72b40c55a47f'
    const env = 'test'
    const msg = generateDeployMessage(
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
    expect(msg.service_code).toBeUndefined()
  })
})
