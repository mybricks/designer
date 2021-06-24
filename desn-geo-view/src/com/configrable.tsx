import {NS_Configurable, NS_XGraphComLib, T_XGraphComDef} from "@sdk";
import {ComContext} from "./GeoCom";
import {antiShaking} from "@utils";
import RenderItem = NS_Configurable.RenderItem;
import Group = NS_Configurable.Group;
import {EditorsSelectorAll, EditorsSelectorRoot} from "../constants";

//Record for current active editor array
let activeEditorAry = []

export function get(comContext: ComContext, onlyShortcuts: boolean) {
  activeEditorAry = []

  let rtn
  const {model, comDef, context, emitModule, emitItem, emitSnap} = comContext

  const fa = model.focusArea;

  if (fa && fa.isValid()) {//May be removed
    rtn = getFocusAreaEditors(comContext, onlyShortcuts)
  } else {
    rtn = getComEditors(comContext, onlyShortcuts)
  }

  return rtn.map(catelog => {
    catelog.groups && (catelog.groups.forEach(group => {
      group.items && (group.items = group.items.filter(item => item))
    }))
    return catelog
  })
}


function getComEditors(comContext: ComContext, onlyShortcuts: boolean) {
  const {model, comDef, context, emitModule, emitItem, emitSnap} = comContext

  const rtn = []
  const comEle = model.$el.firstChild as HTMLElement

  const notFoundTitle = `${model.runtime.def.namespace} not found`

  const comCategary = new NS_Configurable.Category(comDef ? comDef.title : notFoundTitle)
  rtn.push(comCategary)

  const normalGroup = new NS_Configurable.Group()
  normalGroup.addItem(createEdtItem(comContext, {
    title: `组件标题`,
    type: 'text',
    description: `您可以修改成更有意义的标题，新的标题也会同时出现在导航栏以及逻辑视图中`,
    value: {
      get() {
        return model.runtime.title || comDef.title
      }, set(context, val) {
        model.runtime.title = val
      }
    }
  }, comEle, true))

  comCategary.addGroup(normalGroup)

  if (onlyShortcuts) {
    const edtGroup = new NS_Configurable.Group()

    const edtAry = createEdtAry(comContext, comEle, comEle,
      {
        [EditorsSelectorRoot]: true
      },
      onlyShortcuts)
    if (edtAry) {
      const [ary, zoneTitle] = edtAry
      edtGroup.addItems(ary)
    }
    if (edtGroup.items && edtGroup.items.length > 0) {
      comCategary.addGroup(edtGroup)
    }

    return rtn
  }

  if (comDef) {
    if (model.style.isLayoutAbsolute()) {
      normalGroup.addItem(createEdtItem(comContext, {
        type: 'NumInputGroup',
        options: [
          {
            title: 'X'
          }, {
            title: 'Y'
          }
        ],
        value: {
          get() {
            return [model.style.left, model.style.top];
          }, set(context, val) {
            model.style.left = val[0];
            model.style.top = val[1];
          }
        }
      }, comEle))
    }

    // let resizerEdt = getEdtResizer(comDef, {'*': true}), reEnable;
    // if (resizerEdt && resizerEdt['options']
    //   && (reEnable = resizerEdt['options']['enable'])) {
    //   comGroup.addItem(createEdtItem(comContext, {
    //     type: 'NumInputGroup',
    //     options: [
    //       {
    //         title: 'W',
    //         disabled: reEnable.find(nm => nm.toLowerCase() == 'width') ? false : true
    //       }, {
    //         title: 'H',
    //         disabled: reEnable.find(nm => nm.toLowerCase() == 'height') ? false : true
    //       }
    //     ],
    //     value: {
    //       get() {
    //         return [model.style.width, model.style.height];
    //       },
    //       set(context, val) {
    //         model.style.width = val[0];
    //         model.style.height = val[1];
    //         if (typeof (resizerEdt.onComplete) == 'function') {
    //           resizerEdt.onComplete(context, {width: val[0], height: val[1]})
    //         }
    //       }
    //     }
    //   }, hostEle))
    // }

    // comGroup.addItem(createEdtItem(comContext, {
    //   title: '标签',
    //   description: `灵活使用标记，之后可以快速找到组件`,
    //   type: 'select',
    //   options: [
    //     {value: 'none', label: '无'},
    //     {value: 'todo', label: '待完成(Todo)'}
    //   ],
    //   value: {
    //     get() {
    //       return model.runtime.labelType
    //     }, set(context, val) {
    //       model.runtime.labelType = val
    //     }
    //   }
    // }, hostEle))

    normalGroup.addItem(createEdtItem(comContext, {
      title: '显示',
      type: 'switch',
      description: `运行时是否显示该组件`,
      value: {
        get({style}) {
          return style.display !== 'none'
        },
        set({style}, value) {
          style.display = value ? 'block' : 'none'
        }
      }
    }, comEle))


    const viewOn = comDef.editors?.view || comDef.editors

    const cfgCanvas = context.configs.stage

    if (cfgCanvas && cfgCanvas.type && cfgCanvas.type.toLowerCase() === 'PC') {
      normalGroup.addItem(createEdtItem(comContext, {
        title: '宽度自适应',
        type: 'switch',
        description: `宽度自适应`,
        value: {
          get({style}) {
            return style.width === '100%'
          },
          set({style}, value) {
            if (value) {
              style.width = '100%'
              if (viewOn) {
                const resizeEdt = viewOn['@resize']
                if (typeof resizeEdt === 'function') {
                  resizeEdt(...arguments)
                } else if (typeof resizeEdt === 'object' && typeof resizeEdt.value?.set === 'function') {
                  resizeEdt.value.set(...arguments)
                }
              }
            } else {
              style.width = 'fit-content'
              if (viewOn) {
                const resizeEdt = viewOn['@resize']
                if (typeof resizeEdt === 'function') {
                  resizeEdt(...arguments)
                } else if (typeof resizeEdt === 'object' && typeof resizeEdt.value?.set === 'function') {
                  resizeEdt.value.set(...arguments)
                }
              }
            }
          }
        }
      }, comEle))
    }

    // comGroup.addItem(createEdtItem(comContext, {
    //   title: '定位',
    //   type: 'Select',
    //   onLoad({style}) {
    //     return style.display === 'block'
    //   },
    //   options: [
    //     {value: 'auto', label: '默认'},
    //     {value: 'absolute', label: '浮动'},
    //     {value: 'fixed', label: '固定'}
    //   ],
    //   value: {
    //     get({style}) {
    //       return style.position
    //     },
    //     set({style}, value) {
    //       style.position = value
    //       setTimeout(h => emitItem.focus(model))
    //     }
    //   }
    // }, hostEle))

    normalGroup.addItem(createEdtItem(comContext, {
      title: '外间距',
      type: 'inputNumber',
      options: [
        {
          title: '上',
          width: 50
        }, {
          title: '下',
          width: 50
        }, {
          title: '左',
          width: 50
        }, {
          title: '右',
          width: 50
        }
      ],
      value: {
        get() {
          return [
            model.style.marginTop,
            model.style.marginBottom,
            model.style.marginLeft,
            model.style.marginRight
          ]
        },
        set({style}, [top, bottom, left, right]) {
          model.style.marginTop = top
          model.style.marginBottom = bottom
          model.style.marginRight = right
          model.style.marginLeft = left
        }
      }
    }, comEle))

    if (model.style.width !== '100%') {
      if (viewOn) {
        let resizeEdt = viewOn['@resize']
        if (typeof resizeEdt === 'function') {
          normalGroup.addItem(createEdtItem(comContext, {
            type: '_resizer_',
            options: ['width'],
            value: {
              set(...args) {
                resizeEdt(...args)
              }
            }
          }, comEle))
        } else if (typeof resizeEdt === 'object' && typeof resizeEdt.value?.set === 'function') {
          normalGroup.addItem(createEdtItem(comContext, {
            type: '_resizer_',
            options: resizeEdt.options || ['width'],
            value: {
              set(...args) {
                resizeEdt.value.set(...args)
              }
            }
          }, comEle))
        }
      }
    }

    //-------------------------------------------------------------------------------
    const edtGroup = new NS_Configurable.Group()

    const edtAry = createEdtAry(comContext, comEle, comEle, {
      [EditorsSelectorRoot]: true,
      [EditorsSelectorAll]: true
    }, onlyShortcuts)
    if (edtAry) {
      const [ary, zoneTitle] = edtAry
      edtGroup.addItems(ary)
    }
    if (edtGroup.items) {
      comCategary.addGroup(edtGroup)
    }

  } else {
    normalGroup.addItem(new RenderItem(void 0, notFoundTitle))
  }


  //-------------------------------------------------------------------------------
  // if (comDef.outputs) {
  //   const eventsGroup = new NS_Configurable.Group('事件')
  //   comCategary.addGroup(eventsGroup)
  //
  //   comDef.outputs.forEach(output => {
  //     eventsGroup.addItem(createEdtItem(comContext, {
  //       title: output.title,
  //       type: 'button',
  //       description: `执行${output.title}`,
  //       value: {
  //         set({data, diagram}) {
  //           diagram.edit(output.id)
  //         }
  //       }
  //     }, hostEle))
  //   })
  // }

  //-------------------------------------------------------------------------------
  const sysGroup = new NS_Configurable.Group()
  sysGroup.fixedAt = 'bottom'

  comCategary.addGroup(sysGroup)


  // comGroup.addItem(createEdtItem(comContext, {
  //   title: 'ID',
  //   type: 'text',
  //   options: {
  //     readonly: true
  //   },
  //   value: {
  //     get() {
  //       return model.id
  //     }
  //   }
  // }, hostEle))


  if (model.runtime.def.namespace === NS_XGraphComLib.coms.module) {
    sysGroup.addItem(createEdtItem(comContext, {
      title: '打开',
      type: 'button',
      value: {
        set(context, val) {
          const slot = model.slots ? model.slots[0] : void 0

          emitModule.load({
            instId: model.id,
            title: model.runtime.title || comDef.title,
            slot//Emits slot only,frame will found in DBLView
          } as any)
          emitItem.blur()
        }
      }
    }, comEle, true))
  }

  sysGroup.addItem(() => {
      return (
        <div>
          <span style={{color: '#999', fontStyle: 'italic'}}>ID : {model.id}</span>
          <span style={{
            marginLeft: 10,
            color: '#999',
            fontStyle: 'italic'
          }}>版本号 : {model.runtime.def.version}</span>
        </div>
      )
    }
  )

  sysGroup.addItem(createEdtItem(comContext, {
    title: '上移',
    type: 'button',
    value: {
      set(context, val) {
        emitItem.upwards(model)
        emitItem.focus(model)
      }
    }
  }, comEle))

  sysGroup.addItem(createEdtItem(comContext, {
    title: '下移',
    type: 'button',
    value: {
      set(context, val) {
        emitItem.downwards(model)
        emitItem.focus(model)
      }
    }
  }, comEle))

  if (model.deletable) {
    sysGroup.addItem(createEdtItem(comContext, {
      title: '删除',
      type: 'button',
      options: {
        type: 'danger'
      },
      value: {
        set(context, val) {
          emitItem.delete(model)
          emitItem.focus(void 0)
        }
      }
    }, comEle))
  }

  return rtn
}


