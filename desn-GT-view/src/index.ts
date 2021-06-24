/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import StageView from './StageView'
import {dump as dumpView} from '@mybricks/rxui'

export {StageView}

export function dumpCurrent(persistName) {
  return dumpView(persistName)
}
