import css from "./DiagramIO.less";
import {dragable, evt, observe, useComputed} from "@mybricks/rxui";
import React, {useMemo} from "react";
import Pin from "../../pin/Pin";
import {uuid} from "@utils";
import getConfiguration from "./configrable/io";
import ConView from "../../con/ConView";
import Con from "../../con/Con";
import ToplCom from "../../com/ToplCom";
import ToplComModelForked from "../../com/ToplComModelForked";
import {contextMenu, DiagramCtx} from "./Diagram";

import Comments from "../Comments";
import Handlers from "./handlers";

export default function DiagramIO() {
  const {viewCtx, model} = observe(DiagramCtx, {from: 'parents'})
  const {emitItem, frameModel, context} = viewCtx

  useMemo(() => {
    model['getConfigs'] = () => {//Append getConfigs to the model
      return getConfiguration(model, viewCtx)
    }
  }, [])

  // observe(NS_Emits.Component, next => {
  //   next({
  //     delete(dmodel) {
  //       if (dmodel instanceof ToplComModel) {
  //         model.delete(dmodel)
  //       }
  //       emitItem.delete(dmodel)
  //     }
  //   })
  // }, {from: 'children'})

  const inputs = useComputed(() => {
    const rtn = []
    if (frameModel.inputPins) {
      frameModel.inputPins.forEach(pin => {
        rtn.push(
          <Pin key={pin.id} model={pin} type={'frameIO'} key={pin.id}/>
        )
      })
    }
    if (context.isDesnMode() && frameModel.parent) {
      rtn.push(
        <div key={'adder'} className={`${css.pinAdder}`} onClick={addInputPin}>
          <p>+</p></div>
      )
    }
    return rtn
  })

  const outputs = useComputed(() => {
    // if (!(frameModel instanceof DialogToplViewModel)) {
    //   return
    // }
    const rtn = []
    if (frameModel.outputPins) {
      frameModel.outputPins.forEach(pin => {
        rtn.push(
          <Pin key={pin.id} model={pin} type={'frameIO'} key={pin.id}/>
        )
      })
    }
    if (context.isDesnMode() && frameModel.parent) {//Module
      rtn.push(
        <div key={'adder'} className={`${css.pinAdder}`} onClick={addOutputPin}>
          <p>+</p></div>
      )
    }
    return rtn
  })

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
        if (com instanceof ToplComModelForked) {
          if (model.parent.comAry.indexOf(com.forkedFrom) >= 0) {
            jsx.push(<ToplCom key={com.renderKey} model={com}/>)
          }
        } else {
          jsx.push(<ToplCom key={com.renderKey} model={com}/>)
        }
      })
    }
    return jsx
  })

  return (
    <div>
      <div ref={ele => ele && (model.$el = ele)}
           className={`${css.diagram} ${css.diagramIO} ${context.focusOn(model) ? css.focus : ''}`}
           onMouseEnter={event => {
             model.parent.currentDiagram = model
           }}
           onContextMenu={evt(contextMenu).prevent}
           onClick={evt(click).stop}
           style={style}>
        <Comments/>
        {coms}
        <div className={css.inputs}>
          {inputs}
        </div>
        <div className={css.outputs}>
          {outputs}
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

  //model.parent.focusedDiagram = model

  viewCtx.emitItem.focus(model)
}

function addInputPin() {
  const {viewCtx} = observe(DiagramCtx)
  viewCtx.frameModel.addInputPin(uuid(), `新增输入项`, {
    request: [
      {type: 'follow'}
    ], response: [
      {type: 'follow'}
    ]
  }, 1, true)
}

function addOutputPin() {
  const {viewCtx} = observe(DiagramCtx)
  viewCtx.frameModel.addOutputPin(uuid(), `新增输出项`, {
    request: [
      {type: 'follow'}
    ], response: [
      {type: 'follow'}
    ]
  }, 1, true)
}

