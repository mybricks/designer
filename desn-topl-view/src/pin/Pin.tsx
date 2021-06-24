/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {PinModel} from './PinModel';
import {dragable, observe, useComputed, useObservable} from '@mybricks/rxui';
import {canConnectTo, getPosition} from '@utils';
import {ConModel} from '../con/ConModel';
import {DesignerContext, NS_Configurable, NS_Emits} from '@sdk';
import FrameModel from '../frame/FrameModel';
import {JointModel} from '../joint/JointModel';
import {createConModel, getChild} from '../ToplUtil';
import {useMemo} from "react";
import {get as getConfigurable} from "./configrable";
import {ToplViewContext} from "../frame/ToplView";
import NormalPin from "./normal/Normal";
import FrameIO from "./frame-io/FrameIO";
import {ComContext} from "../com/ToplCom";
import DiagramModel from "../frame/diagram/DiagramModel";
import Start from "./start/Start";
import {ToplComModel} from "../com/ToplComModel";
import I_Configurable = NS_Configurable.I_Configurable;

require('./PinModelForked')

export class PinContext {
  context: DesignerContext
  viewContext: ToplViewContext
  comContext: ComContext
  model: PinModel
  emitComponent: NS_Emits.Component
  emitSnap: NS_Emits.Snap
}

export const HOVER_PIN = {
  model: void 0,
  ele: void 0,
  set(model: PinModel, ele) {
    this.model = model
    this.ele = ele
  },
  clear() {
    this.model = void 0
    this.ele = void 0
  }
}

export default function Pin({model, type}: { model: PinModel, type?: undefined | 'frameIO' | 'start' }) {
  const emitSnap = useObservable(NS_Emits.Snap, {expectTo: 'parents'})
  const emitComponent = useObservable(NS_Emits.Component, {expectTo: 'parents'})
  const context = observe(DesignerContext, {from: 'parents'})

  const comContext = observe(ComContext, {from: 'parents'})

  const viewContext = observe(ToplViewContext, {from: 'parents'})
  const pinContext = useObservable(PinContext, next => {
    next({
      model,
      context,
      comContext,
      viewContext,
      emitSnap,
      emitComponent
    })
  }, {to: 'children'})

  useMemo(() => {
    ;(model as I_Configurable).getConfigs = function () {
      return getConfigurable(pinContext)
    }
  }, [])

  useComputed(() => {
    if (context.isDesnMode()) {
      model.state.enable()
      model.exe = void 0
    }
  })

  // useWatcher(model, 'state.now', (prop, val, preVal) => {
  //   if (model.state.isFocused()) {
  //     if (viewContext.config?.connectionValidate === true) {
  //       emitTopl.hintPins(model)
  //     }
  //   }
  // })

  // useEffect(() => {
  //   _2020_11_09.pin(model)
  // }, [])

  if (type && type === 'frameIO') {
    return <FrameIO click={click} mousedown={mousedown} help={help}/>
  }
  else if (type && type === 'start') {
    return <Start click={click} mousedown={mousedown} help={help}/>
  }
  else {
    return <NormalPin click={click} mousedown={mousedown} help={help}/>
  }
}

//Global focus PinModel
let focusPin: PinModel;

export function click(e) {
  const {model, emitComponent, emitSnap, context, comContext} = observe(PinContext)

  if (context.isDesnMode()) {
    if (focusPin && focusPin !== model && focusPin.state.isFocused()) {
      if ((focusPin.direction == 'output' || focusPin.direction == 'inner-output') &&
        (model.direction == 'input' || model.direction == 'inner-input')) {
        connect(focusPin, emitSnap.start('add-connection'))
      }
    }
    focusPin = model
  }

  emitComponent.focus(model)

  // if (context.isDesnMode()) {
  //   emitComponent.hintPins(model)
  // }
}

function mousedown(e) {
  const {model, emitSnap, comContext} = observe(PinContext)

  // const {wrapper} = comContext

  if (model.direction != 'output' && model.direction != 'inner-output') {
    return
  }

  let snap, viewPo, startPo, tmpCon: ConModel //In root view

  const rootFrame: FrameModel = model.getRoot(now => !now.parent || now instanceof FrameModel && now._rootF)

  const rootContainer: FrameModel | DiagramModel = rootFrame.currentDiagram || rootFrame

  dragable(e, ({po: {x, y}, epo: {ex, ey}, targetStyle}, state) => {
      if (state == 'start') {
        viewPo = getPosition(rootContainer.$el)
        startPo = {
          x: targetStyle.x + targetStyle.w - viewPo.x,
          y: targetStyle.y + targetStyle.h / 2 - viewPo.y,
          j: PinModel.joinerWidth
        }

        model.hover = false

        tmpCon = rootContainer.addConnection(ConModel.create(model, startPo), true)
        tmpCon.connecting()
      }

      if (state == 'moving') {
        tmpCon.finishPo = {
          x: ex - viewPo.x - 7, //Easy to find hovering pin
          y: ey - viewPo.y,
          j: PinModel.joinerWidth //Default value
        }
      } else if (state == 'finish') {
        tmpCon.destroy()

        if (HOVER_PIN.ele) {
          snap = emitSnap.start('move pin')
          connect(model, snap)
        }
      }
    }
  )
}

function help() {
  const {model, emitComponent} = observe(PinContext)
  emitComponent.assistWithPin(model)
}

