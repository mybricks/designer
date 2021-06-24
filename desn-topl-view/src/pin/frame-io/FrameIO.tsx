/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {evt, observe, useComputed} from "@mybricks/rxui";
import css from "./FrameIO.less";
import {HOVER_PIN, PinContext} from "../Pin";

export default function FrameIO({click,mousedown, help}) {
  const {model, context} = observe(PinContext, {from: 'parents'})

  const valueStyle = useComputed(() => {
    return model.direction.match(/^input|inner-output$/gi) ? {right: 12} : {left: 12}
  })

  const classes = useComputed(() => {
    const isRunMode = context.isDebugMode()
    const rtn = [css.pin];
    isRunMode && rtn.push(css.pinDebug)

    if (model.isDirectionOfInput()) {
      rtn.push(css.inputPin)
    } else {
      rtn.push(css.outputPin)
    }

    // if (model.parent.state.isFocused()) {
    //   rtn.push(css.pinHover)
    //   model.direction === 'input' && rtn.push(css.inputPinHover)
    //   model.direction === 'output' && rtn.push(css.outputPinHover)
    // }

    ;(model.state.isFocused() || model.state.isHovering()) && rtn.push(css.pinFocus);
    model.state.isRunning() && isRunMode && rtn.push(css.pinRunning);
    model.hint && rtn.push(css.hint);

    model.direction === 'input' && model.conAry.length && rtn.push(css.connected);

    return rtn.join(' ')
  })

  const exeVal = useComputed(() => {
    if (model.exe !== void 0) {
      const exeValue = model.exe.val
      let rtn
      if (typeof exeValue === 'object') {
        if (Array.isArray(exeValue)) {
          rtn = '[...]'
        } else {
          rtn = '{...}'
        }
      } else {
        rtn = JSON.stringify(exeValue)
      }
      return (
        <div className={css.pinValue} style={valueStyle}
             onClick={evt(click).stop}>
          <p style={{float: model.direction.match(/^input|inner-output$/gi) ? 'right' : null}}>
            {rtn}
          </p>
        </div>
      )
    }
  })

  return (
    <div id={model.id} ref={ele => model.$el = ele}
         className={classes}
         onMouseOver={e => HOVER_PIN.set(model, e.target)}
         onMouseOut={e => HOVER_PIN.clear()}
         onClick={evt(click).stop}
         onMouseDown={evt(mousedown).stop.prevent}>
      {/*<a className={css.pinLine} style={stylePinLine}>*/}
      {/*  <div className={css.hintShow}/>*/}
      {/*  <p/>*/}
      {/*</a>*/}
      <div className={css.pinTitle}>
        <p>
          <span className={css.title}>{model.title}</span>
          {model.state.isFocused() && model.isDirectionOfInput() ?
            (<span className={css.help} onClick={evt(help).stop}>连接到..</span>)
            : null}
        </p>
      </div>
      {exeVal}
    </div>
  )
}

function click(e) {
  const {model, emitComponent, emitSnap, context} = observe(PinContext)

  emitComponent.focus(model)
}