function getFocusAreaEditors(comContext: ComContext, onlyShortcuts: boolean) {
  const {model, comDef, context, emitModule, emitItem, emitSnap} = comContext
  const rtn = []
  const hostEle = model.$el.firstChild as HTMLElement

  const fa = model.focusArea;
  if (fa && fa.isValid()) {//May be removed
    let {ele, selectors} = fa
    if (selectors) {
      Object.assign(selectors,
        {[EditorsSelectorAll]: true})

      const edtAry = createEdtAry(comContext, hostEle, ele, selectors, onlyShortcuts)
      if (edtAry) {
        let [ary, zoneTitle] = edtAry
        if (ary) {
          let areaCategary = new NS_Configurable.Category(zoneTitle || '区域')
          rtn.push(areaCategary)
          let group = new NS_Configurable.Group();
          areaCategary.addGroup(group)
          group.addItems(ary)
        }
      }
    }
  }

  return rtn
}

function createEdtItem(comContext: ComContext, editor: any, ele, sameAsShortcut?: boolean) {
  activeEditorAry.push(editor)

  const {model, context, emitSnap, emitLogs, emitCanvasView} = comContext
  const edtContext = getEditContext(comContext)
  if (typeof editor === 'function') {
    return new NS_Configurable.FunctionItem(function () {
      editor(edtContext)
    })
  } else if (typeof editor === 'object') {
    let options = editor.options
    if (typeof options === 'function') {
      try {
        options = editor.options(edtContext)
      } catch (ex) {
        console.error(ex)

        return new NS_Configurable.ErrorItem({
          title: `${editor.title}.options 发生错误.`,
          description: ex.message
        })
      }
    }

    let ifVisible
    if (typeof editor.ifVisible === 'function') {
      ifVisible = () => {
        const activeF = activeEditorAry.indexOf(editor) >= 0//To avoid triger observable in disactive editor
        if (activeF) {
          if (!model.focusArea || model.focusArea.isValid()) {
            const rtn = editor.ifVisible(edtContext)
            return typeof (rtn) === 'boolean' ? rtn : false
          }
        }
      }
    }

    const describer = {
      title: editor.title,
      type: editor.type,
      selector: editor.selector,
      description: editor.description,
      value: (function () {
        let initVal

        return {
          get() {
            if (!model.focusArea || model.focusArea.isValid()) {
              if (initVal !== void 0) {
                return initVal
              }
              try {
                initVal = (editor.value && editor.value.get || (() => undefined))(edtContext)
              } catch (ex) {
                console.error(ex)

                emitLogs.error(`编辑器(${editor.title}.value.get)发生错误.`, ex.message)
                return
              }

              initVal = initVal == void 0 ? null : initVal
              return initVal
            }
          },
          set(v, opt?: { ele, state: 'ing' | 'finish' }) {
            if (context.isDebugMode()) {
              return
            }
            //antiShaking().push(() => {
            if (initVal !== v) {
              const snap = emitSnap.start('Change value')
              const fn = (editor.value && editor.value.set || (() => undefined))

              if (editor.selector && opt?.ele) {
                edtContext.focusArea = {//Append focusArea
                  ele: opt.ele,
                  dataset: opt.ele.dataset
                } as any
              }

              try {
                fn(edtContext, v)
              } catch (ex) {
                console.error(ex)

                emitLogs.error(`编辑器(${editor.title}.value.set)发生错误.`, ex.message)
                return
              }

              if (model.focusArea) {
                model.focusArea.notifyEleChanged()
                setTimeout(v => {
                  if (model.focusArea && !model.focusArea.isValid()) {
                    model.focusArea = void 0//Clear it
                  }
                })
              } else {
                model.notifyEleChanged()
              }

              if (!opt || !opt.state || opt.state === 'finish') {
                model.notifyEleChanged()
                snap.commit()

                initVal = void 0
              } else {
                snap.wait()
              }
            }
            //})
          }
        }
      })(),
      options,
      ifVisible,
      ele,
      comEle: comContext.model.$el,
      canvasEle: comContext.model.root.$el
    }

    const titleFn = editor.title
    if (typeof titleFn === 'function') {
      Object.defineProperty(describer, 'title', {
        get() {
          return titleFn(edtContext)
        }
      })
    }

    sameAsShortcut = sameAsShortcut !== void 0 ? sameAsShortcut : editor.sameAs === 'shortcut'

    return new NS_Configurable.EditItem(describer, sameAsShortcut)
  } else {
    throw new Error(`Invalid typeof editor(function or object expect)`)
  }
}

