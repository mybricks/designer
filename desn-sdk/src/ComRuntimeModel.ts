/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {clone, Ignore, Serializable} from '@mybricks/rxui';
import BaseUIModel from "./BaseUIModel";
import {I_GeoComModel, I_ToplComModel, T_ComDef, T_ComRuntimeModel} from ".";
import ComStyle from "./ComStyle";
import {SerializeNS} from "./constants";

@Serializable(SerializeNS + 'ComRuntimeModel')
export default class ComRuntimeModel<DataType> extends BaseUIModel {
  title: string

  labelType: 'none' | 'todo' = 'none'

  labelColor: string

  def: T_ComDef

  //Exist in runtime/debug mode only,removed in desn mode
  rtOnly:boolean

  model: T_ComRuntimeModel<DataType> = {
    data: void 0,
    inputAry: [],
    outputAry: [],
    // slotAry: [],
    // frameAry: [],
    script: void 0,
    style: new ComStyle()
  }

  // activeFrame: {
  //   id: string,
  //   title: string
  // }

  hasUI(): boolean {
    const rtType = this.def.rtType
    return !rtType || rtType.match(/react|vue/gi) !== null
  }

  //@Ignore
  topl: I_ToplComModel

  //@Ignore
  geo: I_GeoComModel

  //@Ignore
  initState: {
    editorInitInvoked: boolean
  } = {}

  // @Ignore
  // scopePath: string
  //
  // @Ignore
  // defaultFrameLabel: string

  // @Ignore
  // curRtScopeId: string

  @Ignore
  upgrade: {
    info: string
  }

  getFrame(id: string) {
    if (this.topl) {
      return this.topl.getFrame(id)
    }
  }

  clone() {
    const cloned = new ComRuntimeModel()

    cloned.id = this.id////TODO
    cloned.title = this.title

    cloned.def = this.def

    cloned.model = {
      data: clone(this.model.data),
      inputAry: clone(this.model.inputAry),
      outputAry: clone(this.model.outputAry),
      script: clone(this.model.script),
      style: this.model.style.clone()
    }

    cloned.geo = this.geo
    cloned.topl = this.topl

    return cloned
  }

  toJson(type?: 'geo' | 'topl' | undefined) {
    const json = {} as any

    json.id = this.id
    json.def = this.def

    json.title = this.title

    json.model = {
      data: clone(this.model.data),
      // inputAry: clone(rt.model.inputAry),
      // outputAry: clone(rt.model.outputAry),
      script: clone(this.model.script),
      style: this.model.style.clone()
    }

    if (this.geo && (!type || type === 'geo')) {
      json.geo = this.geo.toJson()
    }

    if (!type || type === 'topl') {
      json.topl = this.topl.toJson()
    }

    return json
  }
}