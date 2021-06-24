import {dragable, evt, observe, useComputed} from "@mybricks/rxui";
import {DiagramCtx} from "../Diagram";
import {getPosition} from "@utils";
import css from "./Resizer.less";
import React from "react";
import {ToplViewContext} from "../../ToplView";

export default function Resizer() {
  const {frameModel} = observe(ToplViewContext, {from: 'parents'})
  // const styles = useComputed(() => {
  //   let focusDiagram
  //   if ((focusDiagram = frameModel.focusedDiagram) && focusDiagram.$el) {
  //     const po = getPosition(focusDiagram.$el, frameModel.$el)
  //     const bottom = frameModel.$el.offsetHeight - (po.y + focusDiagram.$el.offsetHeight)
  //     return [{
  //       bottom
  //     }, {
  //       bottom, height: focusDiagram.$el.offsetHeight
  //     }, {
  //       bottom: bottom + 3
  //     }]
  //   }
  // })

  return (
    <>
      <div className={css.resizerB}
           onMouseDown={evt(event => viewResize('h', event)).stop}/>
      <div className={css.resizerR}
           onMouseDown={evt(event => viewResize('w', event)).stop}/>
      <div className={css.resizer}
           onMouseDown={evt(event => viewResize('all', event)).stop}/>
    </>
  )
}

function viewResize(direction, evt) {
  const {emitSnap, frameModel} = observe(ToplViewContext)

  const focusDiagram = frameModel.currentDiagram

  let snap, {x, y, w, h} = getPosition(focusDiagram.$el);

  dragable(evt, ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
    if (state == 'start') {
      snap = emitSnap.start('comResize')
    }
    if (state == 'moving') {
      if (direction == 'h' || direction == 'all') {
        focusDiagram.style.height = h += dy
      }
      if (direction == 'w' || direction == 'all') {
        frameModel.refreshInnerCons(true, 'output')
        frameModel.style.width = w += dx
      }
    }
    if (state == 'finish') {
      snap.commit();
    }
  })
}