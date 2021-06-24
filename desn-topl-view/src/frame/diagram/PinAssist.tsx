/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './PinAssist.less'

import {observe, useComputed, useObservable} from "@mybricks/rxui";
import {useMemo} from "react";
import {PinModel} from "../../pin/PinModel";
import {ComSeedModel, DesignerContext, ICON_COM_DEFAULT, NS_Emits, NS_XGraphComLib, T_XGraphComDef} from "@sdk";
import {ToplComModel} from "../../com/ToplComModel";
import {Arrays, getPosition, wrapWheel} from "@utils";
import FrameModel from "../FrameModel";
import {ModuleModel} from "../../com/module/ModuleModel";
import DialogToplViewModel from "../DialogToplViewModel";

class MyCtx {
  type: 'outputs' | 'inputs'

  title: string

  frameModel: FrameModel

  pinModel: PinModel

  style: {
    display: 'block' | 'none'
    left: number
    top: number
  }

  context: DesignerContext

  emitComponent: NS_Emits.Component

  emitViews: NS_Emits.Views

  isDirectionOfInput() {
    return this.pinModel && this.pinModel.isDirectionOfInput()
  }
}

type T_Param = {
  type: 'outputs' | 'inputs'
  frameModel: FrameModel
  pinModel: PinModel
  position: {
    x: number,
    y: number
  }
}

export default function PinAssist({type, frameModel, pinModel, position, onComplete}: T_Param) {
  const context = observe(DesignerContext, {from: 'parents'})
  const emitComponent = useObservable(NS_Emits.Component, {expectTo: 'parents'})
  const emitViews = useObservable(NS_Emits.Views, {expectTo: 'parents'})

  const myCtx = useObservable(MyCtx, next => next({
    type, frameModel, pinModel, style: {
      display: 'block',
      left: position.x,
      top: position.y
    },
    emitComponent,
    emitViews,
    context
  }), {to: 'children'}, [type])

  const content = useComputed(() => {
    if (myCtx.type === 'inputs') {
      return (
        <>
          <div className={css.title}>
            <span>
              选择组件...
            </span>
            {/*<p>*/}
            {/*  关于该{myCtx.title}的建议*/}
            {/*</p>*/}
          </div>
          <ul className={css.content}>
            {
              <InputComs/>
            }
          </ul>
        </>
      )
    } else {
      return (
        <>
          <div className={css.title}>
            <span>
              从以下组件开始...
            </span>
          </div>
          <ul className={css.content}>
            {
              <OutputComs onComplete={onComplete}/>
            }
          </ul>
        </>
      )
    }
  })

  return (
    <div className={css.bg}>
      <div className={css.assist} style={myCtx.style}>
        {content}
      </div>
    </div>
  )
}

