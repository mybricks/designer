/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {clone, Ignore, Serializable} from '@mybricks/rxui';
import ToplBaseModel from '../ToplBaseModel';
import {E_ItemType, I_Pin, T_PinDirection} from '@mybricks/compiler-js';
import {ConModel} from '../con/ConModel';
import {SerializeNS} from '../constants';
import {I_PinModel, T_PinSchema} from "@sdk";
import {ToplComModel} from "../com/ToplComModel";
import FrameModel from "../frame/FrameModel";

//require('./PinModelForked').default;

export type T_PinType = 'normal' | 'ext'

@Serializable(SerializeNS + 'topl.PinModel')
export class PinModel extends ToplBaseModel implements I_PinModel {
  static joinerWidth: number = 10

  _type: E_ItemType.PIN = E_ItemType.PIN

  type: T_PinType = 'normal'

  direction: T_PinDirection

  //The actual pipe id
  /**
   * @deprecated
   */
  hostId: string

  title: string = void 0

  //Max connnections number
  conMax: number

  //@Ignore
  schema: T_PinSchema

  deletable: boolean = false

  rels: string[]

  //Connection
  conAry: Array<ConModel> = []

  dummyData

  //Edit result
  _mockData

  @Ignore
  hover: boolean = false

  @Ignore
  hint: boolean

  @Ignore
  emphasized: boolean

  @Ignore
  mockData

  @Ignore
  exe: { val, from }

  proxyPin: I_Pin;

  // get $el(): HTMLElement {
  //   return document.getElementById(this.id) as HTMLElement
  // }
  //
  //constructor()
  constructor(
    type: T_PinType,
    direction: T_PinDirection,
    hostId: string,
    title: string,
    schema: T_PinSchema,
    conMax?: number | null,
    deletable?: boolean,
    rels?: string[]
  ) {
    super()
    if (type) {
      this.type = type
      this.direction = direction
      //this.hostId = hostId
      this.hostId = hostId
      this.title = title
      this.schema = schema as any

      if (conMax !== void 0) {
        this.conMax = conMax as number
      }
      if (deletable !== void 0) {
        this.deletable = deletable as boolean
      }
      if (this.isDirectionOfInput() && rels) {
        this.rels = rels
      }
    }
  }

  isTypeOfNormal() {
    return this.type.match(/^normal$/gi)
  }

  isTypeOfExt() {
    return this.type.match(/^ext$/gi) !== null
  }

  // ifInModel() {
  //   if (this.parent instanceof ToplComModel) {
  //     const comModel: ToplComModel = this.parent as ToplComModel
  //     if (this.isDirectionOfInput()) {
  //       return comModel.inputPinsInModel.find(pin => pin.hostId === this.hostId)
  //     } else {
  //       return comModel.outputPinsInModel.find(pin => pin.hostId === this.hostId)
  //     }
  //   }
  // }

  isDirectionOfInput() {
    return this.direction.match(/^input|inner-output$/gi) !== null
  }

  isSchemaRquestOfFollow() {
    let request
    const thSchema = this.schema
    if (thSchema && (request = thSchema.request)) {
      if (request[0] && request[0].type === 'follow') {
        return true
      }
    }
    return false
  }

  isSchemaResponseOfFollow() {
    let response
    const thSchema = this.schema
    if (thSchema && (response = thSchema.response)) {
      if (response[0] && response[0].type === 'follow') {
        return true
      }
    }
    return false
  }

  addCon(conModel: ConModel) {
    this.conAry.push(conModel)
  }

  hadConToPin(pin: PinModel): boolean {
    if (this.conAry && pin.conAry) {
      return (
        this.conAry.find(
          con => pin.conAry.find(tcon => tcon.id == con.id) !== undefined
        ) !== undefined
      )
    }
    return false
  }

  deleteCon(conModel: ConModel) {
    let idx
    this.conAry.find((con, i) => {
      if (con.id === conModel.id) {
        idx = i
        return true
      }
    })

    if (typeof idx === 'number') {
      this.conAry.splice(idx, 1)
    }

    this.blur()

    //setTimeout(v=>this.destroy())
  }

  emphasize() {
    this.emphasized = true
    if (this.conAry) {
      this.conAry.forEach(con => {
        con.emphasize()
      })
    }
  }

  emphasizeRecover() {
    this.emphasized = false
    if (this.conAry) {
      this.conAry.forEach(con => {
        con.emphasizeRecover()
      })
    }
  }

  focus(mySelf?: boolean) {
    if (!this.state.isFocused()) {
      super.focus()
      if (!mySelf) {
        this.conAry.forEach(con => {///TODO -> hover
          con.focus()
          con.startPin && con.startPin.focus()
          con.finishPin && con.finishPin.focus()
        })
      }
    }
  }

  hoverExeval(val, from) {
    this.exe = {val, from}
    this.state.running()
  }

  blur() {
    if (this.state.isFocused()) {
      super.blur()
      this.conAry.forEach(con => {
        con.blur()
        con.startPin.blur()
        con.finishPin.blur()
      })
    }
  }

  //_order

  get order() {
    return getOrder(this)
  }

  getJoinerWidth() {
    // if(!this._order){
    //   const index = getOrder(this)
    //   //const r = randomX(0,10,index+2)
    //   //console.log(r)
    //   //this._order = (index+1)*PinModel.joinerWidth+r
    //   this._order = (index+1)*PinModel.joinerWidth
    // }
    //let order = getOrder(this)
    const index = this.order


    const charLength = this.title.replace(/[\u0391-\uFFE5]/g, "aa").length

    return Math.max(charLength * 5.4 + 14, PinModel.joinerWidth) + index * 3
    //return PinModel.joinerWidth
  }

  fork(parent: ToplComModel | FrameModel) {
    const PinModelForked = require('./PinModelForked').default
    const rtn = new PinModelForked()

    rtn.id = this.id//Same id
    rtn.parent = parent
    rtn.forkedFrom = this

    //rtn.title = this.title

    // if (this.schema) {
    //   rtn.schema = JSON.parse(JSON.stringify(this.schema))
    // }
    // rtn.conMax = this.conMax
    //
    // rtn.deletable = this.deletable
    // rtn.dummyData = this.dummyData

    return rtn
  }

  toJson() {
    const rtn: any = {}

    //const parentType = this.parent instanceof ToplComModel ? 'com' : 'frame'

    rtn.id = this.id
    //rtn.parent = {type: parentType, id: this.parent.id}
    rtn.type = this.type
    rtn.direction = this.direction
    rtn.hostId = this.hostId
    rtn.title = this.title
    if (this.proxyPin) {
      rtn.proxyPin = {
        id: this.proxyPin.id
      }
    }
    if (this.schema) {
      rtn.schema = clone(this.schema)
    }
    rtn.conMax = this.conMax

    rtn.deletable = this.deletable
    rtn.dummyData = this.dummyData

    return rtn
  }

  destroy() {
    this.conAry.forEach(con => con.destroy())
  }

  clearDebugHints() {
    this.state.enable()
    this.exe = void 0
  }

  _exe
}

function getOrder(pinModel: PinModel): number {
  let el = pinModel.$el
  let index = [].indexOf.call(el.parentNode.childNodes, el);
  return index
}

function randomX(min, max, times) {
  let rtn = 0
  for (let i = 0; i < times; i++) {
    rtn += Math.random() * (max - min + 1) + min
  }
  return rtn
}

