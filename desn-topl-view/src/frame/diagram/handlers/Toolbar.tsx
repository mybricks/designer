/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from "./Toolbar.less";
import {evt, observe, useComputed} from "@mybricks/rxui";
import React from "react";
import {ToplViewContext} from "../../ToplView";
import {getPosition} from "@utils";

export default function Toolbar() {
  const {frameModel} = observe(ToplViewContext, {from: 'parents'})
  // const style = useComputed(() => {
  //   let focusDiagram
  //   if ((focusDiagram = frameModel.focusedDiagram) && focusDiagram.$el) {
  //     const po = getPosition(focusDiagram.$el, frameModel.$el)
  //     return {
  //       top: po.y
  //     }
  //   }
  // })
  return (
    <div className={css.toolbar}>
      <div onClick={evt(addDiagram).stop}>+ 添加</div>
    </div>
  )
}

function addDiagram() {
  const {frameModel} = observe(ToplViewContext)
  frameModel.addDiagram()
}