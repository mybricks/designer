/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './StageView.less'
import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import {dump as dumpView, evt, load as loadView, observe, useComputed, useObservable} from '@mybricks/rxui'

import {ComSeedModel, DesignerContext, ModuleSeedModel, NS_Emits, NS_XGraphComLib} from '@sdk'
import {uuid} from '@utils';

import {DialogViewModel, GeoComModel, GeoView, GeoViewModel} from '@mybricks/desn-geo-view'
import {DialogToplViewModel, ToplComModel, ToplView, ToplViewModel} from '@mybricks/desn-topl-view'

import StageViewModel from "./StageViewModel";

import {getConfigs} from './configrable'
import StageViewContext from "./StageViewContext";
import {T_Page} from "./types";
import {createPortal} from "react-dom";
//import {PERSIST_NAME} from "./constants";

//import {_2020_11_17} from "./_Compatible_11.17";

const MAIN_MODULE_ID = '_main_'

let myContext

export default function StageView(
  {
    topl,
    page,
    debugParams,
    getPage,
    onLoad,
    persistName
  }: {
    topl: {
      inputs?: {
        id: string,
        title: string
      }[],
      outputs?: {
        id: string,
        title: string
      }[]
    },
    page: T_Page,
    debugParams: {},
    getPage: (id: string) => T_Page,
    onLoad,
    persistName: string
  }) {
  if (!persistName) {
    throw new Error(`PersistName expected.`)
  }

  const desnContext = observe(DesignerContext, {from: 'parents'})
  const emitSnap = useObservable(NS_Emits.Snap, {expectTo: 'parents'})
  const emitItem = useObservable(NS_Emits.Component, {expectTo: 'parents'})
  const emitMessage = useObservable(NS_Emits.Message, {expectTo: 'parents'})
  const emitLogs = useObservable(NS_Emits.Logs, {expectTo: 'parents'})

  const model = useObservable(StageViewModel, {
    init(md) {
      //if (page) {
      if (md.mainModule === void 0) {
        md.designerVersion = DesignerContext.DESIGNER_VERSION

        const mainModule = {
          instId: MAIN_MODULE_ID,
          title: '主模块',
          slot: void 0,
          frame: void 0
        }

        const stageType = desnContext.configs.stageView.type

        if (stageType === void 0 || stageType !== 'onlyLogic') {
          mainModule.slot = new GeoViewModel()
          mainModule.slot.state.enable()
        }

        mainModule.frame = new ToplViewModel()
        mainModule.frame.addIODiagram()

        if (topl) {
          if (Array.isArray(topl.inputs)) {
            topl.inputs.forEach(input => {
              mainModule.frame.addInputPin(input.id, input.title, void 0)
            })
          }

          if (Array.isArray(topl.outputs)) {
            topl.outputs.forEach(output => {
              mainModule.frame.addOutputPin(output.id, output.title, void 0)
            })
          }
        }

        if (!mainModule.slot) {
          mainModule.frame.state.enable()
        } else {
          mainModule.frame.state.disable()
        }

        md.mainModule = mainModule
      }

      if (md.moduleNav.length === 0) {
        md.moduleNav = [md.mainModule]
      }
      //}

      Promise.resolve().then(() => {
        //Proxy
        desnContext.envVars.debug = {
          get envType() {
            return md.envVars.envType
          },
          set envType(val) {
            md.envVars.envType = val
          },
          get userToken() {
            return md.envVars.userToken
          },
          set userToken(val) {
            md.envVars.userToken = val
          },
          get envParams() {
            return md.envVars.envParams
          },
          set envParams(val) {
            md.envVars.envParams = val
          }
        } as any
      })
    }
  }, persistName, [page])

  myContext = useObservable(StageViewContext, {
    init(ctx) {
      ctx.context = desnContext
      ctx.model = model
      ctx.emitSnap = emitSnap
      ctx.emitItem = emitItem
      ctx.emitMessage = emitMessage
      ctx.emitLogs = emitLogs

      const stageType = desnContext.configs.stageView.type

      if (stageType === void 0 || stageType !== 'onlyLogic') {
        ctx.hasGeo = true
      }
      ctx.hasTopl = true
    }
  })

  const blankContent = useRef<{}>()

  useMemo(() => {
    if (!blankContent.current) {
      blankContent.current = dumpView(persistName)
    }
  }, [])

  useEffect(() => {
    desnContext._designerVersion = model.designerVersion

    desnContext.focusDefault = {
      getConfigs() {
        return getConfigs(myContext)
      }
    } as any
  }, [])

  useEffect(() => {
    //desnContext.blur()
    myContext.loaded = false
    //let mainModule = moduleCache[page.id]
    let mainModule

    if (!mainModule) {
      if (page) {
        if (page.content) {
          //const cloned = JSON.parse(JSON.stringify(page.content))////TODO
          loadView(page.content as any)//Load current view
        } else {//blank
          loadBlank(persistName, blankContent.current)
          model.moduleNav = [model.mainModule]
          if (page.type === "dialog") {//Translate to DialogViewModel
            model.mainModule.slot = new DialogViewModel(model.mainModule.slot)
            model.mainModule.frame = new DialogToplViewModel(model.mainModule.frame)
            //console.log(model.getCurModule(),model.mainModule)
          }
        }
      }
      //moduleCache[page.id] = model.mainModule
    } else {
      model.mainModule = mainModule
      model.moduleNav = [mainModule]
    }

    myContext.loaded = true

    model.$el.focus()//Focus so that it's can listen to events
  }, [page])

  const emitDebug = observe(NS_Emits.Debug, {from: 'children', expectTo: 'children'})
  observe(NS_Emits.IOEditor, {from: 'children', expectTo: 'children'})

  observe(NS_Emits.Page, next => next({
    getPage(pageId: string) {
      let stageViewModel
      if (pageId !== void 0) {
        const page = getPage(pageId)
        if (page) {
          if (desnContext.isDesnMode()) {
            return {id: page.id, title: page.title}
          } else {
            if (page.content) {
              let content
              try {
                content = JSON.parse(JSON.stringify(page.content, (key, value) => {
                  //console.log(arguments)
                  return value
                }))
              } catch (ex) {
                console.log(page.content)/////TODO
                debugger
              }

              //const rtns = loadView(content, true)
              const rtns = loadView(content, true)
              stageViewModel = rtns[persistName] as StageViewModel

              return {
                id: page.id,
                title: page.title,
                slot: stageViewModel.mainModule.slot,
                frame: stageViewModel.mainModule.frame,
                render() {//Implement by GeoModel com/comCommons
                  throw new Error(`Not implement.`)
                }
              }
            }
          }
        } else {
          return
        }
      }
    },
    openDialog(pageId: string, {inputParams, outputs}) {
      let stageViewModel
      if (pageId !== void 0) {
        const page = getPage(pageId)

        if (page.content) {
          const content = JSON.parse(JSON.stringify(page.content))
          const rtns = loadView(content, true)
          stageViewModel = rtns[persistName] as StageViewModel

          Promise.resolve().then(v => {//Prevent endless loop
            //emitModule.clearAllTempComs()  TODO

            const def = {
              namespace: NS_XGraphComLib.coms.module
            }
            const comDef = desnContext.getComDef(def)

            stageViewModel.mainModule.slot.title = page.title//Set title

            const instanceModel = new ModuleSeedModel({
              namespace: def.namespace,
              data: JSON.parse(JSON.stringify(comDef.data ? comDef.data : {}))
            }, {
              slot: stageViewModel.mainModule.slot,
              frame: stageViewModel.mainModule.frame
            })

            emitItem.add(instanceModel, 'finish', {debugProxy: {inputParams, outputs}})
          })
        }
      }
    }

  }), {from: 'parents',expectTo:'children'})

  observe(NS_Emits.Views, next => {
    //let oriEnable
    next({
      pushInStage(view: Function) {
        myContext.routerViewAry.push(view)
        desnContext.setShowModelFullScreen()

        // const curModule = model.getCurModule()
        // if(curModule.slot.state.isEnabled()){
        //   oriEnable = curModule.slot
        // }else if(curModule.frame.state.isEnabled()){
        //   oriEnable = curModule.frame
        // }
        //
        // curModule.slot.state.disable()
        // curModule.frame.state.disable()
        //desnContext.setDebugDisable()
      },
      popInStage() {
        myContext.routerViewAry.pop()
        desnContext.setShowModelNormal()

        //oriEnable.state.enable()

        //desnContext.setDebugEnable()
      },
      getCurRootFrame() {
        return model.getCurModule().frame
      }
    })
  }, {from: 'parents'})

  //Upgrade for components
  observe(NS_Emits.Component, next => {
    next({
      upgrade
    })
  }, {from: 'children'})

  observe(NS_Emits.Module, next => next({
    load(module) {
      emitDebug.stop()
      loadModule(module)
    }
  }), {from: 'children', expectTo: 'children'})

  const routeView = useComputed(() => {
    const rViewAry = myContext.routerViewAry
    if (rViewAry.length > 0) {
      const LastView = rViewAry[rViewAry.length - 1]
      return <LastView/>
    }
  })

  const views = useComputed(() => {
    const rtn = []
    const curModule = model.getCurModule()

    if (page && curModule) {
      if (curModule.slot) {
        rtn.push(<GeoView viewModel={curModule.slot}
                          page={page}
                          key={curModule.instId + curModule.slot.id + 'slot'}/>)
      }
      if (curModule.frame) {
        rtn.push(<ToplView frameModel={curModule.frame} debugParams={debugParams}
                           key={curModule.instId + curModule.frame.id + 'frame'}/>)
      }
    }
    return rtn
  })

  useComputed(() => {
    if (myContext.loaded) {
      const views = []
      const curModule = model.getCurModule()
      if (curModule) {
        if (curModule.slot) {
          views.push({
            name: 'geo',
            title: '布局',
            get enable() {
              return curModule.slot.state.isEnabled()
            },
            exe() {
              curModule.frame?.state.disable()
              curModule.slot.state.enable()
            }
          })
        }
        if (curModule.frame) {
          views.push({
            name: 'topl',
            title: '逻辑',
            get enable() {
              return curModule.frame.state.isEnabled()
            },
            exe() {
              curModule.slot?.state.disable()
              curModule.frame.state.enable()
            }
          })
        }
      }
      onLoad && onLoad(views, model)
    }
  })

  const click = useCallback(() => {
    myContext.emitItem.focus(void 0)
  }, [])

  return (
    <div className={`${css.stageView}`}
         ref={el => el && (model.$el = el)} tabIndex={1}
         //onClick={evt(click).stop}
         onClick={click}
    >
      {
        page && myContext.loaded ? views : null
      }
      {routeView}
      <div className={css.debuging} style={{display: desnContext.isDesnMode() ? 'none' : ''}}>
        <div className={css.debugTop}/>
        <div className={css.debugBottom}/>
      </div>
    </div>
  )
}

