/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {NS_Configurable} from "./configurable";

export namespace NS_Shortable {
  export interface I_Shortable {
    getShortcuts(): Array<NS_Configurable.Group>
  }
}