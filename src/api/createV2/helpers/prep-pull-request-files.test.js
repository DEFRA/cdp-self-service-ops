import { prepPullRequestFiles } from '~/src/api/createV2/helpers/prep-pull-request-files'

describe('#prepPullRequestFiles', () => {
  test('Should provide expected object', () => {
    const mockPrMap = new Map()
    mockPrMap.set('one', 'super')
    mockPrMap.set('two', 'awesome')

    expect(prepPullRequestFiles(mockPrMap)).toEqual({
      one: 'super',
      two: 'awesome'
    })
  })

  test('Should remove empty map values', () => {
    const mockPrMap = new Map()
    mockPrMap.set('three', undefined)
    mockPrMap.set('four', 'yes')

    expect(prepPullRequestFiles(mockPrMap)).toEqual({ four: 'yes' })
  })
})
