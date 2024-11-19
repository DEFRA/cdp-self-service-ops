import { sanitize } from '~/src/helpers/sanitize.js'

describe('#sanitize', () => {
  test('Should sanitize string as expected', () => {
    expect(sanitize(`the "snail" ate some 'kale'`)).toEqual(
      'the snail ate some kale'
    )
  })
})
