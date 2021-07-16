/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {ignore, Ignore, Serializable} from '@mybricks/rxui'
import {BaseUIModel, ComSeedModel} from '@sdk'
import {GeoComModel} from '../com/GeoComModel';

import {Arrays, getPosition, randomNum} from '@utils';

import {SerializeNS} from '../constants';
import {PinModel} from "../../../desn-topl-view/src/pin/PinModel";

@Serializable(SerializeNS + 'geo.SlotStyleModel')
export class SlotStyleModel {
  left: number

  top: number

  zoom: number = 1

  width: number

  height: number

  background:string
  //
  // backgroundColor: string
  //
  // backgroundImage: string

  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number

  //内部元素布局
  layout: 'flex-row' | 'flex-column' | 'absolute' = 'flex-column'

  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-around' | 'space-between' = 'flex-start'

  alignItems: 'flex-start' | 'flex-end' | 'center' = 'flex-start'

  getLayout() {
    return this.layout
  }

  isLayoutAbsolute() {
    if (this.layout) {
      return this.layout.toLowerCase() == 'absolute'
    }
    return false//default value
  }

  isLayoutOfFlexRow() {
    if (this.layout) {
      return this.layout.toLowerCase() == 'flex-row'
    }
    return false
  }

  isLayoutOfFlexColumn() {
    if (this.layout) {
      return this.layout.toLowerCase() == 'flex-column'
    }
    return false
  }

  setLayout(val: 'flex-row' | 'flex-column' | 'absolute') {
    this.layout = val;
  }

  getJustifyContent() {
    return this.justifyContent
  }

  setJustifyContent(val: 'flex-start' | 'flex-end' | 'center' | 'space-around' | 'space-between') {
    this.justifyContent = val;
  }

  getAlignItems() {
    return this.alignItems
  }

  setAlignItems(val: 'flex-start' | 'flex-end' | 'center') {
    this.alignItems = val;
  }
}

@Serializable(SerializeNS + 'geo.SlotModel')
export default class SlotModel extends BaseUIModel {
  id: string

  type: 'scope' | undefined

  title: string

  parent: GeoComModel

  comAry: GeoComModel[] = []

  style: SlotStyleModel = new SlotStyleModel()

  @Ignore
  _renderKey: string

  _rootF: boolean

  @Ignore
  comsAddedInDebug: [GeoComModel] = []

  constructor(id?: string, title?: string, asRoot?: boolean, type?: 'scope' | undefined) {
    super()
    id && (this.id = id);
    title && (this.title = title);

    if (typeof asRoot === 'boolean') {
      this._rootF = asRoot
    }
    this.type = type
  }

  get renderKey() {
    return this._renderKey || this.id
  }

  getInnerWidth() {
    const elWidth = this.$el.offsetWidth
    return elWidth - (this.style.paddingLeft||0) - (this.style.paddingRight||0)
  }

  addDebugTempCom(com: GeoComModel) {
    ignore(com)
    this.comsAddedInDebug.push(com)
  }

  clearAllTempComs() {
    this.comsAddedInDebug.forEach(com => {
      this.delete(com)
    })
  }

  setComZIndex(comId, _val) {
    let srtn;
    this.comAry.find((item, idx) => {
      if (item.id == comId) {
        srtn = [idx, item];
        return true;
      }
    })
    let [idx, item] = srtn;
    this.comAry.splice(idx, 1)
    if (typeof (_val) == 'string') {
      if (_val.toLowerCase() == 'max') {
        this.comAry.push(item)
      } else if (_val.toLowerCase() == 'min') {
        this.comAry.splice(0, 0, item)
      }
    }
    this.comAry.forEach((item, idx) => {
      if (item instanceof GeoComModel && item.style.isLayoutAbsolute()) {
        item.style.zIndex = idx;
      }
    })
  }

  isStateEnable() {
    return this.state.isEnabled()
  }

  isRoot() {
    if (typeof this._rootF === 'boolean') {
      return this._rootF
    }
    return !this.parent
  }

  addComponent(model: GeoComModel) {
    if (model && model instanceof GeoComModel) {
      if (this.style.isLayoutAbsolute()) {
        model.style.setLayout('absolute')
      }

      this.comAry.push(model)

      model.style.zIndex = this.comAry.length
    } else {
      throw new Error(`Invalid type for adding in slot.`)
    }
  }

