import { removeNil } from '~/src/helpers/remove-nil.js'

describe('#removeNil', () => {
  test('Should remove null and undefined values from a flat object', () => {
    const input = { a: 1, b: null, c: undefined, d: 4 }
    const expected = { a: 1, d: 4 }

    expect(removeNil(input)).toEqual(expected)
  })

  test('Should remove null and undefined values from a nested object', () => {
    const input = { a: 1, b: { c: null, d: 4, e: undefined }, f: 5 }
    const expected = { a: 1, b: { d: 4 }, f: 5 }

    expect(removeNil(input)).toEqual(expected)
  })

  test('Should remove null and undefined values from an array', () => {
    const input = [1, null, 2, undefined, 3]
    const expected = [1, 2, 3]

    expect(removeNil(input)).toEqual(expected)
  })

  test('Should remove null and undefined values from a nested array', () => {
    const input = [1, [null, 2, undefined], 3]
    const expected = [1, [2], 3]

    expect(removeNil(input)).toEqual(expected)
  })

  test('Should return the same value for non-object and non-array inputs', () => {
    expect(removeNil(1)).toBe(1)
    expect(removeNil(null)).toBeNull()
    expect(removeNil(undefined)).toBeUndefined()
    expect(removeNil('string')).toBe('string')
  })

  test('Should handle complex nested structures', () => {
    const input = { a: [1, null, { b: undefined, c: 3 }], d: { e: [null, 4] } }
    const expected = { a: [1, { c: 3 }], d: { e: [4] } }

    expect(removeNil(input)).toEqual(expected)
  })
})
