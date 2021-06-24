import css from './Frame.less'
import FrameModel from './FrameModel';
import ToplCom, {ComContext} from '../com/ToplCom';
import Pin from '../pin/Pin';
import Joint from "../joint/Joint";
import React, {useEffect} from "react";
import ConView from "../con/ConView";
import {dragable, evt, observe, useComputed, useObservable} from "@mybricks/rxui";
import {getPosition} from "@utils";
import {refactorCons} from "../com/util";
import {validateCurFrame} from "./validate";

class MyCtx {
  comContext: ComContext
  model: FrameModel
}

export default function Frame({model, show}: { model: FrameModel, show: boolean }) {
  const comContext = observe(ComContext, {from: 'parents'})

  useObservable(MyCtx, next => next({
    comContext, model
  }))

  useEffect(() => {
    validateCurFrame(model, comContext.viewContext)
  }, [])

  // if(model.inputJoints.length>0){
  //   debugger
  // }
  const title = useComputed(() => {
    if (model.title) {
      return (
        <div className={css.title}>
          <p>{model.title}</p>
        </div>
      )
    }
  })

  const styles = useComputed(() => {
    return {
      height: model.style.height
    }
  })

  const classes = useComputed(() => {
    const rtn = [css.frame]
    if (!model.editable) {
      rtn.push(css.readonly)
    }
    if (model.state.isHovering()) {
      rtn.push(css.frameHover)
    }
    // if(model.parent.state.isFocused()){
    //   rtn.push(css.focus)
    // }
    return rtn
  })

  return (
    <div ref={ele => ele && (model.$el = ele)}
         style={styles}
         className={classes.join(' ')}>
      <div className={css.body}>
        {
          model.comAry && model.comAry.map(item => {
            return <ToplCom key={item.id} model={item}/>
          })
        }
        <ConView frameModel={model}/>
      </div>
      {title}
      {
        model.inputPins ? (
          <div className={css.inputPins}>
            {model.inputPins.map(pin => (<Pin key={pin.id} model={pin} type='comOuter'/>))}
          </div>
        ) : null
      }
      {
        model.outputPins ? (
          <div className={css.outputPins}>
            {model.outputPins.map(pin => (<Pin key={pin.id} model={pin} type='comOuter'/>))}
          </div>
        ) : null
      }

      {
        model.inputJoints ? (
          <div className={css.inputJoints}>
            {model.inputJoints.map(joint => (<Joint key={joint.id} model={joint}/>))}
          </div>
        ) : null
      }
      {
        model.outputJoints ? (
          <div className={css.outputJoints}>
            {model.outputJoints.map(joint => (<Joint key={joint.id} model={joint}/>))}
          </div>
        ) : null
      }
      <div className={css.resizer} onMouseDown={evt(comResize).stop.prevent}/>
    </div>
  )
}

function comResize(evt) {
  const {comContext, model} = observe(MyCtx)
  const {emitSnap, model: comModel} = comContext

  let snap,
    parentPo,
    {x, y, w, h} = getPosition(model.$el)
  let refreshCon = (temp?: boolean) => {
    let frames = comModel.frames as Array<FrameModel>
    if (frames) {
      frames.forEach(frame => {
        frame.refreshInnerCons(temp)
      })
    }
  }

  dragable(
    evt,
    ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
      if (state == 'start') {
        parentPo = getPosition(comModel.parent.$el)
        snap = emitSnap.start()
      }
      if (state == 'moving') {
        const width = w += dx
        if (width >= 50) {
          comModel.style.width = width
        }
        const height = h += dy
        if (height >= 50) {
          model.style.height = height
        }

        comModel.frames.forEach(frame => {
          frame.connections.changing()
          frame.refreshJoints(true)
        })

        comModel.parent.connections.changing()

        refactorCons(comModel, true)
        refreshCon(true)
      }
      if (state == 'finish') {
        refreshCon()
        comModel.frames.forEach(frame => {
          frame.connections.changed()
        })
        comModel.parent.connections.changed()
        snap.commit()
      }
    }
  )
}
