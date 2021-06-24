import {dragable, evt, observe, useComputed, useObservable, useWatcher} from '@mybricks/rxui';
import React, {useEffect, useMemo} from 'react';
import {ToplComModel} from "../com/ToplComModel";
import css from "./ToplNormalView.less";
import ToplCom from "../com/ToplCom";
import {run, stop} from "../DebugRunner";
import {getPosition, uuid} from "@utils";
import ConView from "../con/ConView";

import {getOutliners} from "./emits";
import FrameModel from "./FrameModel";
import Pin from "../pin/Pin";
import Comments from "./Comments";
import {_2020_11_10} from "../_Compatible";
import Con from "../con/Con";
import {ToplViewContext} from "./ToplView";

export default function ToplNormalView() {
  const viewCtx = observe(ToplViewContext, {from: 'parents'})

  const {frameModel, emitView, context, emitDebug, emitLogs} = viewCtx

  // useEffect(() => {
  //   if (frameModel.state.isEnabledOrAbove()) {
  //     _2020_11_09.frame(frameModel, viewCtx)
  //   }
  // }, [frameModel.state.now])

  // useEffect(() => {
  //   _2020_11_10.frame(frameModel, viewCtx)
  // }, [])

  useWatcher(frameModel, 'comAry', (prop, val, preVal) => {
    if (frameModel.state.isEnabledOrAbove()) {
      emitView.focusStage({
        outlines: getOutliners(viewCtx)
      })
    }
  })

  useComputed(() => {
    if (frameModel.state.isEnabledOrAbove()) {
      Promise.resolve().then(() => {
        emitView.focusStage({
          outlines: getOutliners(viewCtx)
        })
      })
    }
  })

  useEffect(() => {
    if (frameModel.state.isEnabled() && context.isDesnMode()) {
      if (!frameModel.focusModelAry?.length) {
        click()
      }
    }
  }, [context.isDesnMode()])

  const style = useComputed(() => {
    return {
      width: frameModel.style.width || 1000,
      height: frameModel.style.height || 800,
      //transform: `translate(${frameModel.style.left}px,${frameModel.style.top}px)`,
    }
  })

  const inputs = useComputed(() => {
    if (frameModel.parent instanceof ToplComModel) {
      const rtn = []
      if (frameModel.inputPins) {
        frameModel.inputPins.forEach(pin => {
          rtn.push(
            <Pin key={pin.id} model={pin} type={'frameIO'} key={pin.id}/>
          )
        })
      }
      if (context.isDesnMode()) {
        rtn.push(
          <div key={'adder'} className={`${css.pinAdder}`} onClick={addInputPin}>
            <p>+</p></div>
        )
      }
      return rtn
    }
  })

  const outputs = useComputed(() => {
    if (frameModel.parent instanceof ToplComModel) {
      const rtn = []
      if (frameModel.outputPins) {
        frameModel.outputPins.forEach(pin => {
          rtn.push(
            <Pin key={pin.id} model={pin} type={'frameIO'} key={pin.id}/>
          )
        })
      }
      if (context.isDesnMode()) {
        rtn.push(
          <div key={'adder'} className={`${css.pinAdder}`} onClick={addOutputPin}>
            <p>+</p></div>
        )
      }
      return rtn
    }
  })

  const conTemp = useComputed(() => {
    if (frameModel.conTemp) {
      return (
        <svg className={css.conView}>
          <Con model={frameModel.conTemp}/>
        </svg>
      )
    }
  })

  return (
    <div ref={el => el && (frameModel.$el = el)}
         onDoubleClick={dblClick}
         className={`${css.toplView} ${frameModel.state.isHovering() ? css.hover : ''}`}
         style={style}>
      {frameModel.comAry.map((md, idx) => {
          return <ToplCom key={md.id} model={md}/>
        }
      )}
      <div className={css.inputs}>
        {inputs}
      </div>
      <div className={css.outputs}>
        {outputs}
      </div>

      <ConView frameModel={frameModel}/>
      {conTemp}
      <Comments/>
      <div className={css.resizerB} onMouseDown={evt(event => viewResize('h', event)).stop}/>
      <div className={css.resizerR} onMouseDown={evt(event => viewResize('w', event)).stop}/>
      <div className={css.resizer} onMouseDown={evt(event => viewResize('all', event)).stop}/>
    </div>
  )
}

function dblClick(evt) {
  const {frameModel} = observe(ToplViewContext)

  const cpo = getPosition(frameModel.$el)
  const x = evt.clientX - cpo.x
  const y = evt.clientY - cpo.y

  frameModel.addComment('注释', {x, y})
}

function addInputPin() {
  const {frameModel} = observe(ToplViewContext)
  frameModel.addInputPin(uuid(), `新增输入项`, {
    request: [
      {type: 'follow'}
    ], response: [
      {type: 'follow'}
    ]
  }, 1, true)
}

function addOutputPin() {
  const {frameModel} = observe(ToplViewContext)
  frameModel.addOutputPin(uuid(), `新增输出项`, {
    request: [
      {type: 'follow'}
    ], response: [
      {type: 'follow'}
    ]
  }, 1, true)
}

function scrollFix(model: FrameModel) {
  const ele = model.$el.parentElement

  if (model.style.left) {
    ele.scrollLeft = model.style.left
  } else {
    const left = ele.scrollLeft = (ele.scrollWidth - ele.clientWidth) / 2
    model.style.left = left
  }


  if (model.style.top) {
    ele.scrollTop = model.style.top
  } else {
    const top = ele.scrollTop = (ele.scrollHeight - ele.clientHeight) / 2
    model.style.top = top
  }
}

function scoll(evt) {
  const {frameModel} = observe(ToplViewContext)

  const ele = evt.target as HTMLElement
  frameModel.style.left = ele.scrollLeft
  frameModel.style.top = ele.scrollTop

  //lazyImg(evt.target)
}

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

function viewResize(direction, evt) {
  const {selectZone, frameModel, emitItem, emitSnap} = observe(ToplViewContext)

  let snap, {x, y, w, h} = getPosition(frameModel.$el);

  dragable(evt, ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
    if (state == 'start') {
      snap = emitSnap.start('comResize')
    }
    if (state == 'moving') {
      if (direction == 'h' || direction == 'all') {
        frameModel.style.height = h += dy
      }
      if (direction == 'w' || direction == 'all') {
        frameModel.refreshInnerCons(true, 'output')
        frameModel.style.width = w += dx
      }
    }
    if (state == 'finish') {
      if (direction == 'w' || direction == 'all') {
        frameModel.refreshInnerCons(false, 'output')
      }
      snap.commit();
    }
  })
}