function InputComs() {
  const {frameModel, pinModel, context} = observe(MyCtx, {from: 'parents'})

  const module: { com: ToplComModel, inputPins: PinModel[] }[] = useComputed(() => {
    const coms: { com: ToplComModel, inputPins: PinModel[] }[] = []
    if (frameModel._rootF && frameModel.parent) {//module
      const module = frameModel.parent

      const rins = frameModel.outputPins
      if (rins && rins.length > 0) {
        coms.push({
          com: module,
          inputPins: rins
        })
      }
    }

    return coms
  })

  const coms: { com: ToplComModel, inputPins: PinModel[] }[] = useComputed(() => {
    const coms: { com: ToplComModel, inputPins: PinModel[] }[] = []

    if (frameModel.comAry) {
      frameModel.comAry.forEach(com => {
        if (com.runtime.hasUI()) {
          const ins = com.getInputsAll()
          if (ins) {
            const rins = []
            Arrays.each<PinModel>(pin => {
              rins.push(pin)
            }, ...ins)
            if (rins.length > 0) {
              coms.push({
                com,
                inputPins: rins
              })
            }
          }
        }
      })
    }
    return coms
  })

  const calculateComs: T_XGraphComDef[] = useMemo(() => {
    const rtn: T_XGraphComDef[] = []

    if (context.comLibAry) {
      context.comLibAry.forEach(lib => {
        if (lib.visible !== false && lib.comAray) {
          lib.comAray.forEach(comDef => {
            if (comDef.rtType && comDef.rtType.match(/js|scratch/gi)) {
              rtn.push(comDef)
            }
          })
        }
      })
    }

    return rtn
  }, [])

  const connectedPins = {}
  if (pinModel.conAry) {
    pinModel.conAry.forEach(con => {
      connectedPins[con.finishPin.parent.id + con.finishPin.hostId] = 1
    })
  }

  const jsxAry = []


  // const dialogOutputs: { inputPins: PinModel[] }[] = useComputed(() => {
  //   const coms: { comDef:T_XGraphComDef,inputPins: PinModel[] }[] = []
  //   if (frameModel instanceof DialogToplViewModel) {//dialog
  //
  //
  //     if (rins && rins.length > 0) {
  //       coms.push({
  //         comDef,
  //         inputs: comDef.inputs
  //       })
  //     }
  //   }
  //   return coms
  // })

  if (calculateComs.length > 0) {
    jsxAry.push(
      <div key={'normal'} className={css.com}>
        <div className={css.comTitle}>常用计算</div>
        {
          calculateComs.map(def => {
            return (
              <div key={def.namespace}
                    className={css.pinEnable}
                    onClick={e => genLogicComInput(def)}>
                {/*<img className={css.comIcon}*/}
                {/*     src={def.icon || ICON_COM_DEFAULT}*/}
                {/*/>*/}
              {def.title}
            </div>)
          })
        }
      </div>
    )
  }

  if (frameModel instanceof DialogToplViewModel) {
    const comDef = context.getComDef(NS_XGraphComLib.coms.dialogInputs)
    if (comDef.inputs) {
      jsxAry.push(
        <div key={'return'} className={css.com}>
          <div className={css.comTitle}>
            当前对话框<span className={css.tip}>(返回)</span>
          </div>
          {
            comDef.inputs.map(input => {
              return (
                <span key={input.id}
                      className={`${css.pinEnable}`}
                      onClick={e => genDialogInput(comDef, input)}>
              {input.title}
            </span>)
            })
          }
        </div>
      )
    }
  }

  if (module.length > 0) {
    module.forEach(({com, inputPins}) => {
      jsxAry.push(
        <div key={com.id} className={css.com}>
          <div className={css.comTitle}>
            {com.runtime.title}<span className={css.tip}>(当前模块)</span>
          </div>
          {
            inputPins.map(pin => {
              const hadConnected = connectedPins[com.id + pin.hostId]
              return (
                <span key={pin.id}
                      className={`${hadConnected ? css.pinDisabled : css.pinEnable}`}
                      onClick={e => !hadConnected && genModuleInput(com, pin)}>
              {pin.title}
            </span>)
            })
          }
        </div>
      )
    })
  }

  // const msg = matchSchema(pinModel.schema, pin.schema)
  // if (msg === true) {
  //   rins.push(pin)
  // }

  coms.forEach(({com, inputPins}) => {
    jsxAry.push(
      <div key={com.id} className={css.com}>
        <div className={css.comTitle}>{com.runtime.title}</div>
        {
          inputPins.map(pin => {
            const hadConnected = connectedPins[com.id + pin.hostId]
            return (
              <span key={pin.id}
                    className={`${hadConnected ? css.pinDisabled : css.pinEnable}`}
                    onClick={e => !hadConnected && genInput(com, pin)}>
              {pin.title}
            </span>)
          })
        }
      </div>
    )
  })

  return jsxAry
}

