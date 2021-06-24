import {clone, Ignore, Serializable} from '@mybricks/rxui';
import ToplBaseModel from '../ToplBaseModel';
import {E_ItemType, I_Joint} from '@mybricks/compiler-js';
import {ConModel} from '../con/ConModel';
import FrameModel from '../frame/FrameModel';
import {SerializeNS} from '../constants'

type JointType = 'input' | 'output'

@Serializable(SerializeNS + 'topl.JointModel')
export class JointModel extends ToplBaseModel implements I_Joint {
  _type: E_ItemType.JOINT = E_ItemType.JOINT

  type: JointType

  title:string

  position: { y: number } = {}

  //Connection
  from: ConModel

  to: ConModel

  parent: FrameModel

  //Order in joints
  order: number = 0

  @Ignore
  exeValue = null

  toJson() {
    const rtn: any = {}

    rtn.id = this.id
    //rtn.parent = {type: 'frame', id: this.parent.id}
    rtn.position = clone(this.position)
    rtn.type = this.type
    //rtn.from = {id: this.from.id}
    //rtn.to = {id: this.to.id}
    rtn.order = this.order

    return rtn
  }

  constructor(type: JointType, y: number, order: number) {
    super();
    this.type = type;
    this.position = {y}
    this.order = order
  }

  getJoinerWidth() {
    return (this.order + 1) * 15
  }

  focus() {
    if (!this.state.isFocused()) {
      super.focus()
      this.from && this.from.focus()
      this.to && this.to.focus()
    }
  }

  blur() {
    if (this.state.isFocused()) {
      super.blur()

      if (this.from) {
        this.from.blur()
        this.from.startPin.blur()
        this.from.finishPin.blur()
      }

      if (this.to) {
        this.to.blur()
        this.to.startPin.blur()
        this.to.finishPin.blur()
      }
    }
  }

  hoverExeval(val) {
    this.exeValue = val
    this.state.running()
  }

  hoverAllCon() {
    this.from.focus()
    this.to.focus()
  }

  clearDebugHints() {
    this.state.enable()
    this.exeValue = void 0
  }

  destroy() {
    //debugger
    const from = this.from, to = this.to
    if (from) {
      this.from = void 0
      from.destroy()
    }
    if (to) {
      this.to = void 0
      to.destroy()
    }
    this.parent.delete(this)
  }
}