function backToModule(module) {
  const dblModel = myContext.model
  const curModule = dblModel.getCurModule()

  if (module !== curModule) {
    const mdAry = myContext.model.moduleNav
    const idx = mdAry.indexOf(module)

    for (let i = 0; i <= mdAry.length - idx; i++) {
      dblModel.popModule()
    }

    loadModule(module)
  }
}

function loadModule(module, myContext) {
  const dblModel = myContext.model
  const idx = dblModel.moduleNav.indexOf(module)
  if (idx === -1) {
    if (!module.slot && !module.frame) {
      throw new Error(`Invalid module,must have geo or frame at least`)
    }
    const curModule = dblModel.getCurModule()

    let hasEnable
    if (!module.slot && myContext.hasGeo) {
      const getComModel = curModule.slot.searchCom(module.instId)
      module.slot = getComModel.slots[0]
    }
    if (!module.frame && myContext.hasTopl) {
      const toplComModel: ToplComModel = curModule.frame.searchCom(module.instId)
      module.frame = toplComModel.frames[0]
    }

    if (module.slot && module.slot.state.isEnabled()) {
      hasEnable = true
    }
    if (module.frame && module.frame.state.isEnabled()) {
      if (hasEnable) {
        module.frame.state.disable()
      } else {
        hasEnable = true
      }
    }
    if (!hasEnable) {
      if (module.slot) {
        module.slot.state.enable()
      } else if (module.frame) {
        module.frame.state.enable()
      }
    }
    dblModel.pushModule(module)
  }
}

