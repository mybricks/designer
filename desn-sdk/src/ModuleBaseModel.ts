/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import ComSeedModel from "./ComSeedModel";

export default class ModuleBaseModel extends ComSeedModel {
  slot
  frame

  constructor(model, opts?: { slot, frame }) {
    super(model)
    if (opts) {
      this.slot = opts.slot
      this.frame = opts.frame
    }
  }
}