export function getEditContext({context, model, emitItem, emitMessage, emitPage, emitSnap, emitIOEditor}: ComContext) {
  let focusArea
  const fa = model.focusArea
  if (fa) {
    const ele = fa.ele
    let pnode = ele.parentNode, selAll;
    if (pnode !== null) {
      focusArea = {
        ele,
        get index() {
          let selectors = Object.keys(fa.selectors).join('')
          if (selectors.endsWith('*')) {
            selectors = selectors.substring(0, selectors.length - 1)
          }

          try {
            selAll = pnode.querySelectorAll(selectors);
          } catch (ex) {
            selAll = pnode.querySelectorAll(':scope' + selectors);
          }
          return [].indexOf.call(selAll, ele);
        },
        dataset: ele.dataset
      }
    } else {
      // return {
      //   ele: model.focusArea.ele
      // }
    }
  }

  return {
    style: {
      get width() {
        if (model.style.width === '100%') {
          return model.style.width
        } else if (model.style.width === 'fit-content') {
          return model.getContentWidth()
        } else {
          return model.style.width
        }
      },
      set width(w) {
        //if (typeof (w) == 'number') {
        model.style.width = w
        //}
      },
      get height() {
        return model.style.height;
      },
      set height(h) {
        if (typeof (h) == 'number') {
          model.style.height = h
        } else if (typeof h === 'string' && h.match(/^\d+%$/)) {
          model.style.height = h
        }
      },
      get position() {
        return model.style.position
      },
      set position(ps: 'relative' | 'absolute' | 'fixed') {
        model.style.position = ps
      },
      get top(): number {
        return model.style.top
      },
      set top(x: number) {
        model.style.top = x
      },
      get right(): number {
        return model.style.right
      },
      set right(x: number) {
        model.style.right = x
      },
      get bottom(): number {
        return model.style.bottom
      },
      set bottom(x: number) {
        model.style.bottom = x
      },
      get left(): number {
        return model.style.left
      },
      set left(x: number) {
        model.style.left = x
      },
      // get position() {
      //   return model.style.layout
      // },
      // set position(po) {
      //   model.style.layout = po
      // },
      get display() {
        return model.style.display
      },
      set display(d) {
        model.style.display = d
      }
    },
    //-----Compatible for previous vc component--------------------------------------------------------------------------
    get data() {
      return model.data
    },
    // get sourceDom() {
    //   return this.focusArea ? this.focusArea.ref : this.containerDom;
    // },
    // get containerDom() {
    //   return model.$el as HTMLElement
    // },
    //-------------------------------------------------------------------------------
    title: model.runtime.title,
    focusArea,
    get slot() {
      return model.getSlotEditor(emitItem)
    },
    get input() {
      return emitIOEditor.getInput(model.id)
    },
    get output() {
      return emitIOEditor.getOutput(model.id)
    },
    get diagram() {
      return {
        edit(outputHostId: string) {
          setTimeout(v => {
            emitItem.editDiagram(model.id, outputHostId)
          })
        }
      }
    },
    get env() {
      return {
        get message() {
          return {
            warn(content: string) {
              if (typeof content === 'string') {
                emitMessage.warn(content)
              }
            }
          }
        },
        // getPage(pageId: string) {
        //   return emitPage.getPage(pageId)
        // },
        getCurPage() {
          return emitPage.getCurPage()
        },
        getPageTree() {
          return emitPage.getPageTree()
        }
      }
    }
    // setLabel(label:string){
    //   // if(typeof isTrue==='boolean'){
    //   //   model.runtime.mockF = isTrue
    //   // }
    // },
    // isModeOfDebug() {
    //   return context.isDebugMode();
    // },
    // openEditor(opts) {
    //   th.emitOpen.editor(opts)
    // }
  }
}

