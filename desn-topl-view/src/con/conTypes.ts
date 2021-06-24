/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
export type T_Controller = {
  x?: number
  y?: number
  type: 'h' | 'v'
  endPoints: Array<T_Po>
  allPoints: Array<T_Po>
}
export type T_Po = {
  id?: string
  x: number
  y: number
  j?: number
  temp?: boolean
  d?: 'h' | 'v'
  fixed?: boolean
}