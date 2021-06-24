/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {DesignerContext, NS_Configurable} from "@sdk";

export default class EditContext {
  context: DesignerContext

  catelogs: NS_Configurable.Category[] = []

  activeCateId: string

  setCatelogs(catelogs: NS_Configurable.Category[]) {
    if (Array.isArray(catelogs)) {
      this.catelogs = catelogs
      if (catelogs.length > 0) {
        this.activeCateId = catelogs[0].id
      }
    } else {
      this.activeCateId = void 0
      this.catelogs = void 0
    }
  }

  isActiveCatelog(id) {
    return this.activeCateId === id
  }

  switchCatelog(id): void {
    this.activeCateId = id;
  }
}