function connect(from: PinModel, snap) {
  const {ele: toEle, model: to} = HOVER_PIN

  const {context, comContext, model, emitComponent, emitSnap} = observe(PinContext)

  if (context.isDebugMode()) {
    emitComponent.focus(model)
    return
  }

  if (to && (to.direction == 'input' || to.direction == 'inner-input')) {
    if (!from.hadConToPin(to)) {
      // if (typeof to.conMax === 'number') {
      //   if (to.conAry && to.conAry.length + 1 > to.conMax) {
      //     return
      //   }
      // }

      from.hover = false

      const fromEle = from.$el as HTMLElement

      const fromPo = getPosition(fromEle),
        fromSe = {w: fromEle.offsetWidth, h: fromEle.offsetHeight},
        toPo = getPosition(toEle),
        toSe = {w: toEle.offsetWidth, h: toEle.offsetHeight};

      let fromFrame:FrameModel
      if(from.parent instanceof FrameModel){
        fromFrame = from.parent
      }else{
        const com:ToplComModel = from.parent
        if(com.parent instanceof DiagramModel){
          fromFrame = com.parent.parent
        }else{
          fromFrame = com.parent
        }
      }

      const fromContainer: FrameModel | DiagramModel = fromFrame.currentDiagram || fromFrame
      const fromFramePo = getPosition(fromContainer.$el)

      let toFrame:FrameModel
      if(to.parent instanceof FrameModel){
        toFrame = to.parent
      }else{
        const com:ToplComModel = to.parent
        if(com.parent instanceof DiagramModel){
          toFrame = com.parent.parent
        }else{
          toFrame = com.parent
        }
      }

      const toContainer = toFrame.currentDiagram || toFrame
      //console.log(toFrame.focusDiagram)
      const toFramePo = getPosition(toContainer.$el)

      const childFrame = getChild(fromFrame, toFrame);

      if (childFrame !== void 0) { //In different frame
        let tmpCon = fromContainer.addConnection(ConModel.create(from, {
          x: fromPo.x + fromSe.w - fromFramePo.x,
          y: fromPo.y + fromSe.h / 2 - fromFramePo.y,
          j: from.getJoinerWidth()
        }))
        tmpCon.finishPo = {
          x: toPo.x - fromFramePo.x,
          y: toPo.y + toSe.h / 2 - fromFramePo.y,
          j: to.getJoinerWidth()
        }

        if (childFrame === fromFrame) {//drag out
          let joints = [[fromFrame, from]], curFrame: FrameModel = fromFrame
          do {
            joints.push([curFrame, curFrame.addOutputJoint() as any])
            curFrame = curFrame.parent.parent as FrameModel;
          } while (curFrame.id !== toFrame.id)

          joints.push([toFrame, to])

          setTimeout(() => {//wait for joints rendered
            let pre;
            joints.forEach((now, idx) => {
              if (idx == 0) {
                pre = now
              } else {
                let frame = now[0] as FrameModel
                const con = frame.addConnection(createConModel(pre[1], now[1] as any, frame.$el))
                emitComponent.connected(con)
                pre = now;
              }
            })
            snap.commit()
          })
        } else {//drag in
          let joints = [[toFrame, to]], curFrame: FrameModel = toFrame
          do {
            joints.push([curFrame, curFrame.addInputJoint() as any])
            curFrame = curFrame.parent.parent as FrameModel;
          } while (curFrame.id !== fromFrame.id)

          joints.push([fromFrame, from])

          setTimeout(() => {//Waiting for joints rendered
            let pre;
            joints.forEach((now, idx) => {
              if (idx == 0) {
                pre = now
              } else {
                const frame = now[0] as FrameModel
                const con = frame.addConnection(createConModel(now[1] as any, pre[1], frame.$el))
                emitComponent.connected(con)
                pre = now;
              }
            })
            snap.commit()
          })
        }
        tmpCon.destroy()
      } else {
        let conInfo
        // if (viewContext.config?.connectionValidate === false) {
        //   conInfo = true
        // }
        if (conInfo === void 0) {
          conInfo = canConnectTo(from, to)
        }

        const con = toContainer.addConnection(
          ConModel.create(from, {
            x: fromPo.x + fromSe.w - fromFramePo.x,
            y: fromPo.y + fromSe.h / 2 - fromFramePo.y,
            j: from.getJoinerWidth()
          }, to, {
            x: toPo.x - toFramePo.x + 2,//For arrow
            y: toPo.y + toSe.h / 2 - toFramePo.y,
            j: to.getJoinerWidth()
          })
        )

        emitComponent.connected(con)

        snap.commit()
        setTimeout(() => {
          emitComponent.focus(con)
        })

        if (conInfo !== true) {
          con.errorInfo = conInfo
        }
        con.parent.connections.changed()
      }
    } else {
      snap.cancel()
    }
  } else {
    snap.cancel()
  }
}

function connectStep(from: PinModel | JointModel,
                     fromPo,
                     curFrame: FrameModel,
                     //parentFrame: FrameModel,
                     type: 'in' | 'out') {
  let jointPo, joint: JointModel;
  if (type == 'in') {
    joint = curFrame.addInputJoint()
  } else if (type == 'out') {
    joint = curFrame.addOutputJoint()
  }
  jointPo = joint.position

  if (type == 'out') {//drag out
    curFrame.addConnection(
      ConModel.create(
        from,
        fromPo,
        joint,
        {
          x: joint.getJoinerWidth(),
          y: jointPo.y
        }
      )
    )
  }
  return joint
}
