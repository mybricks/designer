/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
export function deepClone(obj) {
  return obj !== void 0 && obj !== null ? JSON.parse(JSON.stringify(obj)) : obj
}