function genDialogInput(comDef: T_XGraphComDef, inputPin) {
  const {pinModel, frameModel, emitComponent, emitViews, context} = observe(MyCtx)

  const curDiagram = frameModel.currentDiagram

  const instanceModel = new ComSeedModel({
      namespace: comDef.namespace,
      rtType: comDef.rtType
    }
  )

  const com = new ToplComModel(instanceModel, comDef, {inputs: [inputPin.id]})

  let position
  if (pinModel.parent instanceof ToplComModel) {
    const style = pinModel.parent.style
    position = {
      x: (style.left || 0) + 200,
      y: style.top || 50
    }
  } else {//IO in frame
    position = {
      x: 200,
      y: 50
    }
  }

  const addedComModel = curDiagram.addCom(com, position)
  addedComModel.runtime.title = inputPin.title

  setTimeout(v => {
    const pin = Arrays.find(pin => {
        return pin.hostId === inputPin.id
      },
      ...addedComModel.getInputsAll())

    const conModel = curDiagram.addConnection(pinModel, pin)
    emitComponent.connected(conModel)

    //emitItem.focus(addedModel)//Focus again
  })
}

function OutputComs({onComplete}) {
  const {frameModel, context} = observe(MyCtx, {from: 'parents'})

  const calculateComs: T_XGraphComDef[] = useMemo(() => {
    const rtn: T_XGraphComDef[] = []

    if (context.comLibAry) {
      context.comLibAry.forEach(lib => {
        if (lib.visible !== false && lib.comAray) {
          lib.comAray.forEach(comDef => {
            if (comDef.rtType && comDef.rtType.match(/js|scratch/gi)) {
              rtn.push(comDef)
            }
          })
        }
      })
    }

    return rtn
  }, [])

  const jsxAry = []

  if (calculateComs.length > 0) {
    jsxAry.push(
      <div key={'normal'} className={css.com}>
        <div className={css.comTitle}>计算组件</div>
        {
          calculateComs.map(def => {
            return (
              <div key={def.namespace}
                   className={css.pinEnable}
                   onClick={e => genLogicComInput(def)}>
                {/*<img className={css.comIcon}*/}
                {/*     src={def.icon || ICON_COM_DEFAULT}*/}
                {/*/>*/}
                {def.title}
              </div>)
          })
        }
      </div>
    )
  }

  //
  // const coms: { com: ToplComModel, outputPins: PinModel[] }[] = useComputed(() => {
  //   const coms: { com: ToplComModel, outputPins: PinModel[] }[] = []
  //
  //   if (frameModel.comAry) {
  //     frameModel.comAry.forEach(com => {
  //       if (com.runtime.hasUI()) {
  //         const outs = com.getOutputsAll()
  //         const routs = []
  //         Arrays.each(pin => {
  //           routs.push(pin)
  //         }, ...outs)
  //
  //         if (routs.length > 0) {
  //           coms.push({
  //             com,
  //             outputPins: routs
  //           })
  //         }
  //       }
  //     })
  //   }
  //
  //   return coms
  // })

  //
  //
  // coms.forEach(({com, outputPins}) => {
  //   jsxAry.push(
  //     <div key={com.id} className={css.com}>
  //       <div className={css.comTitle}>{com.runtime.title}</div>
  //       {
  //         outputPins.map(pin => {
  //           return (
  //             <span key={pin.id}
  //                   className={css.pinEnable}
  //                   onClick={e => genOutput(com, pin, onComplete)}>
  //             {pin.title}
  //           </span>)
  //         })
  //       }
  //     </div>
  //   )
  // })

  return jsxAry
}

function genOutput(com: ToplComModel, outputPin: PinModel, onComplete: Function) {
  const {frameModel, style} = observe(MyCtx)

  const curDiagram = frameModel.currentDiagram
  const vpo = getPosition(frameModel.$el)
  const dpo = getPosition(curDiagram.$el)

  if (typeof onComplete === 'function') {
    onComplete(com, {outputs: [outputPin.hostId]})
  } else {
    curDiagram.addCom(com, {x: style.left, y: style.top - (dpo.y - vpo.y)}, {outputs: [outputPin.hostId]})
  }
}

