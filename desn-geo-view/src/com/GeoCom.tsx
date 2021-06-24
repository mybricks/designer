/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {dragable, observe, useObservable} from '@mybricks/rxui';
import {DesignerContext, NS_Emits, T_XGraphComDef} from '@sdk';
import {GeoComModel} from './GeoComModel';

import Normal from "./normal/Normal";
import NormalDebug from "./normal/NormalDebug";
import SlotModel from "../slot/SlotModel";
import {getPosition} from "@utils";
import {NS_XGraphComLib} from "@sdk";
import Module from "./module/Module";
import ModuleDebug from "./module/ModuleDebug";
import {useEffect} from "react";
import ExceptionCom from "./exception/ExceptionCom";

export class ComContext {
  context: DesignerContext
  model: GeoComModel
  hoverF:boolean
  comDef: T_XGraphComDef
  emitLogs: NS_Emits.Logs
  emitPage: NS_Emits.Page
  emitMessage: NS_Emits.Message
  emitItem: NS_Emits.Component
  emitModule: NS_Emits.Module
  emitSnap: NS_Emits.Snap
  emitIOEditor: NS_Emits.IOEditor
}

// const COM_IDS:{[id:string]:GeoComModel} = {}

export default function GeoCom({model, slot}: { model: GeoComModel, slot: string }) {
  const emitLogs = useObservable(NS_Emits.Logs, {expectTo: 'parents'})
  const emitSnap = useObservable(NS_Emits.Snap, {expectTo: 'parents'})
  const emitItem = useObservable(NS_Emits.Component, {expectTo: 'parents'})
  const emitModule = useObservable(NS_Emits.Module, {expectTo: 'parents'})
  const emitMessage = useObservable(NS_Emits.Message, {expectTo: 'parents'})
  const emitPage = useObservable(NS_Emits.Page, {expectTo: 'parents'})

  // if (model.runtime.def.namespace === NS_XGraphComLib.coms.module) {
  //
  // }

  const context = observe(DesignerContext, {from: 'parents'})
  const comDef = context.getComDef(model.runtime.def)

  const emitIOEditor = useObservable(NS_Emits.IOEditor, {expectTo: 'parents'})

  useObservable(ComContext,
    next => {
      if (comDef && !model.runtime.upgrade) {
        if (!model.runtime.def.version) {
          model.runtime.def.version = comDef.version
        }
        if (model.runtime.def.version !== comDef.version) {
          //const info = `"${comDef.title}" 版本号发生变更(${model.runtime.def.version} -> ${comDef.version}).`
          const info = `${model.runtime.def.version} > ${comDef.version}`
          model.runtime.upgrade = {
            info
          }
        }
      }
      next({model, comDef, context, emitLogs, emitMessage, emitSnap, emitItem, emitPage, emitModule, emitIOEditor})
    }, {to: 'children'})

  useEffect(() => {
    model.runtime.geo = model

    if (!model.runtime.title) {
      model.runtime.title = comDef.title
    }
  }, [])

  if (!comDef) {
    emitLogs.error('组件库错误', `未找到组件(${model.runtime.def.namespace}@${model.runtime.def.version})定义.`)
    return <ExceptionCom model={model} type='error'
                         msg={`未找到组件(${model.runtime.def.namespace}@${model.runtime.def.version})定义.`}/>
  }

  if (context.isDebugMode()) {
    if (comDef.namespace === NS_XGraphComLib.coms.module) {
      return <ModuleDebug/>
    } else {
      return <NormalDebug/>
    }
  } else {
    if (comDef.namespace === NS_XGraphComLib.coms.module) {
      return <Module mouseDown={mouseDown}/>
    } else {
      return <Normal mouseDown={mouseDown}/>
    }
  }
}

function mouseDown(evt) {
  const {model, context, emitItem, emitSnap} = observe(ComContext)

  if (model.state.isEditing()) {
    return;
  }
  if(model.style.isLayoutAbsolute()){

  }
  //emitItem.focus(void 0)

  let zoom = model.viewStyle.zoom;
  let snap, style, viewPo, toSlot: SlotModel;
  dragable(evt, ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
      if (state == 'start') {
        viewPo = getPosition(model.root.$el)
        style = model.style;

        snap = emitSnap.start('moving geocom')


        emitItem.move(model, 'start')
      }

      if (state == 'moving') {
        model.state.moving()

        if (model.style.isLayoutAbsolute()) {
          style.left += dx / zoom
          style.top += dy / zoom
        }

        emitItem.move(model, 'ing', {x: ex - viewPo.x, y: ey - viewPo.y})

        if (toSlot) {
          toSlot.state.hoverRecover();
        }
        toSlot = model.root.findSlotByPo({x: ex, y: ey}, model)

        if (canCutInSlot(model, toSlot)) {
          toSlot.state.hover();
        } else if (toSlot) {
          toSlot = void 0
        }
      }

      if (state == 'finish') {
        model.state.enable()

        const rtn = emitItem.move(model, 'finish')

        let info = rtn
        if (Array.isArray(rtn)) {
          info = rtn.find(desc => desc && desc.insertOrder !== void 0)
        }

        if (toSlot) {
          const targetId = toSlot.isRoot() ? null : toSlot.parent.id

          emitItem.cutToSlot(model.id, targetId, toSlot.id, info?.insertOrder)
          toSlot.state.hoverRecover()
        } else if (info && info.insertOrder !== void 0) {
          model.parent.insertInto(model, info.insertOrder)
        }

        emitItem.focus(model)

        // setTimeout(v=>{
        //   console.log('----')
        //   model.notifyEleChanged()
        // })


        snap.commit()
      }
    }, {zoom: model.viewStyle.zoom}
  )
}

function canCutInSlot(model: GeoComModel, toSlot: SlotModel) {
  if (toSlot) {
    if (toSlot?.parent === model) {//self's slot
      return false
    }
    if (model.parent === toSlot) {//cur parent slot
      return false
    }
    return true
  }
  return false
}