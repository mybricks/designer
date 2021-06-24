//2020-8-31
import {PinModel} from "./pin/PinModel";
import FrameModel from "./frame/FrameModel";
import {Arrays} from "@utils";
import {ToplViewContext} from "./frame/ToplView";
import ToplComModelForked from "./com/ToplComModelForked";


export const _2020_12_1 = (function () {
  const ProcessedFrames = new WeakSet()

  let viewCtx: ToplViewContext
  let rootFrame: FrameModel

  const logs = []

  return {
    frame(frameModel: FrameModel, _viewCtx: ToplViewContext) {
      if (ProcessedFrames.has(frameModel)) {
        return
      }
      viewCtx = _viewCtx
      rootFrame = frameModel


      doFrame(frameModel)

      if (logs.length > 0) {
        viewCtx.emitLogs.warn('兼容处理', `处理连接重复及相关清理工作.`)
        logs.forEach(log => {
          viewCtx.emitLogs.warn(log[0], log[1])
        })
        viewCtx.emitLogs.warn('兼容处理', `处理完成.`)
      }
    }
  }

  function doFrame(frameModel: FrameModel) {
    if (ProcessedFrames.has(frameModel)) {
      return
    }
    ProcessedFrames.add(frameModel)

    frameModel.diagramAry.forEach(diagram => {
      diagram.comAry = diagram.comAry.map(com => {
        if (com instanceof ToplComModelForked) {
          if (!frameModel.comAry.find(tc => tc.id === com.forkedFrom.id)) {
            logs.push(['兼容处理', `清理无效组件 ${com.runtime.title}(${com.runtime.def.namespace}).`])
            return void 0
          }
          return com
        }
        return com
      }).filter(com => com)
    })

    frameModel.comAry.forEach(com => {
      if (com.frames) {
        com.frames.forEach(frame => doFrame(frame))
      }
    })
  }
})()


export const _2020_11_10 = (function () {
  const ProcessedFrames = new WeakSet()


  let viewCtx: ToplViewContext
  let rootFrame: FrameModel

  function doPin(pin: PinModel) {
    if (pin.conAry) {
      const ncons = []
      pin.conAry.forEach((con, i) => {
        if (!(con.startPin instanceof PinModel) || !(con.finishPin instanceof PinModel)) {
          viewCtx.emitLogs.warn('兼容处理', `删除无效连接(${con.title}).`)
          rootFrame.delete(con)
          return
        }
        if (ncons.find(tcon => tcon.startPin.id === con.startPin.id && tcon.finishPin.id === con.finishPin.id)) {
          viewCtx.emitLogs.warn('兼容处理', `删除重复连接(${con.title}).`)
          rootFrame.delete(con)
          return
        }
        ncons.push(con)
      })
      pin.conAry = ncons
    }
  }

  function doFrame(frameModel: FrameModel) {
    if (ProcessedFrames.has(frameModel)) {
      return
    }
    ProcessedFrames.add(frameModel)

    Arrays.each<PinModel>(pin => {
      doPin(pin)
    }, frameModel.inputPins, frameModel.outputPins)

    if (frameModel.comAry) {
      frameModel.comAry.forEach(com => {
        Arrays.each<PinModel>(pin => {
          doPin(pin)
        }, ...com.getInputsAll(), ...com.getOutputsAll())

        if (com.frames) {
          com.frames.forEach(nframe => {
            doFrame(nframe)
          })
        }
      })
    }
  }

  return {
    frame(frameModel: FrameModel, _viewCtx: ToplViewContext) {
      if (_viewCtx.context.useLatestFeatures) {
        return
      }
      if (ProcessedFrames.has(frameModel)) {
        return
      }
      viewCtx = _viewCtx
      rootFrame = frameModel

      viewCtx.emitLogs.warn('兼容处理', `处理连接重复及相关清理工作.`)
      doFrame(frameModel)
      viewCtx.emitLogs.warn('兼容处理', `处理完成.`)
    }
  }
})()

