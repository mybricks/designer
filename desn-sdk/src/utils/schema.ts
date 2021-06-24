/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {T_IOPin, T_JSONSchema, T_Pin, T_PinSchema} from "@sdk";
import * as schemaComparer from "./schemaComparer";

// export function assetParamRules(paramRules: T_IOPin) {
//   let rtn
//   if (paramRules.request) {
//     const rqAry = assetSchema(paramRules.request)
//     if (rqAry === false) {
//       throw new Error(`Invalid request json schema defined in inputPin(title=${paramRules.title}).`)
//     }
//     rtn = {}
//     rtn.request = rqAry
//
//     const rsAry = assetSchema(paramRules.response)
//     if (rsAry === false) {
//       throw new Error(`Invalid response json schema defined in inputPin(title=${paramRules.title}).`)
//     }
//     rtn.response = rsAry
//   }
//   return rtn
// }

export function assetPinSchema(pin: T_IOPin) {
  const schema = pin.schema

  if (!schema || typeof schema !== 'object') {
    throw new Error(`Invalid schema,{request:schema[],resonse:schema[]} expected.`)
  } else if (!Array.isArray(schema.request) || !Array.isArray(schema.response)) {
    throw new Error(`Invalid schema,no request or response found.`)
  } else {
    const rtn: { request, response } = {}
    const rqAry = assetSchema(schema.request)
    if (rqAry === false) {
      throw new Error(`Invalid request json schema defined.`)
    }

    rtn.request = rqAry as any

    const rsAry = assetSchema(schema.response)
    if (rsAry === false) {
      throw new Error(`Invalid response json schema defined.`)
    }

    rtn.response = rsAry as any

    return rtn
  }
}


export function assetSchema(schemaAry: T_JSONSchema[]) {
  if (!Array.isArray(schemaAry) || schemaAry.length == 0) {
    return false
  }

  const set = new Set()
  let anySchema, followSchema
  const invalid = schemaAry.find(schema => {
    if (typeof (schema) !== 'object' || !schema.type) {
      return true
    }
    const type = schema.type.toLowerCase()
    if (set.has(type)) {
      return true
    }
    set.add(type)
    if (type === 'any') {
      anySchema = schema
      return true
    } else if (type === 'follow') {
      followSchema = schema
      return true
    }
  })
  if (invalid) {
    if (anySchema) {
      return [anySchema]
    }
    if (followSchema) {
      return [followSchema]
    }

    return false
  } else {
    return schemaAry
  }
}

export function canConnectTo(one: T_Pin, another: T_Pin): string | boolean {
  let from: T_Pin, to: T_Pin
  if (one.isDirectionOfInput()) {
    from = another
    to = one
  } else {
    from = one
    to = another
  }

  if (from.schema === void 0) {
    return `No schema defined for pin(hostId=${from.hostId}}).`
  }
  if (to.schema === void 0) {
    return `No schema defined for pin(hostId=${from.hostId}}).`
  }

  const {request: fromReq, response: fromResp} = from.schema
  const {request: toReq, response: toResp} = to.schema

  if (!fromReq || !toReq) {
    return `No request defined found.`
  }

  if (!fromResp || !toResp) {
    return `No response defined found.`
  }

  try {
    validateReq(fromReq, toReq)
    validateResp(fromResp, toResp)
    return true
  } catch (ex) {
    return ex.message
  }
}

export function matchSchema(from: T_PinSchema, to: T_PinSchema): string | boolean {
  if (from === void 0) {
    return `No schema defined.`
  }
  if (to === void 0) {
    return `No schema defined.`
  }

  const {request: fromReq, response: fromResp} = from
  const {request: toReq, response: toResp} = to

  if (!fromReq || !toReq) {
    return `No request defined found.`
  }

  if (!fromResp || !toResp) {
    return `No response defined found.`
  }

  try {
    validateReq(fromReq, toReq)
    validateResp(fromResp, toResp)
    return true
  } catch (ex) {
    return ex.message
  }
}

function validateReq(fromReq: T_JSONSchema[], toReq: T_JSONSchema[]) {
  const error = new Error(`输入项与输出项的 request 数据格式定义不一致.`)

  const fromMap = {}
  fromReq.forEach(schema => {
    fromMap[schema.type] = schema
  })

  const toMap = {}
  toReq.forEach(schema => {
    toMap[schema.type] = schema
  })

  if ('any' in toMap || 'follow' in toMap || 'follow' in fromMap) {
    return true
  } else if ('any' in fromMap) {
    throw error
  }

  if ('null' in fromMap && !('null' in toMap) ) {
    throw error
  }

  if (toReq.length < fromReq.length) {
    throw error
  }

  fromReq.forEach(fromSchema => {
    const toSchema = toMap[fromSchema.type]
    if (!toSchema) {
      throw error
    } else if (!schemaComparer(fromSchema, toSchema, {
      ignore: ['title','mock'],
      compare(key, first, second) {
        if (key === 'type') {
          if (second.value === 'any') {
            return true
          }
          if (first.value==='object' && second.value === 'object') {
            if (first.at['properties'] && !second.at['properties']) {//first(object with properties) second(object without properties)
              return true
            }
          }
        } else if (key === 'properties') {
          if (!first.value && second.value) {
            return false
          }
          if (first.value && !second.value) {
            return true
          }
        }
      }
    })) {
      throw error
    }
  })

  return true
}

function validateResp(fromResp: T_JSONSchema[], toResp: T_JSONSchema[]) {
  const error = new Error(`输入项与输出项的 response 数据格式定义不一致.`)

  const fromMap = {}
  fromResp.forEach(schema => {
    fromMap[schema.type] = schema
  })

  const toMap = {}
  toResp.forEach(schema => {
    toMap[schema.type] = schema
  })

  if ('any' in fromMap || 'follow' in toMap || 'follow' in fromMap) {
    return true
  } else if ('any' in toMap) {
    throw error
  }

  if ('null' in fromMap && toResp.find(s => s.type !== 'null')) {
    throw error
  }

  if (fromResp.length < toResp.length) {
    throw error
  }

  toResp.forEach(toSchema => {
    const fromSchema = fromMap[toSchema.type]
    if (!fromSchema) {
      throw error
    } else if (!schemaComparer(fromSchema, toSchema, {
      ignore: 'title',
      compare(key, first, second) {
        if (key === 'type') {
          if (second.value === 'any') {
            return true
          }
        } else if (key === 'properties') {
          if (!first.value && second.value) {
            return false
          }
          if (first.value && !second.value) {
            return true
          }
        }
      }
    })) {
      throw error
    }
  })

  return true
}

function getParentTitle(pin: T_Pin) {
  const parent = pin.parent
  if (parent instanceof ToplComModel) {
    return `component(title=${parent.runtime.title},namespace=${parent.runtime.def.namespace})`
  } else {
    return `frame(id=${parent.id})`
  }
}
