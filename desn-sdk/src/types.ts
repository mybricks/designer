/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {FunctionComponent} from "react";
import ComStyle from "./ComStyle";
import {I_Connection, I_Frame, I_Node, I_Pin} from "@mybricks/compiler-js";
import BaseUIModel from "./BaseUIModel";

export type T_DesnConfig = {
  mode: 'debug' | 'dev' | 'production'

  comlibLoader: ()=>Promise<[]>

  editorLoader:({type, options, ele})=>{}

  com: { env: {} }

  stageView: {
    geo: {
      zoom: number
      type: 'mobile' | 'pc'
      layout: 'absolute'
      height: number
      width: number
      style: {}
    }
  }

  editView: {
    items: [{
      title: string, items: [{
        title: string,
        type: string,
        options: any,
        value: { get, set }
      }]
    }]
  }
}

/**
 * XGraph组件定义
 */
export type T_XGraphComDef = {
  id: string

  namespace: string

  version: string

  rtType: 'js' | 'react' | 'vue' | 'nodejs'

  title: string

  icon: string

  author: string

  enable: boolean

  visibility: boolean

  // extension: {
  //   pointId: string
  //   instId: string
  // }

  data?: { [name: string]: any }

  runtime: Function

  editors: {
    '@render'?: { topl: Function }

    '@init'?: Function

    '*'?: {}[]

    view?: {}

    logic?: {}
  }

  help?: FunctionComponent

  inputs?: Array<T_IOPin>

  outputs?: Array<T_IOPin>

  slots?: Array<T_XGSlot>

  upgrade?: ({data, slot, input, output}) => boolean

  assistence?: {
    inputs?: {
      title: string,
      exe: (schema) => { data: {}, output: { id: string, title?: string } }
    }[],
    outputs?: {
      title: string,
      exe: (schema) => { data: {}, input: { id: string, title?: string } }
    }[]
  }
}

type T_XGSlot = {
  id: string
  title: string
  type: 'scope' | undefined
  editable: boolean
  inputs?: Array<T_Item>
  outputs?: Array<T_Item>
}

export type T_XGraphComLib = {
  id: string

  title: string

  icon: string

  author: string

  version: string

  //comAray: (T_XGraphComDef | { title: string, comAray: T_XGraphComDef[] })[]

  comAray: T_XGraphComDef[]

  visible?: boolean
}

export type T_ComDef = {
  //libId: string//In published lib
  //instId?: string//In published lib
  namespace: string
  version: string
  rtType: 'js' | 'react' | 'vue' | 'nodejs'
  // extension?: {
  //   pointId: string
  //   instId: string
  // }
}

type T_ComRTPin = {
  hostId: string,
  title: string,
  schema: T_PinSchema,
  conMax?: number | null,
  deletable?: boolean
}[]

export type T_ComRuntimeScript = {
  type: 'js' | 'extComponent',
  content: string,
  data?: any
}

export type T_ComRuntime = {
  id: string
  title: string
  model
  def: T_ComDef
}

export type T_ComRuntimeModel<DataType> = {
  data: DataType
  // slotAry: [],
  // frameAry?: [],
  inputAry: T_ComRTPin
  outputAry: T_ComRTPin

  //Runtime script（generated by blockly | js | extPoint)
  script: T_ComRuntimeScript
  style: ComStyle
}

export type T_IOPin = {
  id: string
  title: string
  schema: {
    request: T_JSONSchema[]
    response: T_JSONSchema[]
  }
}

export type T_Item = {
  id: string
  title: string
}

type T_ItemState = {
  enable: () => void
  disable: () => void
  isEnabled: () => boolean
}

export type T_Slot = T_Item & {
  name: string
  displayType: string
  state: T_ItemState
  searchCom: Function
  inputs?: Array<T_Item>
  outputs?: Array<T_Item>
  toJSON: () => string
}

export type T_Frame = {
  id: string
  name: string
  asRoot: boolean
  state: T_ItemState
  hostId: string
  title: string
  inputs?: Array<T_Item>
  addInputPin(hostId: string, title: string, schema: T_PinSchema, conMax?: number, deletable?: boolean)
  outputs?: Array<T_Item>
  searchCom: Function
}

export type T_Outliner = {
  id: string
  title: string
  icon: string
  ref: FunctionComponent
  focus: boolean
  items?: T_Outliner[]
}

export type T_JSONSchema = {
  title?: string,
  type: 'string' | 'number' | 'object' | 'array' | 'any' | 'null' | 'follow'
}

export type T_PinSchema = {
  request: T_JSONSchema[],
  response: T_JSONSchema[]
}

//---------------------------------------------------------------------
export interface I_GeoComModel {
  slots: T_Slot[]

  setDebug(scopePath, frameLable, {inputs, outputs, frames})

  toJson(): {}
}

export interface I_FrameModel extends I_Frame {
  searchCom<T extends BaseUIModel>(id: string)

  // addComponent<T extends I_PinModel | JointModel | ToplComModel | I_ConModel>(model: T): T
  //
  // addConnection(from: I_PinModel | JointModel,
  //               to: PinModel | JointModel)
}

export interface I_ToplComModel extends I_Node {
  runtime: T_ComRuntime

  style: {
    left: number,
    top: number,
    width: number,
    height: number
  }

  getFrame(id: string): I_FrameModel

  toJson(): {}
}

export interface I_PinModel extends I_Pin {
  $el: HTMLElement

  parent: I_ToplComModel | I_Frame

  order: number

  isTypeOfExt(): boolean

  isDirectionOfInput(): boolean

  focus()

  blur()
}

export interface I_ConModel extends I_Connection {

}