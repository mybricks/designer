/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
const IGNORE = '_ignore_'

export function wrapWheel(fn?) {
  const todo = typeof fn === 'function' ? event => {
    if ('_ignore_' in event) {
      delete Object.getPrototypeOf(event)['_ignore_']
    }else{
      fn(event)
    }
  } : void 0

  const proto = {
    stop(event) {
      if (todo) {
        todo(event)
      }

      if (event.nativeEvent) {
        Object.defineProperty(Object.getPrototypeOf(event.nativeEvent), IGNORE, {
          value: true,
          writable: true,
          enumerable: !1,
          configurable: true
        })
      }
    }
  }

  const rtn = function (event) {
    if (todo) {
      todo(event)
    }
  }
  Object.setPrototypeOf(rtn, proto)

  return rtn
}