// function getEdtResizer(comDef: T_XGraphComDef, selectors) {
//   let edtAry;
//   if (comDef.editors && comDef.editors.on) {
//     let viewOn = comDef.editors.on.view || comDef.editors.on;
//     let rst;
//     Object.keys(selectors).find(selector => {
//       return viewOn && (edtAry = viewOn[selector]) &&
//         (rst = edtAry.find(edt => edt.type && edt.type.toUpperCase() == EditorsAPI.Reserved.resizer.type))
//     })
//     return rst
//   }
// }

function createEdtAry(comContext: ComContext, hostEle: HTMLElement, ele, selectors, onlyShortcuts: boolean)
  : [NS_Configurable.EditItem[], string] {
  const {comDef, model} = comContext
  let edtAry;
  if (comDef.editors) {
    const viewOn = comDef.editors.view || comDef.editors
    let ary = [], title
    Object.keys(selectors).forEach(selector => {
      if (viewOn && (edtAry = viewOn[selector])) {
        if (!Array.isArray(edtAry) && typeof edtAry === 'object') {
          if (!Array.isArray(edtAry.items)) {
            throw new Error(`Invalid value type for selector(${selector}) in component(${comDef.namespace}),expect {items:[],title:string}.`)
          }
          title = edtAry.title
          edtAry = edtAry.items
        }

        edtAry.forEach(edt => {
          if (onlyShortcuts) {
            if (typeof (edt) === 'object') {
              if (Array.isArray(edt.items)) {//group
                let ifVisible
                if (typeof edt.ifVisible === 'function') {
                  ifVisible = () => {
                    const rtn = edt.ifVisible(getEditContext(comContext))
                    return typeof (rtn) === 'boolean' ? rtn : false
                  }
                }

                const group = new Group({
                  title: edt.title,
                  description: edt.description,
                  sameAsShortcut: edt.sameAs === 'shortcut',
                  ifVisible
                })

                edt.items.forEach(edt2 => {
                  if (edt2.type && (edt2.sameAs === 'shortcut' || group.sameAsShortcut)) {
                    group.addItem(createEdtItem(comContext, edt2, ele))
                  }
                })
                if (group.items && group.items.length > 0) {
                  ary.push(group)
                }
              } else {
                if (edt.type && edt.sameAs === 'shortcut') {
                  ary.push(createEdtItem(comContext, edt, ele))
                }
              }
            }
          } else {
            if (typeof edt === 'function' || edt.type) {
              ary.push(createEdtItem(comContext, edt, ele))
            } else if (typeof (edt) === 'object' && Array.isArray(edt.items)) {//group
              let ifVisible
              if (typeof edt.ifVisible === 'function') {
                ifVisible = () => {
                  const rtn = edt.ifVisible(getEditContext(comContext))
                  return typeof (rtn) === 'boolean' ? rtn : false
                }
              }

              const group = new Group({
                title: edt.title,
                description: edt.description,
                sameAsShortcut: edt.sameAs === 'shortcut',
                ifVisible
              })

              edt.items.forEach(edt2 => {
                if (typeof edt2 === 'function' || edt2.type || Array.isArray(edt2.items)) {
                  group.addItem(createEdtItem(comContext, edt2, ele))
                }
              })

              if (group.items && group.items.length > 0) {
                ary.push(group)
              }
            }
          }
        })
      }
    })
    return [ary, title]
  }
}
