import {Ignore, Serializable} from '@mybricks/rxui'

import SlotModel from '../slot/SlotModel';
import GeoViewModel from '../slot/GeoViewModel';

import {ComSeedModel, NS_Configurable, NS_Emits, NS_Listenable, NS_XGraphComLib} from '@sdk';
import {SerializeNS} from '../constants';
import css from "./normal/Normal.less";
import {UNDEFINED_FRAME_LABEL} from "@mybricks/compiler-js";
import GeoComDebugModel = require('./GeoComDebugModel');
import I_Configurable = NS_Configurable.I_Configurable;
import I_Listenable = NS_Listenable.I_Listenable;

class FocusAreaModel {
  _eleChanged: number = 0

  title?: string

  ele: HTMLElement

  selectors: string

  editorPath: { title: string, ele: HTMLElement }[]

  private elePre

  private eleNext

  constructor(ele, selectors, editorPath, title) {
    this.ele = ele
    this.selectors = selectors
    this.editorPath = editorPath
    this.title = title

    this.elePre = ele.previousSibling
    this.eleNext = ele.nextSibling
  }

  isValid() {
    let tp = this.ele.parentElement
    while (tp) {
      tp = tp.parentElement
      if (tp === document.body) {
        return true
      }
    }
    return false
    //return this.ele && this.ele.parentElement && this.ele.parentElement.parentElement
  }

  // isValid1() {
  //   return this.ele
  //     && this.ele.parentElement
  //     && this.ele.previousSibling === this.elePre
  //     && this.ele.nextSibling === this.eleNext
  // }


  clear() {
    this.ele.classList.remove(css.editableFocus)
  }

  listenForEleChanged() {
    this._eleChanged
  }

  notifyEleChanged() {
    this._eleChanged = ~this._eleChanged
  }
}

@Serializable(SerializeNS + 'geo.GeoComModel')
export class GeoComModel extends ComSeedModel implements I_Configurable, I_Listenable {
  init: boolean = false;

  parent: SlotModel

  slots: Array<SlotModel>

  @Ignore
  initDom: boolean = false;

  //当前位于焦点的区域（用于组件编辑）
  @Ignore
  focusArea: FocusAreaModel

  @Ignore
  editorPath: { title: string, ele: HTMLElement }[]

  @Ignore
  events: { click: Array<Function>, mouseenter: Array<Function> } = {
    click: [],
    mouseenter: []
  }

  @Ignore
  debugs: { [slotLabel: string | number]: GeoComDebugModel } = {}

  @Ignore
  _eleChanged: number = 0

  get style() {
    return this.runtime.model.style
  }

  constructor(instance?: ComSeedModel) {
    super(instance);

    this.getConfigs = void 0
    this.getListeners = void 0
  }

  getContentWidth() {
    return this.$el.firstChild.offsetWidth
  }

  listenForEleChanged() {
    this._eleChanged
  }

  notifyEleChanged() {
    this._eleChanged = ~this._eleChanged
  }

  setFocusArea(ele, selectors, editorPath, title?) {
    this.focusArea = new FocusAreaModel(ele, selectors, editorPath, title)
  }

  get viewStyle(): { zoom: number } {
    let root = this.root as GeoViewModel;
    return root.style
  }

  get root(): SlotModel {
    let parent = this.parent;
    while (parent) {
      if (typeof parent.isRoot === "function" && parent.isRoot()) {
        break
      }
      parent = parent.parent as any;
    }
    return parent as SlotModel
  }

  getSlot(id: string): SlotModel {
    if (this.slots) {
      return this.slots.find(slot => slot.id === id) as SlotModel
    }
  }

  removeSlot(id: string): SlotModel {
    if (this.slots) {
      let sindex;
      const slot = this.slots.find((slot, sidx) => {
        if (slot.id === id) {
          sindex = sidx
          return true
        }
      })
      if (!slot) {
        throw new Error(`Slot(id=${id}) not found.`)
      }
      this.slots.splice(sindex, 1)
      return slot
    }
  }

  addEvent(type: 'click' | 'mouseenter', fn: Function) {
    this.events[type].push(fn)
  }

  setZIndex(_val) {
    this.parent.setComZIndex(this.id, _val)
  }

  focus() {
    this.state.focus()
    if (this.focusArea) {
      this.state.editing()
    }
    setVisibily(this, 'visible')
  }

  addSlot(id, title, asRoot?, type?): SlotModel {
    const sm = new SlotModel(id, title, asRoot, type);
    sm.parent = this;
    (this.slots = this.slots || []).push(sm)
    return sm
  }

  blur() {
    if (this.state.isFocused()) {
      setVisibily(this, 'hidden')
      if (this.focusArea) {
        this.focusArea.clear()
        this.focusArea = void 0
      }

      this.state.blur()
    }
  }

