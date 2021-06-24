/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {Ignore, Serializable} from "@mybricks/rxui";
import {SerializeNS} from '../constants';
import ToplBaseModel from "../ToplBaseModel";

@Serializable(SerializeNS + 'topl.frame.CommentModel')
export class CommentModel extends ToplBaseModel {
  conModel

  content: string

  po: { x: number, y: number }

  ratio: number

  @Ignore
  editNow: boolean

  constructor(conModel, content: string, po: { x: number, y: number }) {
    super()
    if (conModel) {
      this.conModel = conModel
      this.content = content
      this.po = po
    }
  }

  focus() {
    this.state.focus()
  }

  blur() {
    this.state.enable()
  }
}