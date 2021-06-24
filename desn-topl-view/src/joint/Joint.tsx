/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './Joint.less'
import {dragable, evt, observe, useComputed, useObservable} from "@mybricks/rxui";
import {DesignerContext, NS_Emits} from "@sdk";
import {JointModel} from "./JointModel";
import {getPosition} from "@utils";
import {PinModel} from "../pin/PinModel";

class JointContext {
  context: DesignerContext
  model: JointModel
  emitItem: NS_Emits.Component
  emitSnap: NS_Emits.Snap
}

export default function Joint({model, folded}: { model: JointModel, folded: boolean }) {
  const emitSnap = useObservable(NS_Emits.Snap, {expectTo: 'parents'})
  const emitItem = useObservable(NS_Emits.Component, {expectTo: 'parents'})
  const context = observe(DesignerContext, {from: 'parents'})

  useObservable(JointContext, next => next({model, context, emitSnap, emitItem}))

  const valueStyle = useComputed(() => {
    return model.type.match(/^input$/gi) ? {right: 12} : {left: 12}
  })

  const exeVal = useComputed(() => {
    if (model.exeValue !== void 0) {
      let rtn
      if (typeof model.exeValue === 'object') {
        if (Array.isArray(model.exeValue)) {
          rtn = '[...]'
        } else {
          rtn = '{...}'
        }
      } else {
        rtn = JSON.stringify(model.exeValue)
      }
      return rtn
    }
  })

  const title = useComputed(() => {
    if (folded) {
      if (model.type === 'input') {
        if(model.to){
          let fpin = model.to.finishPin
          if (fpin instanceof JointModel) {
            while (fpin = fpin.to.finishPin) {
              if (fpin instanceof PinModel) {
                break
              }
            }
          }

          return `${fpin.parent.runtime.title}：${fpin.title}`
        }
      } else {
        if(model.from){
          let fpin = model.from.startPin
          if (fpin instanceof JointModel) {
            while (fpin = fpin.from.startPin) {
              if (fpin instanceof PinModel) {
                break
              }
            }
          }

          return `${fpin.parent.runtime.title}：${fpin.title}`
        }
      }
    }
  })

  return (
    <div ref={ele => ele && (model.$el = ele)}
         className={`${css.joint} 
                     ${folded ? css.folded : ''}
                     ${model.state.isFocused() ? css.focus : ''} 
                     ${model.state.isRunning() ? css.running : ''}`}
         style={folded ? null : {top: model.position.y}}
         onMouseDown={evt(resizeH).stop.prevent}>
      <div className={model.type === 'input' ? css.input : css.output}>
        <p>
          {title}
        </p>
      </div>

      <div className={css.pinValue} style={{right: 12}}>
        <p style={{float: 'right'}}>
          {exeVal}
        </p>
      </div>
    </div>
  )
}

function resizeH(evt) {
  const {context, emitItem, emitSnap, model} = observe(JointContext)

  let snap,
    parentPo,
    {x, y, w, h} = getPosition(model.$el)

  // let refreshCon = (temp?: boolean) => {
  //   let frames = comModel.frames as Array<FrameModel>
  //   if (frames) {
  //     frames.forEach(frame => {
  //       frame.refreshInnerCons(temp)
  //     })
  //   }
  // }

  dragable(
    evt,
    ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
      if (state == 'start') {
        parentPo = getPosition(model.parent.$el)
        snap = emitSnap.start()
      }
      if (state == 'moving') {
        model.parent.connections.changing()
        model.position.y += dy
        model.parent.refreshJoints(true)
      }
      if (state == 'finish') {
        model.parent.connections.changed()
        //refreshCon()
        snap.commit()
      }
    }
  )
}