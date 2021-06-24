import FrameModel from "./topl-view/frame/FrameModel";
import StageViewContext from "./StageViewContext";
import SlotModel from "./geo-view/slot/SlotModel";

const NS_NORMAL_LOGIC = 'power.normal-logic'

const Processed = new WeakSet()

export const _2020_11_17 = (function () {
  let svContext: StageViewContext
  let rootFrame: FrameModel

  function doFrame(frameModel: FrameModel) {
    if (Processed.has(frameModel)) {
      return
    }
    Processed.add(frameModel)

    if (frameModel.comAry) {
      frameModel.comAry.forEach(comModel => {
        const rtDef = comModel.runtime.def
        if (rtDef.namespace === 'xgraph.coms.extended:scratch:empty') {
          debugger
        }
        const regExp = /xgraph.coms.extended:([\w-_]+):([\w-_]+)/
        const ary = regExp.exec(rtDef.namespace)
        if (ary) {
          if (ary[1] === 'normal') {
            const replaceDef = svContext.context.getComDef({namespace: `${NS_NORMAL_LOGIC}.${ary[2]}`})
            if (replaceDef) {
              rtDef.namespace = replaceDef.namespace
              rtDef.rtType = replaceDef.rtType
              rtDef.extension = void 0
              svContext.emitLogs.warn(`替换原扩展组件(${ary[2]})为(${replaceDef.namespace}:${replaceDef.version}).`)
            }
          } else if (ary[1] === 'scratch') {
            const replaceDef = svContext.context.getComDef({namespace: `${NS_NORMAL_LOGIC}.${ary[1]}`})
            if (replaceDef) {
              rtDef.namespace = replaceDef.namespace
              rtDef.rtType = replaceDef.rtType
              rtDef.extension = void 0

              const data = comModel.runtime.model.data
              if (data.xmls) {
                const fns = []
                Object.keys(data.xmls).forEach(inputId => {
                  fns.push({
                    id: inputId,
                    input: inputId === '_default_' ? void 0 : inputId,
                    vars: data.vars[inputId],
                    xml: data.xmls[inputId],
                    script: data.scripts[inputId],
                  })
                })

                data.xmls = void 0
                data.vars = void 0
                data.scripts = void 0

                data.fns = fns
              }

              svContext.emitLogs.warn(`替换原Scratch组件(${ary[2]})为(${replaceDef.namespace}:${replaceDef.version}).`)
            }
          }
        }
        if (comModel.frames) {
          comModel.frames.forEach(nframe => {
            doFrame(nframe)
          })
        }
      })
    }
  }

  function doSlot(slot: SlotModel) {
    if (Processed.has(slot)) {
      return
    }
    Processed.add(slot)
    if (slot.comAry) {
      slot.comAry = slot.comAry.map(comModel => {
        if (comModel.slots) {
          comModel.slots.forEach(tslot => {
            doSlot(tslot)
          })
        }
        const rtDef = comModel.runtime.def
        if (!rtDef.namespace.match(/(xgraph.coms.extended|power.normal-logic)/gi)) {
          return comModel
        }else{
          console.log(rtDef.namespace)
        }
      }).filter(com => com)
    }
  }

  return {
    frame(_context: StageViewContext) {
      rootFrame = _context.model.mainModule.frame as FrameModel
      svContext = _context

      svContext.emitLogs.warn('兼容处理', `转换扩展组件.`)
      doSlot(_context.model.mainModule.slot as SlotModel)
      doFrame(rootFrame)
      svContext.emitLogs.warn('兼容处理', `处理完成.`)
    }
  }
})()