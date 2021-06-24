/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
export function randomNum(minNum, maxNum) {
  let fn = (n0: number, n1: number) =>
    parseInt(String(Math.random() * ((n1 !== undefined ? n1 : 2 * n0) - n0 + 1)), 10)
  return [fn(minNum, maxNum), fn(minNum, maxNum)]
}