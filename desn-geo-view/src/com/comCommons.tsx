/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {observe, uuid} from "@mybricks/rxui";
import {ComContext} from "./GeoCom";
import {ModuleSeedModel, NS_XGraphComLib} from "@sdk";
import GeoComDebugModel from "./GeoComDebugModel";
import {GeoComModel} from "./GeoComModel";
import React from "react";

export function getEnv(model: GeoComModel, comContext: ComContext) {
  const {context, emitPage, emitItem, emitModule} = comContext
  const cfgEnv = context.configs.com?.env

  return Object.assign({}, {
    createPortal(jsx) {
      return emitPage.createPortal(jsx)
    },
    get edit() {
      if (context.isDesnMode()) {
        return {
          getPage(pageId: string) {
            return emitPage.getPage(pageId)
          },
          getCurPage() {
            return emitPage.getCurPage()
          },
          getPageTree() {
            return emitPage.getPageTree()
          }
        }
      }
    },
    get runtime() {
      if (context.isDebugMode()) {
        return Object.assign({
          debug: {},
          get curWindow() {
            return {
              destroy() {
                emitModule.clearAllTempComs()
              }
            }
          },
          getCurPage() {
            return emitPage.getCurPage()
          },
          getPageTree() {
            return emitPage.getPageTree()
          },
          getPage(pageId: string) {
            const page = emitPage.getPage(pageId)
            if (page) {
              const {slot, frame} = page
              //
              // model.slots[0] = slot
              // model.runtime.topl.frames[0] = frame
              return {
                id: page.id,
                title: page.title,
                render(inSlot, callback) {
                  //const content = useObservable(class {jsx})
                  setTimeout(v => {//Prevent endless loop
                    emitModule.clearAllTempComs()

                    const def = {
                      libId: NS_XGraphComLib.id,
                      namespace: NS_XGraphComLib.coms.module
                    }
                    const comDef = context.getComDef(def)

                    const instanceModel = new ModuleSeedModel({
                      namespace: def.namespace,
                      data: JSON.parse(JSON.stringify(comDef.data ? comDef.data : {}))
                    }, {slot, frame})

                    emitItem.add(instanceModel, 'finish')

                    const viewModel = model.root

                    const moduleGeo = viewModel.searchCom(instanceModel.id)

                    inSlot._renderKey = uuid()//Refresh slot when render

                    emitItem.cutToSlot(moduleGeo.id, model.id, inSlot.id)

                    typeof callback === 'function' ? callback(true) : void 0
                  })
                }
              }
            }
          },
          getUserToken() {
            return context.envVars.debug.userToken
          },
          getEnvType() {
            return context.envVars.debug.envType
          },
          getEnvParam(name: string) {
            const params = context.envVars.debug.envParams
            if (typeof params === 'string') {
              let obj
              try {
                eval(`obj = ${params}`)
              } catch (ex) {
                throw new Error(`解析环境参数错误:${ex.message}`)
              }
              return obj[name]
            }
          }
        }, {})///TODO 转移至env
      } else {
        return false
      }
    }
  }, cfgEnv || {})
}

export function getStyle(debug?: GeoComDebugModel) {
  const {model} = observe(ComContext)

  if (debug) {
    return {
      get display() {
        return debug.style.display
      },
      set display(val: 'block' | 'none') {
        if (typeof (val) !== 'string' || !val.match(/block|none/g)) {
          throw new Error(`Invalid value`)
        }
        debug.style.display = val
      }
    }
  } else {
    return {
      get display() {
        return model.style.display
      },
      set display(val: 'block' | 'none') {
        if (typeof (val) !== 'string' || !val.match(/block|none/g)) {
          throw new Error(`Invalid value`)
        }
        model.style.display = val
      }
    }
  }
}

export function getInputs() {
  const {model, context, emitItem, emitSnap} = observe(ComContext)
  return new Proxy({}, {
    get(target: {}, _id: PropertyKey, receiver: any): any {
      return function () {
      }
    }
  })
}

export function getOutputs() {
  const {model, context, emitItem, emitSnap} = observe(ComContext)
  return new Proxy({}, {
    get(target: {}, _id: PropertyKey, receiver: any): any {
      return function () {
      }
    }
  })
}