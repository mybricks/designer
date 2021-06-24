import parentCss from "./Diagram.less";
import css from './DiagramMini.less'
import {dragable, evt, observe, useComputed} from "@mybricks/rxui";
import React from "react";
import {get as getConfiguration} from "./configrable";
import {DiagramCtx, selectStartCom} from "./Diagram";
import ToplComModelForked from "../../com/ToplComModelForked";
import ToplCom from "../../com/ToplCom";

export default function DiagramMini() {
  const {viewCtx, model} = observe(DiagramCtx, {from: 'parents'})
  const {emitItem, frameModel, context} = viewCtx

  const classes = useComputed(() => {
    const rtn = []
    rtn.push(css.mini)

    frameModel.currentDiagram === model && rtn.push(parentCss.focus)

    return rtn.join(' ')
  })

  const coms = useComputed(() => {
    const jsx = []
    model.comAry.forEach(com => {
      if (com instanceof ToplComModelForked) {
        if (model.parent.comAry.indexOf(com.forkedFrom) >= 0) {
          jsx.push(<ToplCom key={com.renderKey} model={com}/>)
        }
      } else {
        jsx.push(<ToplCom key={com.renderKey} model={com}/>)
      }
    })
    return jsx
  })

  return (
    <div ref={ele => ele && (model.$el = ele)}
         className={classes}
         onClick={evt(click).stop}>
      {/*<p className={css.title}>{model.startFrom.runtime.title} (输出项为空)</p>*/}
      <div>
        {coms}
      </div>
    </div>
  )
}

function click() {
  // if (dragable.event) {//has something dragging
  //   return
  // }
  // const {model, viewCtx} = observe(DiagramCtx)
  //
  // // model.startFrom.forkedFrom
  // //
  // // model.parent.blur()
  // //
  // // model.parent.focusedDiagram = model
  //
  // viewCtx.emitItem.focus(model.startFrom)
}