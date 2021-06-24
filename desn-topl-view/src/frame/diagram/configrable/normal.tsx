/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {NS_Configurable} from "@sdk";
import {ToplViewContext} from "../../ToplView";
import DiagramModel from "../DiagramModel";
import {createEdtItem} from "./common";

export default function get(diagramModel: DiagramModel, tvCtx: ToplViewContext) {
  const {frameModel, context, emitItem, emitSnap} = tvCtx
  const rtn = []

  const normalCategary = new NS_Configurable.Category('流程卡片')
  rtn.push(normalCategary)

  let normalGroup = new NS_Configurable.Group();
  normalCategary.addGroup(normalGroup)

  normalGroup.addItem(createEdtItem(tvCtx, {
    title: '标题',
    type: 'text',
    value: {
      get() {
        return diagramModel.title
      }, set(val) {
        diagramModel.title = val
      }
    }
  }))

  if (context.isDesnMode()) {
    const sysGroup = new NS_Configurable.Group()
    sysGroup.fixedAt = 'bottom'
    normalCategary.addGroup(sysGroup)

    sysGroup.addItem(createEdtItem(tvCtx, {
      title: '删除',
      type: 'button',
      options: {type: 'danger'},
      value: {
        set(context, val) {
          const snap = emitSnap.start('itemDelete')
          emitItem.delete(diagramModel)
          emitItem.focus(void 0)
          snap.commit()
        }
      }
    }))
  }

  // normalGroup.addItem(new RenderItem('组件', v => <ComsPanel diagramModel={diagramModel} emitSnap={emitSnap}/>))

  return rtn
}