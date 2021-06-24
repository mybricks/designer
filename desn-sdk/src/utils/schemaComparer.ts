/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
const isEqual = require('lodash/isEqual')
const sortBy = require('lodash/sortBy')
const uniq = require('lodash/uniq')
const uniqWith = require('lodash/uniqWith')
const defaults = require('lodash/defaults')
const intersectionWith = require('lodash/intersectionWith')
const isPlainObject = require('lodash/isPlainObject')
const isBoolean = require('lodash/isBoolean')

const normalizeArray = val => Array.isArray(val)
  ? val : [val]
const undef = val => val === undefined
const keys = obj => isPlainObject(obj) || Array.isArray(obj) ? Object.keys(obj) : []
const has = (obj, key) => obj.hasOwnProperty(key)
const stringArray = arr => sortBy(uniq(arr))
const undefEmpty = val => undef(val) || (Array.isArray(val) && val.length === 0)
const keyValEqual = (a, b, key, compare) => b && has(b, key) && a && has(a, key) && compare(a[key], b[key])
const undefAndZero = (a, b) => (undef(a) && b === 0) || (undef(b) && a === 0) || isEqual(a, b)
const falseUndefined = (a, b) => (undef(a) && b === false) || (undef(b) && a === false) || isEqual(a, b)
const emptySchema = schema => undef(schema) || isEqual(schema, {}) || schema === true
const emptyObjUndef = schema => undef(schema) || isEqual(schema, {})
const isSchema = val => undef(val) || isPlainObject(val) || val === true || val === false

function undefArrayEqual(a, b) {
  if (undefEmpty(a) && undefEmpty(b)) {
    return true
  } else {
    return isEqual(stringArray(a), stringArray(b))
  }
}

function unsortedNormalizedArray(a, b) {
  a = normalizeArray(a)
  b = normalizeArray(b)
  return isEqual(stringArray(a), stringArray(b))
}

function schemaGroup(a, b, key, compare) {
  var allProps = uniq(keys(a).concat(keys(b)))
  if (emptyObjUndef(a) && emptyObjUndef(b)) {
    return true
  } else if (emptyObjUndef(a) && keys(b).length) {
    return false
  } else if (emptyObjUndef(b) && keys(a).length) {
    return false
  }

  return allProps.every(function (key) {
    var aVal = a[key]
    var bVal = b[key]
    if (Array.isArray(aVal) && Array.isArray(bVal)) {
      return isEqual(stringArray(a), stringArray(b))
    } else if (Array.isArray(aVal) && !Array.isArray(bVal)) {
      return false
    } else if (Array.isArray(bVal) && !Array.isArray(aVal)) {
      return false
    }
    return keyValEqual(a, b, key, compare)
  })
}

function items(a, b, key, compare) {
  if (isPlainObject(a) && isPlainObject(b)) {
    return compare(a, b)
  } else if (Array.isArray(a) && Array.isArray(b)) {
    return schemaGroup(a, b, key, compare)
  } else {
    return isEqual(a, b)
  }
}

function unsortedArray(a, b, key, compare) {
  const uniqueA = uniqWith(a, compare)
  const uniqueB = uniqWith(b, compare)
  const inter = intersectionWith(uniqueA, uniqueB, compare)
  return inter.length === Math.max(uniqueA.length, uniqueB.length)
}

const comparers = {
  title: isEqual,
  uniqueItems: falseUndefined,
  minLength: undefAndZero,
  minItems: undefAndZero,
  minProperties: undefAndZero,
  required: undefArrayEqual,
  enum: undefArrayEqual,
  type: unsortedNormalizedArray,
  items: items,
  anyOf: unsortedArray,
  allOf: unsortedArray,
  oneOf: unsortedArray,
  properties: schemaGroup,
  patternProperties: schemaGroup,
  dependencies: schemaGroup
}

const acceptsUndefined = [
  'properties',
  'patternProperties',
  'dependencies',
  'uniqueItems',
  'minLength',
  'minItems',
  'minProperties',
  'required'
]

const schemaProps = ['additionalProperties', 'additionalItems', 'contains', 'propertyNames', 'not']

function compare(first, second, options) {
  options = defaults(options, {
    ignore: [],
    first,
    second
  })

  if (emptySchema(first) && emptySchema(second)) {
    return true
  }

  if (!isSchema(first) || !isSchema(second)) {
    throw new Error('Either of the values are not a JSON schema.')
  }
  if (first === second) {
    return true
  }

  if (isBoolean(first) && isBoolean(second)) {
    return first === second
  }

  if ((first === undefined && second === false) || (second === undefined && first === false)) {
    return false
  }

  if ((undef(first) && !undef(second)) || (!undef(first) && undef(second))) {
    return false
  }

  let allKeys = uniq(Object.keys(first).concat(Object.keys(second)))

  if (options.ignore.length) {
    allKeys = allKeys.filter(k => options.ignore.indexOf(k) === -1)
  }

  if (!allKeys.length) {
    return true
  }

  function innerCompare(a, b) {
    return compare(a, b, options)
  }

  return allKeys.every(function (key) {
    // if(key==='properties'){
    //   debugger
    // }
    //
    const aValue = first[key]
    const bValue = second[key]

    if(options&&typeof options.compare==='function'){
      const rtn = options.compare(key,{
        value:aValue,
        at:first,
        root:options.first
      },{
        value:bValue,
        at:second,
        root:options.second
      })
      if(typeof rtn ==='boolean'){
        return rtn
      }
    }

    if (schemaProps.indexOf(key) !== -1) {
      return compare(aValue, bValue, options)
    }

    let comparer = comparers[key]
    if (!comparer) {
      comparer = isEqual
    }

    // do simple lodash check first
    if (isEqual(aValue, bValue)) {
      return true
    }

    if (acceptsUndefined.indexOf(key) === -1) {
      if ((!has(first, key) && has(second, key)) || (has(first, key) && !has(second, key))) {
        return aValue === bValue
      }
    }

    const result = comparer(aValue, bValue, key, innerCompare)
    if (!isBoolean(result)) {
      throw new Error('Comparer must return true or false')
    }
    return result
  })
}

module.exports = compare