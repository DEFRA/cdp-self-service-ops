import isNil from 'lodash/isNil.js'

/**
 * Remove null and undefined values from an object
 * @param {object} obj
 * @returns {object}
 */
function removeNil(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeNil).filter((value) => !isNil(value))
  } else if (!isNil(obj) && typeof obj === 'object') {
    return Object.entries(obj).reduce((cleaned, [key, value]) => {
      const clean = removeNil(value)
      if (!isNil(clean)) {
        cleaned[key] = clean
      }
      return cleaned
    }, {})
  }
  return obj
}

export { removeNil }
