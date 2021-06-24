/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {NS_Configurable} from "@sdk";
import {antiShaking} from "@utils";
import {ToplViewContext} from "../../ToplView";
import DiagramModel from "../DiagramModel";
import {createEdtItem} from "./common";

export default function get(diagramModel: DiagramModel, tvCtx: ToplViewContext) {
  const {frameModel, context, emitItem, emitSnap} = tvCtx
  const rtn = []

  const normalCategary = new NS_Configurable.Category('页面全局')
  rtn.push(normalCategary)

  let normalGroup = new NS_Configurable.Group();
  normalCategary.addGroup(normalGroup)

  // normalGroup.addItem(createEdtItem(tvCtx, {
  //   title: '标题',
  //   type: 'text',
  //   value: {
  //     get() {
  //       return frameModel.page.title
  //     }, set(val) {
  //       frameModel.page.title = val
  //     }
  //   }
  // }))

  // normalGroup.addItem(new RenderItem('组件', v => <ComsPanel diagramModel={diagramModel} emitSnap={emitSnap}/>))

  return rtn
}