// export const _2020_11_09 = (function () {
//   let viewCtx: ToplViewContext
//   let rootFrame: FrameModel
//
//   const hadCons = {}
//   const todoCons = []
//
//   function findPin(con: ConModel, find: 'input' | 'output') {
//     if (find === 'output') {
//       if (con.startPin instanceof PinModel) {
//         return con.startPin
//       } else {
//         return findPin((con.startPin as JointModel).from, find)
//       }
//     } else {
//       if (con.finishPin instanceof PinModel) {
//         return con.finishPin
//       } else {
//         return findPin((con.finishPin as JointModel).to, find)
//       }
//     }
//   }
//
//   function doCom(com: ToplComModel) {
//     if (com.parent !== rootFrame) {
//       const vpo = getPosition(rootFrame.$el)
//       const po = getPosition(com.$el)
//
//       com.style.left = po.x - vpo.x
//       com.style.top = po.y - vpo.y
//
//       rootFrame.addComponent(com)
//     }
//
//     Arrays.each<PinModel>(pin => {
//       pin.id = uuid()
//       pin.conAry = []
//     }, ...com.getInputsAll())
//
//     Arrays.each<PinModel>(pin => {
//       pin.id = uuid()
//       pin.conAry = []
//     }, ...com.getOutputsAll())
//
//
//     if (com.runtime.def.namespace !== XGraphComLib.coms.module) {
//       if (com.frames) {
//         com.frames.forEach(nframe => {
//           doFrame(nframe)
//           if (nframe.comAry) {
//             nframe.comAry.forEach(ncom => {
//               doCom(ncom)
//             })
//           }
//         })
//         com.frames = []
//       }
//     }
//   }
//
//   function doFrame(frameModel: FrameModel) {
//     if (frameModel.inputPins) {
//       frameModel.inputPins.forEach(pin => {
//         pin.id = uuid()
//         pin.conAry = []
//       })
//     }
//
//     if (frameModel.outputPins) {
//       frameModel.outputPins.forEach(pin => {
//         pin.id = uuid()
//         pin.conAry = []
//       })
//     }
//
//     if (frameModel.conAry) {
//       frameModel.conAry.forEach(con => {
//         if (con.startPin instanceof PinModel) {
//           const finishPin = findPin(con, 'input')
//           if (!hadCons[con.startPin.id + '-' + finishPin.id]) {
//             todoCons.push([con.startPin, finishPin])
//             hadCons[con.startPin.id + '-' + finishPin.id] = 1
//           }
//         } else {
//           const startPin = findPin(con, 'output')
//           if (!hadCons[startPin.id + '-' + con.finishPin.id]) {
//             todoCons.push([startPin, con.finishPin])
//             hadCons[startPin.id + '-' + con.finishPin.id] = 1
//           }
//         }
//       })
//       frameModel.conAry = []
//     }
//
//     if (frameModel.comAry) {
//       frameModel.comAry.forEach(com => {
//         doCom(com)
//       })
//     }
//
//     frameModel.schema = SCHEMA_NOW
//   }
//
//   function shouldUpdate(frameModel: FrameModel) {
//     if (frameModel.comAry) {
//       return frameModel.comAry.find(com => {
//         if (com.runtime.def.namespace !== XGraphComLib.coms.module) {
//           if (com.frames && com.frames.length > 0) {
//             return true
//           }
//         }
//       })
//     }
//   }
//
//
//   return {
//     frame(frameModel: FrameModel, _viewCtx: ToplViewContext) {
//       if(_viewCtx.context.useLatestFeatures){
//         return
//       }
//       if (frameModel.schema === SCHEMA_NOW) {
//         return
//       }
//       if (!shouldUpdate(frameModel)) {
//         return
//       }
//
//       viewCtx = _viewCtx
//       rootFrame = frameModel
//
//       viewCtx.emitLogs.warn('兼容处理', `降低框图.`)
//
//       doFrame(frameModel)
//
//       setTimeout(v => {
//         todoCons.forEach(([startPin, finishPin]) => {
//           startPin.$el = document.getElementById(startPin.id)
//           finishPin.$el = document.getElementById(finishPin.id)
//
//           const ncon = ConModel.create0(startPin, finishPin)
//           rootFrame.addConnection(ncon)
//         })
//         rootFrame.connections.changed()
//
//         viewCtx.emitLogs.warn('兼容处理', `处理完成.`)
//       })
//     }
//   }
// })()