  insertInto(model: GeoComModel, index: number) {
    const ary = []
    this.comAry.forEach((md, i) => {
      if (i == index) {
        ary.push(model)
      }
      if (md.id !== model.id) {
        ary.push(md)
      }
    })
    if (index == this.comAry.length) {
      ary.push(model)
    }
    this.comAry = ary;
  }

  upwards(model: GeoComModel): boolean {
    const idx = this.comAry.indexOf(model)
    if (idx > 0) {
      const i0 = idx - 1, i1 = idx
      this.comAry[i0] = this.comAry.splice(i1, 1, this.comAry[i0])[0]
      return true
    }
    return false
  }

  downwards(model: GeoComModel): boolean {
    const idx = this.comAry.indexOf(model)
    if (idx < this.comAry.length) {
      const i0 = idx, i1 = idx + 1
      this.comAry[i0] = this.comAry.splice(i1, 1, this.comAry[i0])[0]
      return true
    }
    return false
  }

  copyIn<T extends BaseUIModel>(model: ComSeedModel, randomPo: boolean): T {
    let calPo;
    if (this.state.isHovering()) {
      this.state.hoverRecover()
      calPo = true;
    }

    let gmodel = new GeoComModel(model)

    let slotEl = this.$el, mdEl = model.$el, tx, ty
    if (calPo) {
      let tmp = getPosition(gmodel.$el), curPo = getPosition(slotEl)
      tx = tmp.x - curPo.x, ty = tmp.y - curPo.y
      gmodel.style.zIndex = this.comAry.length
    } else if (randomPo) {
      let [v0, v1] = randomNum(20, 80)
      tx = v0
      ty = v1
    } else {
      tx = typeof gmodel.style.left != 'undefined' ? gmodel.style.left : 20
      ty = typeof gmodel.style.top != 'undefined' ? gmodel.style.top : 20
      gmodel.style.zIndex = this.comAry.length
    }

    gmodel.style.left = tx < 0 ? Math.max(-1 * mdEl.clientWidth, tx) : Math.min(tx, slotEl.clientWidth)
    gmodel.style.top = ty < 0 ? Math.max(-1 * mdEl.clientHeight, ty) : Math.min(ty, slotEl.clientHeight)

    this.comAry.push(gmodel)
    gmodel.parent = this;

    //this.focusItem(gmodel)
    return gmodel as T
  }

  cutIn(model: GeoComModel, randomPoOrOrder?: boolean | number) {
    //model.parent.release(model)

    model.parent.delete(model)

    if (model.style.isLayoutAbsolute()) {
      let calPo;
      if (this.state.isHovering()) {
        this.state.hoverRecover()
        calPo = true;
      }

      let slotEl = this.$el, mdEl = model.$el, tx, ty
      if (calPo) {
        const tmp = getPosition(model.$el), curPo = getPosition(slotEl)
        tx = tmp.x - curPo.x, ty = tmp.y - curPo.y
        model.style.zIndex = this.comAry.length
      } else if (typeof (randomPoOrOrder) === 'boolean') {
        let [v0, v1] = randomNum(20, 50)
        tx = v0
        ty = v1
      } else {
        tx = typeof model.style.left != 'undefined' ? model.style.left : 20
        ty = typeof model.style.top != 'undefined' ? model.style.top : 20
        model.style.zIndex = this.comAry.length
      }

      model.style.left = tx < 0 ? Math.max(-1 * mdEl.clientWidth, tx) : Math.min(tx, slotEl.clientWidth)
      model.style.top = ty < 0 ? Math.max(-1 * mdEl.clientHeight, ty) : Math.min(ty, slotEl.clientHeight)

      this.comAry.push(model)
    } else {
      if (typeof randomPoOrOrder === 'number') {
        this.comAry.splice(randomPoOrOrder, 0, model)
      } else {
        this.comAry.push(model)
      }
    }

    model.parent = this;

    //this.focusItem(model)
    return model
  }

  searchCom<T extends BaseUIModel>(id: string): GeoComModel {
    if (this.comAry) {
      let rtn;
      this.comAry.find(item => {
        if (item.id == id) {
          rtn = item;
          return true;
        } else {
          return Arrays.find(slot => {
            rtn = slot.searchCom(id);
            if (rtn) {
              return true;
            }
          }, item.slots, item.runtime.model.slotAry)
        }
      })
      return rtn;
    }
  }

