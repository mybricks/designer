/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {evt, observe, useComputed, useWatcher} from '@mybricks/rxui';
import React, {useEffect, useMemo} from 'react';
import css from "./DiagramView.less";

import {ToplViewContext} from "../ToplView";
import Diagram from "./Diagram";
import PinAssist from "./PinAssist";
import {getOutliners} from "../emits";
import {_2020_12_1} from "../../_Compatible";

export default function DiagramView() {
  const viewCtx = observe(ToplViewContext, {from: 'parents'})

  const {frameModel, emitView, context} = viewCtx

  // useMemo(()=>{
  //   if(frameModel){
  //
  //   }
  // },[])

  useEffect(() => {
    if (frameModel.state.isEnabled() && context.isDesnMode()) {
      if (!frameModel.focusModelAry?.length) {
        click()
      }
    }
  }, [context.isDesnMode()])

  // useEffect(() => {
  //   _2020_12_1.frame(frameModel, viewCtx)
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

  const style = useComputed(() => {
    return {
      width: frameModel.style.width,
      // height: frameModel.style.height,
      //transform: `translate(${frameModel.style.left}px,${frameModel.style.top}px)`,
    }
  })

  const diagrams = useComputed(() => {
    const jsx = []
    if (frameModel.diagramAry.length > 0) {
      frameModel.diagramAry.forEach((diagram, idx) => {
        if (diagram.startFrom) {
          const com = diagram.startFrom
          if (com.exist()) {
            jsx.push(<Diagram key={diagram.id} model={diagram}/>)
          } else {
            frameModel.diagramAry.splice(idx, 1)
          }
        } else {
          jsx.push(<Diagram key={diagram.id} model={diagram}/>)
        }
      })
    } else {
      jsx.push(<div key={'empty'} className={css.empty}>没有流程定义.</div>)
    }
    return jsx
  })

  return (
    <div ref={el => el && (frameModel.$el = el)}
         className={`${css.diagramView} ${frameModel.state.isHovering() ? css.hover : ''}`}
         style={style}>
      <div>
        {diagrams}
      </div>
      {
        viewCtx.assitWith ? (
          <PinAssist type={viewCtx.assitWith.type}
                     frameModel={frameModel}
                     {...viewCtx.assitWith}/>
        ) : null
      }
    </div>
  )
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