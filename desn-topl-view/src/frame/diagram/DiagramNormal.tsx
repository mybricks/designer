/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from "./DiagramNormal.less";
import {dragable, evt, observe, useComputed} from "@mybricks/rxui";
import React, {useMemo} from "react";
import {ToplViewContext} from "../ToplView";
import {getPosition} from "@utils";
import ConView from "../../con/ConView";
import Con from "../../con/Con";
import ToplCom from "../../com/ToplCom";
import ToplComModelForked from "../../com/ToplComModelForked";
import {contextMenu, DiagramCtx, selectStartCom} from "./Diagram";
import Comments from "../Comments";
import Handlers from './handlers'
import getConfiguration from "./configrable/normal";

export default function DiagramNormal() {
  const {viewCtx, model} = observe(DiagramCtx, {from: 'parents'})
  const {emitItem, frameModel, context} = viewCtx

  useMemo(() => {
    model['getConfigs'] = () => {//Append getConfigs to the model
      return getConfiguration(model, viewCtx)
    }
  }, [])

  const style = useComputed(() => {
    return {
      height: model.style.height
    }
  })

  const conTemp = useComputed(() => {
    if (model.conTemp) {
      return (
        <svg className={css.conView}>
          <Con model={model.conTemp}/>
        </svg>
      )
    }
  })

  const coms = useComputed(() => {
    const jsx = []
    if (model.comAry.length > 0) {
      model.comAry.forEach(com => {
        if (model.startFrom === com) {
          jsx.push(
            <div key={com.renderKey} className={css.startCom}>
              <ToplCom model={com}/>
            </div>
          )
        } else {
          if (com instanceof ToplComModelForked) {
            if (model.parent.comAry.indexOf(com.forkedFrom) >= 0) {
              jsx.push(<ToplCom key={com.renderKey} model={com}/>)
            }
          } else {
            jsx.push(<ToplCom key={com.renderKey} model={com}/>)
          }
        }
      })
    } else {
      jsx.push(
        <div key={'emptyStart'} className={css.emptyStart}
             onClick={evt(selectStartCom).stop}>
          <i>+</i>
        </div>
      )
    }

    return jsx
  })

  const classes = useComputed(() => {
    const rtn = [css.diagram, css.diagramNormal]
    context.focusOn(model) && rtn.push(css.focus)

    return rtn.join(' ')
  })

  return (
    <div className={css.diagramItem}>
      <div className={css.treeLines}>
        <div className={css.line}></div>
      </div>
      <div ref={ele => ele && (model.$el = ele)}
           className={classes}
           onMouseEnter={event => {
             model.parent.currentDiagram = model
           }}
           onClick={evt(click).stop}
           onContextMenu={evt(contextMenu).prevent}
           style={style}>
        <div className={css.title}>{model.title}</div>
        <Comments/>
        <div className={css.coms}>
          {coms}
        </div>
        <ConView frameModel={model}/>
        {conTemp}
        <div className={css.handlers}>
          <Handlers/>
        </div>
      </div>
    </div>
  )
}

function click() {
  if (dragable.event) {//has something dragging
    return
  }
  const {model, viewCtx} = observe(DiagramCtx)

  model.parent.blur()

  viewCtx.emitItem.focus(model)
}

function dblClick(evt) {
  const {frameModel} = observe(ToplViewContext)

  const cpo = getPosition(frameModel.$el)
  const x = evt.clientX - cpo.x
  const y = evt.clientY - cpo.y

  frameModel.addComment('注释', {x, y})
}