  release(model: BaseUIModel) {
    if (model instanceof GeoComModel) {
      let ary = [];
      this.comAry.forEach(md => {
        if (md.id != model.id) {
          ary.push(md)
        }
      })
      this.comAry = ary
    }
  }

  delete(model: GeoComModel): boolean {
    const delInSlot = (slot: SlotModel) => {
      if (slot.comAry) {
        const idx = slot.comAry.indexOf(model)
        if (idx >= 0) {
          slot.comAry.splice(idx, 1)
          return true
        }
        return slot.comAry.find(com => {
          if (com.slots) {
            return com.slots.find(slot => delInSlot(slot))
          }
        })
      }
    }

    if (model instanceof GeoComModel) {
      delInSlot(this)
      //
      // // if(model.runtime.def.namespace.endsWith('toolbar')){
      // //   debugger
      // // }
      // const itemAry = this.comAry
      // const idx = itemAry.indexOf(model)
      // itemAry.splice(idx, 1)
      // //this.itemAry.sort()
      // // itemAry.find((md, idx) => {
      // //   if (md === model) {
      // //     itemAry.splice(idx, 1)
      // //     itemAry.sort()
      // //     return true
      // //   }
      // // })
      return
    }


    // if (model instanceof ComInstanceModel
    //   || model instanceof GeoComModel) {
    //   let md = this.searchCom(model.id) as BaseModel
    //   if (md) {
    //     md.state.disable()
    //     md.destroy();
    //   }
    //   return true;
    // }
  }

  // focusItem(model: BaseModel) {
  //   if (model instanceof GeoComModel || model instanceof SlotModel) {
  //     this.blur()
  //
  //     model.focus()
  //     if (model instanceof GeoComModel) {
  //       this.focusModelAry.push(model)
  //     }
  //   }
  // }

  focus() {
    this.state.focus()
  }

  // blur() {
  //   if (this.focusModelAry) {
  //     this.focusModelAry.forEach(item => {
  //       if (item instanceof GeoComModel) {
  //         item.blur()
  //       }
  //     })
  //   }
  //   this.focusModelAry = []
  // }

  findHoveringSlot(): SlotModel {
    if (this.state.isHovering()) {
      return this
    }
    let found: SlotModel;
    this.comAry.find(
      item => {
        if (item instanceof GeoComModel && item.slots) {
          item.slots.find(sm => {
            if (sm.state.isHovering()) {
              found = sm
              return true
            } else {
              if (found = sm.findHoveringSlot()) {
                return true
              }
            }
          })
        }
      }
    )
    return found
  }

  findSlotByPo({x, y, w, h}: { x: number, y: number, w?: number, h?: number }, except: GeoComModel): SlotModel {
    w = w || 5
    h = h || 5

    let found: SlotModel;
    this.comAry.find(
      item => {
        if (item instanceof GeoComModel && item.id !== except.id && item.slots) {
          const model = item as GeoComModel
          if (model.style.isVisible()) {
            model.slots.forEach(sm => {
              if (sm.$el) {
                const po = getPosition(sm.$el), w1 = sm.$el.clientWidth, h1 = sm.$el.offsetHeight;
                if (Math.max(x + w, po.x + w1) - Math.min(x, po.x) < w + w1
                  &&
                  Math.max(y + h, po.y + h1) - Math.min(y, po.y) < h + h1) {//have intersection
                  if (!(found = sm.findSlotByPo({x, y, w, h}, except))) {
                    found = sm;
                  }
                  return true;
                }
              }
            })
          }
        }
      }
    )
    if (found) {
      return found;
    }
    return this;
  }

  clearDebugs() {
    this.comAry.forEach(item => {
      item.clearDebug()
    })
  }

  toJson() {
    const rtn: {
      id,
      type,
      title,
      name,
      style,
      _rootF,
      comAry
    } = {}

    rtn.id = this.id
    rtn.type = this.type
    rtn.title = this.title
    rtn.name = this.name
    rtn._rootF = this._rootF

    if (this.comAry.length > 0) {
      const comAry = []
      this.comAry.forEach(com => {
        comAry.push(com.runtime.toJson())
      })
      rtn.comAry = comAry
    }

    return rtn
  }
}