function addSubModule() {
  const def = {
    libId: NS_XGraphComLib.id,
    namespace: NS_XGraphComLib.coms.module
  }
  const comDef = myContext.context.getComDef(def)

  const instanceModel = new ComSeedModel({
    libId: NS_XGraphComLib.id,
    namespace: NS_XGraphComLib.coms.module,
    data: JSON.parse(JSON.stringify(comDef.data ? comDef.data : {}))
  })

  myContext.emitItem.add(instanceModel, 'finish');
}

function loadBlank(persistName, blankContent) {
  const nblank = JSON.parse(JSON.stringify(blankContent))
  const refs = nblank[persistName].refs
  for (let key in refs) {
    if (key.match(new RegExp(`^(${GeoViewModel.name}|${ToplViewModel.name})_`))) {
      refs[key].id = uuid()//Replace id,so refresh component
    }
  }

  loadView(nblank)
}

function upgrade(comModel: ComSeedModel) {
  const {model: dblModel, emitItem, emitMessage, emitLogs, context} = myContext
  const comDef = context.getComDef(comModel.runtime.def)
  if (!comDef) {
    throw new Error(`No definition found for component(${comModel.runtime.def.namespace})`)
  }

  let upgradeContinue: boolean = false

  let geoComModel: GeoComModel, toplComModel: ToplComModel

  const id = comModel.id
  const curModule = dblModel.getCurModule()

  if (curModule.frame) {
    toplComModel = curModule.frame.searchCom(id) as ToplComModel
  }
  if (curModule.slot) {
    geoComModel = curModule.slot.searchCom(id) as GeoComModel
  }

  if (typeof comDef.upgrade === 'function') {
    const params: { data, slot, input, output } = {}
    params.data = comModel.runtime.model.data

    if (curModule.frame) {
      params.input = toplComModel.getInputEditor(emitItem)
      params.output = toplComModel.getOutputEditor(emitItem)
    }
    if (curModule.slot) {
      params.slot = geoComModel.getSlotEditor(emitItem)
    }
    try {
      const rtn = comDef.upgrade(params)
      if(typeof rtn === 'boolean' && rtn) {
        upgradeContinue = true
      } else {
        upgradeContinue = false
      }
    } catch (ex) {
      emitMessage.error(`更新失败.\n${ex.message}`)
      return
    }
  } else {
    upgradeContinue = true
  }

  if (upgradeContinue) {
    // const mInputAry: PinModel[] = toplComModel.inputPins || []
    // const defInPutAry: T_IOPin[] = comDef.inputs || []
    //
    // const mOutputAry: PinModel[] = toplComModel.outputPins || []
    // const defOutputAry: T_IOPin[] = comDef.outputs || []
    //
    // if (mInputAry.length !== defInPutAry.length) {
    //   const oriAry = toplComModel.inputPins
    //   toplComModel.inputPins = []
    //
    //   defInPutAry.forEach(pin => {
    //     const newPin = toplComModel.addInputPin(pin.id, pin.title, pin.schema)
    //
    //     const oriPin = oriAry.find(opin => opin.hostId === pin.id)
    //     if (oriPin && oriPin.conAry) {
    //       oriPin.conAry.forEach(con => {
    //         con.finishPin = newPin
    //         newPin.addCon(con)
    //       })
    //     }
    //   })
    // }
    //
    // if (mOutputAry.length !== defOutputAry.length) {
    //   const oriAry = toplComModel.outputPins
    //   toplComModel.outputPins = []
    //
    //   defOutputAry.forEach(pin => {
    //     const newPin = toplComModel.addOutputPin(pin.id, pin.title, pin.schema)
    //
    //     const oriPin = oriAry.find(opin => opin.hostId === pin.id)
    //     if (oriPin && oriPin.conAry) {
    //       oriPin.conAry.forEach(con => {
    //         con.startPin = newPin
    //         newPin.addCon(con)
    //       })
    //     }
    //   })
    // }

    comModel.runtime.def.version = comDef.version
    comModel.runtime.upgrade = void 0

    emitLogs.warn(`${comDef.title}(${comDef.namespace}) 已更新到 ${comDef.version} 版本.`)
  } else {
    emitLogs.error(`更新${comDef.title}(${comDef.namespace})失败.`)
  }
}