  cutIn(model: GeoComModel, toSlotId: string, randomPo) {
    if (this.slots) {
      const target = this.slots.find(slot => slot.id === toSlotId)
      if (target) {
        target.cutIn(model, randomPo)
        return true;
      }
    }
  }

  toJson() {
    const rt = this.runtime
    const json = {} as any

    json.id = this.id

    if (this.slots && this.slots.length > 0) {
      const slots = []
      this.slots.forEach(slot => {
        slots.push(slot.toJson())
      })
      json['slots'] = slots
    }

    return json
  }

  getSlotEditor(emitItem: NS_Emits.Component) {
    let md = this;
    return {
      get(id) {
        const slot = md.getSlot(id)
        if (slot) {
          return {
            id: slot.id,
            title: slot.title,
            getLayout() {
              return slot.style.getLayout()
            },
            setLayout(layout: 'flex-row' | 'flex-column' | 'absolute') {
              if (layout && layout.match(/flex-row|flex-column|absolute/)) {
                slot.style.setLayout(layout)
              }
            },
            getJustifyContent() {
              return slot.style.getJustifyContent()
            },
            setJustifyContent(justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-around' | 'space-between') {
              if (justifyContent && justifyContent.match(/flex-start|center|flex-end|space-around|space-between/)) {
                slot.style.setJustifyContent(justifyContent)
              }
            },
            getAlignItems() {
              return slot.style.getAlignItems()
            },
            setAlignItems(alignItems: 'flex-start' | 'flex-end' | 'center') {
              if (alignItems && alignItems.match(/flex-start|center|flex-end/)) {
                slot.style.setAlignItems(alignItems)
              }
            }
          }
        }
      },
      add(id, title?) {
        emitItem.addSlot(md.id, id, title)
      },
      setTitle(id, title?) {
        emitItem.setSlotTitle(md.id, id, title)
      },
      remove(id) {
        emitItem.removeSlot(md.id, id)
        // const slotModel = md.removeSlot(id)
        // if (slotModel) {
        //   slotModel.comAry.forEach(item => {
        //     emitItem.delete(item)//Notify to delete toplcoms
        //   })
        // }
      }
    }
  }

  getConfigs(): Array<NS_Configurable.Category> {
    throw new Error(`Not implements`)
  }

  getListeners(): Array<NS_Listenable.T_Listener> {
    throw new Error(`Not implements`)
  }

  getDebug(scopePath?: string, slotLabel?: string): GeoComDebugModel {
    if (slotLabel === void 0) {
      //slotLabel = this.runtime.defaultFrameLabel
      slotLabel = UNDEFINED_FRAME_LABEL
    }
    if (scopePath) {
      return this.debugs[scopePath + slotLabel]
    } else {
      return this.debugs[slotLabel]
    }
  }

  setDebug(scopePath: string, frameLable: string, {inputs, outputs, frames, inputParams}) {
    const GeoComDebugModel = require('./GeoComDebugModel').default
    const md = new GeoComDebugModel()

    md.parent = this.parent
    md.runtime = this.runtime.clone()

    // if(this.runtime.def.namespace.endsWith('normal')){
    //   console.log(inputs['__id__'])
    //   debugger
    // }

    md.slots = this.slots
    md.inputs = inputs
    md.outputs = outputs
    md.frames = frames
    md.inputParams = inputParams

    if (scopePath.indexOf(':') === -1) {
      this.debugs[frameLable] = md
    } else {
      this.debugs[scopePath + frameLable] = md
    }

    return md;
  }

  clearDebug() {
    this.debugs = {}
    if (this.slots) {
      this.slots.forEach(slot => {
        slot.comAry.forEach(sitem => {
          sitem.clearDebug()
        })
      })
    }
  }
}

function setVisibily(model: GeoComModel, visibility) {
  let tc: GeoComModel = model
  while (tc) {
    if (!tc.style.isVisible()) {
      if (tc.$el) {
        if (visibility === 'visible') {
          tc.$el.style.position = 'static'
        } else {
          tc.$el.style.position = 'absolute'
        }
        tc.$el.style.visibility = visibility
      }
      tc = void 0
    } else {
      tc = tc.parent.parent
    }
  }
}

// setTimeout(()=>{
//   // const fmAry = this.root.focusModelAry
//   //
//   // debugger
//   const focusInChildren = function (com: GeoComModel) {
//     if (com.slots) {
//       return com.slots.find(slot => {
//         if (slot.itemAry) {
//           if (slot.itemAry.find(item => {
//             let yes
//             if (item.state.isFocused()) {
//               yes = true
//             } else {
//               yes = focusInChildren(item as GeoComModel)
//             }
//             return yes
//           })) {
//             return true
//           }
//         }
//       })
//     }
//   }
//
//   if (!focusInChildren(this)) {
//     this.visibleTemp = false
//   }
// })