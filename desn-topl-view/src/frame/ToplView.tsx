/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {observe, useObservable, useWatcher} from '@mybricks/rxui';
import React, {useEffect} from 'react';
import {DesignerContext, NS_Emits} from '@sdk';
import css from "./ToplView.less";

import {initEmitComponent, initEmitIOEditor} from "./emits";
import {PinModel} from "../pin/PinModel";
import FrameModel from "./FrameModel";
import ToplNormalView from "./ToplNormalView";
import DiagramView from "./diagram/DiagramView";
import {validateAllFrames} from "./validate";
import {run, stop, stopRunner} from "../DebugRunner";
import {ToplComModel} from "../com/ToplComModel";

export class ToplViewContext {
  context: DesignerContext
  frameModel: FrameModel
  emitLogs: NS_Emits.Logs
  emitMessage: NS_Emits.Message
  emitView: NS_Emits.Views
  emitDebug: NS_Emits.Debug
  emitModule: NS_Emits.Module
  emitItem: NS_Emits.Component
  emitSnap: NS_Emits.Snap
  assitWith: {
    type: 'inputs' | 'outputs'
    pinModel?: PinModel,
    position: { x: number, y: number }
    onComplete?(com: ToplComModel, io: { inputs?, outputs? }): void
  }

  selectZone: {}

  wrapEle: HTMLElement
}

export default function ToplView({frameModel, debugParams}: { frameModel: FrameModel, debugParams: {} }) {
  const context = observe(DesignerContext, {from: 'parents'})
  const emitMessage = useObservable(NS_Emits.Message, {expectTo: 'parents'})
  const emitItem = useObservable(NS_Emits.Component, {expectTo: 'parents'})
  const emitSnap = useObservable(NS_Emits.Snap, {expectTo: 'parents'})
  const emitView = useObservable(NS_Emits.Views, {expectTo: 'parents'})
  const emitDebug = useObservable(NS_Emits.Debug, {expectTo: 'parents'})
  const emitModule = useObservable(NS_Emits.Module, {expectTo: 'parents'})
  const emitLogs = useObservable(NS_Emits.Logs, {expectTo: 'parents'})

  const viewCtx = useObservable(ToplViewContext, next => {
    next({
      context,
      frameModel,
      emitLogs,
      emitMessage,
      emitView,
      emitDebug,
      emitItem,
      emitModule,
      emitSnap
    })
  }, {
    to: "children"
  })

  useEffect(() => {
    if (frameModel.state.isEnabled()) {
      scrollFix(frameModel)
      // if (context.isDesnMode()) {
      //   click()
      // }
    }
  }, [frameModel.state.isEnabled()])

  useEffect(() => {
    validateAllFrames(frameModel, viewCtx)

    // viewCtx.wrapEle.addEventListener('wheel', evt => {
    //
    //   wrapWheel(()=>{
    //     wheel(evt, frameModel)
    //     evt.preventDefault()
    //   })(evt)
    //
    //   // if ('_ignore_' in evt) {
    //   //   delete Object.getPrototypeOf(evt)['_ignore_']
    //   // } else {
    //   //   wheel(evt, frameModel)
    //   //   evt.preventDefault()
    //   // }
    // }, {passive: false})
  }, [])

  useEffect(() => {
    if (context.isDesnMode()) {
      frameModel.clearAllTempComs()
    }
  }, [context.getMode()])

  useEffect(() => {
    if (context.isDebugMode()) {
      //stop(viewCtx)
      //setTimeout(v=>{})
      run(frameModel, debugParams && {params: debugParams}, viewCtx, emitDebug, emitLogs, emitModule, 'start')
      return () => {
        stop(viewCtx)
        //viewModel.clearDebug()
      }
    } else {
      stop(viewCtx)
    }
  }, [context.getMode()])

  useWatcher(frameModel, 'comAry', (prop, val, preVal) => {
    if (context.isDebugMode()) {
      run(frameModel, debugParams && {params: debugParams}, viewCtx, emitDebug, emitLogs, emitModule, 'update')
    }
  })

  observe(NS_Emits.Component, next => initEmitComponent(viewCtx), {from: 'parents'}, [frameModel])
  observe(NS_Emits.IOEditor, next => initEmitIOEditor(viewCtx), {from: 'parents'})

  observe(NS_Emits.Module, next => {
    next({
      clearAllTempComs() {
        frameModel.clearAllTempComs()
      }
    })
  }, {from: 'parents'})

  observe(NS_Emits.Debug, n => n({
    stop() {
      frameModel.clearDebugs()
      stopRunner(viewCtx)
    }
  }), {from: 'parents'}, [frameModel])

  // const content = useOnce(()=>{
  //   if(frameModel.state.isEnabled()){
  //     return context.useLatestFeatures ? <DiagramView/> : <ToplNormalView/>
  //   }
  // },[frameModel.state.isEnabled()])

  return (
    <div className={css.viewWrap}
         ref={ele => ele && (viewCtx.wrapEle = ele)}
         style={{opacity: frameModel.state.isEnabled() ? 1 : 0}}
         onClick={click}
         onScroll={scoll}>
      {
        context.useLatestFeatures ? <DiagramView/> : <ToplNormalView/>
      }
    </div>
  )
}

function scrollFix(model: FrameModel) {
  if (model.$el) {
    const ele = model.$el.parentElement

    const x = (ele.scrollWidth - model.$el.clientWidth) / 2
    if (!model.style.left
      || x > (model.style.left + ele.offsetWidth)
      || (x + model.$el.clientWidth) < model.style.left) {
      model.style.left = ele.scrollLeft = (ele.scrollWidth - ele.clientWidth) / 2
    }

    ele.scrollLeft = model.style.left

    const y = (ele.scrollHeight - model.$el.clientHeight) / 2
    if (!model.style.top
      || x > (model.style.top + ele.offsetWidth)
      || (x + model.$el.clientHeight) < model.style.top) {
      model.style.top = (ele.scrollHeight - ele.clientHeight) / 2
    }

    ele.scrollTop = model.style.top
  }
}

function scoll(evt) {
  const {frameModel} = observe(ToplViewContext)

  const ele = evt.target as HTMLElement
  frameModel.style.left = ele.scrollLeft
  frameModel.style.top = ele.scrollTop

  //lazyImg(evt.target)
}

// function wheel(evt, viewModel) {
//   // const {wrapEle} = observe(ToplViewContext)
//   // if (evt.target === wrapEle) {
//   //
//   // }
//   viewModel.style.left = Math.round(viewModel.style.left - evt.deltaX)
//   viewModel.style.top = Math.round(viewModel.style.top - evt.deltaY)
// }


function click() {
  const {selectZone, frameModel, emitItem, emitSnap, context} = observe(ToplViewContext)
  frameModel.blur()
  if (context.isDesnMode()) {
    if (!selectZone) {
      emitItem.focus(null)
    }
  } else {
    frameModel.clearDebugHints()
  }
}