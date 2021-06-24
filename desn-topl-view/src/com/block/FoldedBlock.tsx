/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import cssParant from '../ToplCom.less';
import css from './FoldedBlock.less';

import {dragable, evt, observe, useComputed} from '@mybricks/rxui';
import {ComContext, Info, mouseDown} from '../ToplCom';
import React, {useMemo} from "react";
import {ICON_COM_DEFAULT} from "@sdk";
import Joint from "../../joint/Joint";
import {ToplComModel} from "../ToplComModel";
import {PinModel} from "../../pin/PinModel";
import Pin from "../../pin/Pin";
import {refactorCons} from "../util";
import {getPosition} from "@utils";

export default function FoldedBlock({click, dblClick, upgrade}) {
  const comContext = observe(ComContext, {from: 'parents'})
  const {model, comDef} = comContext

  const style = useComputed(() => {
    const inExt = model.inputPinExts, rtInputAry = model.inputPinsInModel
    const outExt = model.outputPinExts, rtOutputAry = model.outputPinsInModel
    const inJoints = model.inputJoints
    const outJoints = model.outputJoints

    const max = Math.max(model.inputPins.length
      + (inExt ? inExt.length : 0)
      + (rtInputAry ? rtInputAry.length : 0)
      + inJoints.length,
      model.outputPins.length
      + (outExt ? outExt.length : 0)
      + (rtOutputAry ? rtOutputAry.length : 0)
      + outJoints.length)

    const pinHeight = max * 17 + 10

    const style = model.style
    const foldedStyle = model.foldedStyle

    return {
      transform: `translate(${style.left}px,${style.top}px)`,
      width: foldedStyle.width,
      height: foldedStyle.height,
      minHeight: pinHeight + 'px'
    }
  })

  const iconSrc = useMemo(() => {
    if (comDef.icon && comDef.icon.toUpperCase().startsWith('HTTP')) {
      return comDef.icon
    }
    return ICON_COM_DEFAULT
  }, [])

  return (
    <div ref={el => el && (model.$el = el)}
         className={`${css.com} 
                     ${model.error ? cssParant.error : ''}
                     ${model.runtime.upgrade ? cssParant.warn : ''}
                     ${model.state.isMoving() ? cssParant.moving : ''}
                     ${model.state.isFocused() ? cssParant.focus : ''}
                     ${model.runtime.labelType === 'todo' ? `${cssParant.labelTodo}` : ''}`}
         style={style}
         onClick={evt(click).stop}
         onDoubleClick={evt(dblClick).stop}
         onMouseDown={evt(mouseDown).stop.prevent}
         onMouseEnter={e => model.state.hover()}
         onMouseLeave={e => model.state.hoverRecover()}>
      <div className={css.title}>
        <div className={css.icon}>
          <img src={iconSrc}/>
        </div>
        <p>{model.runtime.title || comDef.title}</p>
        <p className={css.btns} onClick={evt(unfold).stop}>展开</p>
      </div>

      <Inputs model={model}/>
      <Ouputs model={model}/>
      <Info model={model}/>
      <div className={css.resizer} onMouseDown={evt(comResize).stop.prevent}/>
    </div>
  )
}

function unfold() {
  const {model} = observe(ComContext)
  model.folded = void 0

  setTimeout(() => {
    refactorCons(model)
    model.parent.connections.changed()
  })
}

function comResize(evt) {
  const {context, model, emitSnap} = observe(ComContext)

  let snap,
    parentPo,
    {x, y, w, h} = getPosition(model.$el)

  dragable(
    evt,
    ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
      if (state == 'start') {
        parentPo = getPosition(model.parent.$el)
        snap = emitSnap.start()
      }
      if (state == 'moving') {
        const width = w += dx
        if (width >= 120) {
          model.foldedStyle.width = width
        }
        const height = h += dy
        if (height >= 50) {
          model.foldedStyle.height = height
        }

        model.parent.connections.changing()

        refactorCons(model, true)
      }
      if (state == 'finish') {
        model.parent.connections.changed()
        snap.commit()
      }
    }
  )
}

export function Inputs({model, inputPinAry}:
                         { model: ToplComModel, inputPinAry?: PinModel[] }) {
  const rtn = []

  if (model.inputPins) {
    model.inputPins.forEach(pin => {
      rtn.push(
        <Pin model={pin} key={pin.id}/>
      )
    })
  }

  let definedInAry = model.inputPinsInModel
  if (definedInAry) {
    definedInAry.forEach(pin => {
      rtn.push(
        <Pin model={pin} key={pin.id}/>
      )
    })
  }

  if (inputPinAry) {
    inputPinAry.forEach(pin => {
      rtn.push(
        <Pin model={pin} key={pin.id}/>
      )
    })
  }

  if (model.inputPinExts) {
    model.inputPinExts.forEach(pin => {
      rtn.push(
        <Pin model={pin} key={pin.id}/>
      )
    })
  }

  model.inputJoints.forEach(joint => {
    rtn.push(<Joint key={joint.id} model={joint} folded={true}/>)
  })

  return (
    <div className={css.inputPins}>
      {rtn}
    </div>
  )
}

export function Ouputs({model, outputPinAry}:
                         { model: ToplComModel, outputPinAry?: PinModel[] }) {
  const rtn = []
  if (model.outputPins) {
    model.outputPins.forEach(pin => {
      rtn.push(
        <Pin model={pin} key={pin.id}/>
      )
    })
  }

  if (model.outputPinsInModel) {
    model.outputPinsInModel.forEach(pin => {
      rtn.push(
        <Pin model={pin} key={pin.id}/>
      )
    })
  }

  if (outputPinAry) {
    outputPinAry.forEach(pin => {
      rtn.push(
        <Pin model={pin} key={pin.id}/>
      )
    })
  }

  if (model.outputPinExts) {
    model.outputPinExts.forEach(pin => {
      rtn.push(
        <Pin model={pin} key={pin.id}/>
      )
    })
  }

  model.outputJoints.forEach(joint => {
    rtn.push(<Joint key={joint.id} model={joint} folded={true}/>)
  })

  return (
    <div className={css.outputPins}>
      {rtn}
    </div>
  )
}