//
// const Processed = new WeakSet()
// const StyleSet = new WeakSet()
//
// export const _2020_10_22 = (function () {
//   let toplView: FrameModel
//
//   function doFrame(model: FrameModel) {
//     //console.log(model)
//     if (model['asRoot']) {
//       model._rootF = model['asRoot']
//       model['asRoot'] = void 0
//     }
//     if (Array.isArray(model.itemAry)) {
//       model.itemAry.forEach(item => {
//         if (item instanceof ToplComModel) {
//           model.comAry.push(item)
//           if (item.frames) {
//             item.frames.forEach(frame => {
//               doFrame(frame)
//             })
//           }
//         } else if (item instanceof ConModel) {
//           model.conAry.push(item)
//         }
//       })
//       model.itemAry = void 0
//     }
//     if (Array.isArray(model.comAry)) {
//       model.comAry.forEach(com => {
//         if (com.frames) {
//           com.frames.forEach(frame => {
//             doFrame(frame)
//           })
//         }
//       })
//     }
//   }
//
//   return {
//     frame(model: FrameModel) {
//       toplView = model
//
//       if (model instanceof ToplViewModel) {
//         if (model.inputJoints.length > 0) {
//           model.inputJoints = []//temp
//         }
//       }
//
//       doFrame(model)
//     },
//     toplcom(model: ToplComModel, comDef: T_XGraphComDef) {
//       if (Processed.has(model)) {
//         return
//       }
//       Processed.add(model)
//
//       if (comDef.namespace === XGraphComLib.coms.module) {
//         //gmodel = new SubModuleModel(instanceModel, comDef)
//
//
//         //debugger
//       }
//     }
//   }
// })()
//
// export const _2020_9_27 = (function () {
//   return {
//     view(model: FrameModel) {
//       if (model.itemAry) {
//         model.itemAry.forEach(comModel => {
//           if ((comModel instanceof ToplComModel) && !comModel.runtime.def) {
//             comModel.runtime.def = comModel.def
//           }
//         })
//       }
//     }
//   }
// })()
//
// export const _2020_08_31 = {
//   toplcom(model: ToplComModel, comDef: T_XGraphComDef) {
//     if (Processed.has(model)) {
//       return
//     }
//     Processed.add(model)
//     // if (model instanceof CalComModel) {
//     //   debugger
//     // }
//
//     // if (comDef.namespace === XGDefinedComLib.coms.calculate) {///TODO
//     //   this.calculate(model as CalComModel, comDef)
//     // } else {
//     //   this.normal(model, comDef)
//     // }
//
//     //
//     //
//     // //TODO compatible now
//     // model.inputPins = []
//     // if (comDef.inputs) {
//     //   comDef.inputs.forEach(pin => {
//     //     model.addInputPin(pin.id, pin.title, pin.schema)
//     //   })
//     // }
//     //
//     // model.outputPins = []
//     // if (comDef.outputs) {
//     //   comDef.outputs.forEach(pin => {
//     //     model.addOutputPin(pin.id, pin.title, pin.schema)
//     //   })
//     // }
//   },
//   normal(model: ToplComModel, comDef) {
//     const rtModel = model.runtime.model
//     // if (model.runtime.title?.startsWith('文本排版（过期）')) {
//     //   debugger
//     // }
//     if (rtModel.style) {
//       if (!StyleSet.has(rtModel.style)) {
//         StyleSet.add(rtModel.style)
//       } else {
//         console.warn(`Duplicated style in component(title=${model.runtime.title || comDef.title},namespace=${model.runtime.def.namespace})`)
//         const newStyle = rtModel.style.clone()
//         rtModel.style = newStyle
//       }
//     }
//
//     if (model.inputPins) {
//       const inputExtPinAry = []
//       model.inputPins = model.inputPins.filter(pin => {
//         if (pin.isTypeOfExt()) {
//           inputExtPinAry.push(pin)
//         } else {
//           return true
//         }
//       })
//       if (inputExtPinAry.length > 0) {
//         console.warn(`兼容组件(title=${model.runtime.title || comDef.title},namespace=${comDef.namespace})的输入项中的EXT部分.`)
//         model.inputPinExts = inputExtPinAry
//       }
//     }
//
//     if (rtModel.inputAry && (rtModel.inputAry[0] instanceof PinModel)) {
//       console.warn(`兼容组件(title=${model.runtime.title || comDef.title},namespace=${comDef.namespace})的输入项中的runtime.model部分.`)
//       model.inputPinsInModel = []
//
//       const oriAry = rtModel.inputAry
//       rtModel.inputAry = []
//
//       oriAry.forEach((pin: PinModel) => {
//         const newPin = model.addInputPinInModel(pin.hostId, pin.title, pin.schema)
//         if (pin.conAry) {
//           pin.conAry.forEach(con => {
//             con.finishPin = newPin
//             newPin.addCon(con)
//           })
//         }
//       })
//     }
//
//     if (rtModel.outputAry && (rtModel.outputAry[0] instanceof PinModel)) {
//       console.warn(`兼容组件(title=${model.runtime.title || comDef.title},namespace=${comDef.namespace})的输出项中的runtime.model部分.`)
//       model.outputPinsInModel = []
//
//       const oriAry = rtModel.outputAry
//       rtModel.outputAry = []
//
//       oriAry.forEach((pin: PinModel) => {
//         if (pin.isTypeOfNormal()) {
//           const newPin = model.addOutputPinInModel(pin.hostId, pin.title, pin.schema)
//           if (pin.conAry) {
//             pin.conAry.forEach(con => {
//               con.startPin = newPin
//               newPin.addCon(con)
//             })
//           }
//         }
//       })
//     }
//   },
//   calculate(model: CalComModel, comDef) {
//     const rtModel = model.runtime.model
//     if (!rtModel.inputAry) {
//       console.warn(`兼容计算组件(${model.runtime.title || comDef.title})的输入项`)
//       const inputAry = []
//       if (model.inputPins.length) {
//         model.inputPins.forEach(pin => {
//           inputAry.push({
//             hostId: pin.hostId,
//             title: pin.title
//           })
//
//           const newPin = model.addInputPinInModel(pin.hostId, pin.title, pin.schema)
//           if (pin.conAry) {
//             pin.conAry.forEach(con => {
//               con.finishPin = newPin
//               newPin.addCon(con)
//             })
//           }
//         })
//         model.inputPins = []
//       }
//
//       console.warn(`兼容计算组件(${model.runtime.title || comDef.title})的输出项`)
//       const outputAry = []
//       if (model.outputPins.length) {
//         model.outputPins.forEach(pin => {
//           outputAry.push({
//             hostId: pin.hostId,
//             title: pin.title
//           })
//           const newPin = model.addOutputPinInModel(pin.hostId, pin.title, pin.schema)
//           if (pin.conAry) {
//             pin.conAry.forEach(con => {
//               con.startPin = newPin
//               newPin.addCon(con)
//             })
//           }
//         })
//         model.outputPins = []
//       }
//
//       rtModel.data = {
//         inputAry,
//         outputAry,
//         vars: model['vars'],
//         xmls: model['xmls'],
//         scripts: model['scripts']
//       }
//
//       model['vars'] = void 0
//       model['xmls'] = void 0
//       model['scripts'] = void 0
//     }
//
//     if (model.inputPinsInModel.length) {
//       const ary: PinModel[] = []
//       model.inputPinsInModel.forEach(pin => {
//         if (!ary.find(epin => epin.hostId === pin.hostId)) {
//           pin.deletable = true
//           ary.push(pin)
//         }
//       })
//       model.inputPinsInModel = ary
//     }
//
//     if (model.runtime.model.inputAry.length) {
//       const ary = []
//       model.runtime.model.inputAry.forEach(pin => {
//         if (!ary.find(epin => epin.hostId === pin.hostId)) {
//           pin.deletable = true
//           ary.push(pin)
//         }
//       })
//       model.runtime.model.inputAry = ary
//     }
//
//     if (model.outputPinsInModel.length) {
//       const ary: PinModel[] = []
//       model.outputPinsInModel.forEach(pin => {
//         if (!ary.find(epin => epin.hostId === pin.hostId)) {
//           pin.deletable = true
//           ary.push(pin)
//         }
//       })
//       model.outputPinsInModel = ary
//     }
//
//     if (model.runtime.model.outputAry.length) {
//       const ary = []
//       model.runtime.model.outputAry.forEach(pin => {
//         if (!ary.find(epin => epin.hostId === pin.hostId)) {
//           pin.deletable = true
//           ary.push(pin)
//         }
//       })
//       model.runtime.model.outputAry = ary
//     }
//   }
// }