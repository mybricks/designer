/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {dragable, observe, useObservable} from "@mybricks/rxui";
import React from "react";
import DiagramModel from "./DiagramModel";
import {ToplComModel} from "../../com/ToplComModel";
import {ToplViewContext} from "../ToplView";
import {NS_Emits} from "@sdk";
import DiagramIO from "./DiagramIO";
import DiagramNormal from "./DiagramNormal";
import {getPosition} from "@utils";
import ToplComModelForked from "../../com/ToplComModelForked";

export class DiagramCtx {
  viewCtx: ToplViewContext
  model: DiagramModel
}

export default function Diagram({model}: { model: DiagramModel }) {
  const viewCtx = observe(ToplViewContext, {from: 'parents'})

  const {frameModel, emitView, context, emitItem, emitDebug} = viewCtx

  useObservable(DiagramCtx, next => next({
    viewCtx,
    model
  }), {to: 'children'})

  observe(NS_Emits.Component, next => {
    next({
      delete(dmodel) {
        if (dmodel instanceof ToplComModel) {
          model.delete(dmodel)
        }
        emitItem.delete(dmodel)
      }
    })
  }, {from: 'children'})

  if (model.showIO) {
    return <DiagramIO/>
  } else {
    return <DiagramNormal/>
  }
}

export function contextMenu(event) {
  const {model, viewCtx} = observe(DiagramCtx)

  const vpo = getPosition(viewCtx.frameModel.$el)

  viewCtx.assitWith = {
    type: 'outputs',
    position: {x: event.clientX - vpo.x, y: event.clientY - vpo.y}
  }
}

export function selectStartCom(event) {
  const {viewCtx, model} = observe(DiagramCtx)

  const vpo = getPosition(viewCtx.frameModel.$el)
  const ele = event.target
  const po = getPosition(ele)

  viewCtx.assitWith = {
    type: 'outputs',
    position: {x: po.x - vpo.x + 20, y: po.y - vpo.y + 20},
    onComplete(com, io) {
      const startCom = model.addCom(com, void 0, io)
      model.startFrom = startCom

      if (startCom.forkedFrom) {
        const fk: ToplComModelForked = startCom as ToplComModelForked
        fk._startInDiagram = true
      }
    }
  }
}

export function viewResize(direction, evt) {
  const {model, viewCtx} = observe(DiagramCtx)
  const {emitSnap, frameModel} = viewCtx

  let snap, {x, y, w, h} = getPosition(model.$el);

  dragable(evt, ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
    if (state == 'start') {
      snap = emitSnap.start('comResize')
    }
    if (state == 'moving') {
      if (direction == 'h' || direction == 'all') {
        model.style.height = h += dy
      }
      if (direction == 'w' || direction == 'all') {
        model.refreshInnerCons(true, 'output')
        frameModel.style.width = w += dx
      }
    }
    if (state == 'finish') {
      snap.commit();
    }
  })
}