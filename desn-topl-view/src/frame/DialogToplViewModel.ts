/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {Serializable} from '@mybricks/rxui';
import {SerializeNS} from '../constants';
import ToplViewModel from "./ToplViewModel";
import FrameModel from "./FrameModel";

@Serializable(SerializeNS + 'topl.DialogToplViewModel')
export default class DialogToplViewModel extends ToplViewModel {
  constructor(from: FrameModel) {
    super()
    if (from) {
      this.id = from.id
      this.name = from.name
      this.title = from.title
      this.state = from.state

      this.addIODiagram()
      this.addInputPin('params', '参数', void 0)
      //
      // const comDef = getCom(NS_XGraphComLib.coms.dialogProxy)
      // const instanceModel = new ComSeedModel({
      //     namespace: comDef.namespace,
      //     rtType: comDef.rtType,
      //     //data: {outputId: inputPin.id}
      //   }
      // )
      //
      // const com = new ToplComModel(instanceModel, comDef)
      //
      // this.addComponent(com)
      // this.addDiagram(com, {outputs: ['commit']})
    }
  }
}