function genModuleInput(module: ModuleModel, inputPin: PinModel) {
  const {pinModel, frameModel, emitComponent, emitViews, context} = observe(MyCtx)

  const curDiagram = frameModel.currentDiagram

  const comDef = context.getComDef({namespace: NS_XGraphComLib.coms.moduleJoiner})
  const instanceModel = new ComSeedModel({
      namespace: comDef.namespace,
      rtType: comDef.rtType,
      data: {outputId: inputPin.id}
    }
  )

  const com = new ToplComModel(instanceModel, comDef)

  //frameModel.addComponent(com)

  let position
  if (pinModel.parent instanceof ToplComModel) {
    const style = pinModel.parent.style
    position = {
      x: (style.left || 0) + 200,
      y: style.top || 50
    }
  } else {//IO in frame
    position = {
      x: 200,
      y: 50
    }
  }

  const addedComModel = curDiagram.addCom(com, position)
  addedComModel.runtime.title = inputPin.title

  const defInputs = comDef.inputs

  if (defInputs && defInputs.length > 0) {
    setTimeout(v => {
      const pin = Arrays.find(pin => {
          return pin.hostId === defInputs[0].id
        },
        ...addedComModel.getInputsAll())

      const conModel = curDiagram.addConnection(pinModel, pin)
      emitComponent.connected(conModel)

      //emitItem.focus(addedModel)//Focus again
    })
  }
}

function genInput(com: ToplComModel, inputPin: PinModel) {
  const {pinModel, frameModel, emitComponent, emitViews, context} = observe(MyCtx)

  const curDiagram = frameModel.currentDiagram

  let position
  if (pinModel.parent instanceof ToplComModel) {
    const style = pinModel.parent.style
    position = {
      x: (style.left || 0) + 200,
      y: style.top || 50
    }
  } else {//IO in frame
    position = {
      x: 200,
      y: 50
    }
  }

  const addedModel = curDiagram.addCom(com, position, {inputs: [inputPin.hostId], outputs: inputPin.rels})

  setTimeout(v => {
    const pin = Arrays.find(pin => {
        return pin.hostId === inputPin.hostId
      },
      ...addedModel.getInputsAll())

    const conModel = curDiagram.addConnection(pinModel, pin)
    emitComponent.connected(conModel)

    //emitItem.focus(addedModel)//Focus again
  }, 100)
}


function genLogicComInput(comDef: T_XGraphComDef) {
  const {pinModel, frameModel, emitComponent, emitViews, context} = observe(MyCtx)

  const curDiagram = frameModel.currentDiagram

  const instanceModel = new ComSeedModel({
      namespace: comDef.namespace,
      rtType: comDef.rtType,
      data: JSON.parse(JSON.stringify(comDef.data || {}))
    }
  )

  const com = new ToplComModel(instanceModel, comDef)

  //frameModel.addComponent(com)

  let position
  if (pinModel&&pinModel.parent instanceof ToplComModel) {
    const style = pinModel.parent.style
    position = {
      x: (style.left || 0) + 200,
      y: style.top || 50
    }
  } else {//IO in frame
    position = {
      x: 200,
      y: 50
    }
  }

  const addedModel = curDiagram.addCom(com, position)

  if(pinModel){
    const defInputs = comDef.inputs

    if (defInputs && defInputs.length > 0) {
      setTimeout(v => {
        const pin = Arrays.find(pin => {
            return pin.hostId === defInputs[0].id
          },
          ...addedModel.getInputsAll())

        const conModel = curDiagram.addConnection(pinModel, pin)
        emitComponent.connected(conModel)

        //emitItem.focus(addedModel)//Focus again
      }, 100)
    }
  }
}