/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import cssParant from '../ToplCom.less';
import css from './UnfoldedBlock.less';

import {evt, observe, useComputed} from '@mybricks/rxui';
import {ComContext, Info, Inputs, mouseDown, Outputs} from '../ToplCom';
import Frame from '../../frame/Frame';
import {useMemo} from "react";
import {ICON_COM_DEFAULT} from "@sdk";
import {refactorCons} from "../util";

export default function Block({click, dblClick, upgrade}) {
  const comContext = observe(ComContext, {from: 'parents'})
  const {model, comDef} = comContext

  const style = useComputed(() => {
    const inExt = model.inputPinExts, rtInputAry = model.inputPinsInModel
    const outExt = model.outputPinExts, rtOutputAry = model.outputPinsInModel
    const max = Math.max(model.inputPins.length
      + (inExt ? inExt.length : 0)
      + (rtInputAry ? rtInputAry.length : 0),
      model.outputPins.length
      + (outExt ? outExt.length : 0)
      + (rtOutputAry ? rtOutputAry.length : 0))

    let pinHeight = max * 17 + 10;

    let sty = model.style;

    let framesHeight = 0
    if (model.frames?.length > 0) {
      model.frames.forEach(frame => {
        framesHeight += frame.style.height || 50
      })
      if (framesHeight < pinHeight) {
        model.frames[0].style.height = pinHeight
      }
    }

    return {
      transform: `translate(${sty.left}px,${sty.top}px)`,
      width: sty.width ? sty.width + 'px' : null,
      height: Math.max(framesHeight, pinHeight) + 'px'
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
                     ${model.state.isFocused() ? css.focus : ''}
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
        <p className={css.btns} onClick={evt(fold).stop}>折叠</p>
      </div>
      <div className={css.frames}>
        {
          model.frames.map(frame => {
            return <Frame key={frame.id} model={frame} show={true}/>
          })
        }
      </div>
      <Inputs model={model}/>
      <Outputs model={model}/>
      <Info model={model}/>
    </div>
  )
}

function fold() {
  const {model, context, emitItem, emitSnap} = observe(ComContext)
  model.folded = true
  setTimeout(()=>{
    refactorCons(model)
    model.parent.connections.changed()
  })
}