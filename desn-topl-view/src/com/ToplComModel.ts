import {PinModel} from '../pin/PinModel'
import {Arrays, assetPinSchema, deepClone} from '@utils'

import FrameModel from '../frame/FrameModel'

import {E_ItemType, I_Node} from '@mybricks/compiler-js';
import {clone, Ignore, Serializable} from '@mybricks/rxui';
import {BaseUIModel, ComSeedModel, NS_Emits, T_PinSchema, T_XGraphComDef} from '@sdk';
import {SerializeNS} from '../constants';
import {JointModel} from "../joint/JointModel";
import DiagramModel from "../frame/diagram/DiagramModel";

// import {ToplComModelForked} from "./ToplComModelForked";

@Serializable(SerializeNS + 'topl.ToplComModel')
export class ToplComModel extends ComSeedModel implements I_Node {
  _type: E_ItemType.NODE = E_ItemType.NODE

  _key: string//Some toplCom(forked one) has same id

  init: boolean = false

  parent: FrameModel | DiagramModel

  get renderKey() {
    return this.id
  }

  //forkedTo: ToplComModel[] = []

  @Ignore
  error: { message: string }

  folded: boolean

  style: {
    left: number,
    top: number,
    width: number,
    height: number
  } = {}

  foldedStyle: {
    width: number,
    height: number
  } = {}

  inputPins: PinModel[] = []

  inputPinsInModel: PinModel[] = []

  inputPinExts: PinModel[] = []

  outputPins: PinModel[] = []

  outputPinsInModel: PinModel[] = []

  outputPinExts: PinModel[] = []

  frames: FrameModel[]

  constructor(instanceModel: ComSeedModel,
              comDef?: T_XGraphComDef,
              io?: { inputs?: string[], outputs?: string[] }) {
    super(instanceModel)
    if (!comDef) return

    assetComDef(comDef)

    const rtModel = instanceModel.runtime.model
    if (rtModel) {
      if (rtModel.inputAry) {
        rtModel.inputAry.forEach(pin => {
          this.addInputPinInModel(pin.hostId, pin.title, pin.schema)
        })
      }
      if (rtModel.outputAry) {
        rtModel.outputAry.forEach(pin => {
          this.addOutputPinInModel(pin.hostId, pin.title, pin.schema)
        })
      }
    }

    let allowInputs,allowOutputs
    if(io){
      allowInputs = {}
      allowOutputs = {}
      if(Array.isArray(io.inputs)){
        io.inputs.forEach(id=>{
          allowInputs[id] = true
        })
      }
      if(Array.isArray(io.outputs)){
        io.outputs.forEach(id=>{
          allowOutputs[id] = true
        })
      }
    }

    if (comDef.inputs) {
      comDef.inputs.forEach(pin => {
        if(allowInputs&&!allowInputs[pin.id]){
          return
        }
        let schema;
        try {
          schema = assetPinSchema(pin)
        } catch (ex) {
          console.warn(ex)
        }
        this.addInputPin({hostId: pin.id, title: pin.title, schema, rels: pin.rels})
      })
    }

    if (comDef.outputs) {
      comDef.outputs.forEach(pin => {
        if(allowOutputs&&!allowOutputs[pin.id]){
          return
        }

        let schema;
        try {
          schema = assetPinSchema(pin)
        } catch (ex) {
          console.warn(ex)
        }
        this.addOutputPin(pin.id, pin.title, schema)
      })
    }

    if (comDef.slots && comDef.slots.length > 0) {
      let frames = []
      comDef.slots.forEach((def) => {
        if (def.type && def.type === 'scope') {
          const frame = new FrameModel(def.id, def.title)
          frame.parent = this
          if (def.editable === false) {
            frame.editable = false
          }
          if (def.inputs) {
            def.inputs.forEach(({id, title, schema}, idx) => {
              frame.addInputPin(id, title, schema)
            })
          }
          if (def.outputs) {
            def.outputs.forEach(({id, title, schema}, idx) => {
              frame.addOutputPin(id, title, schema)
            })
          }
          frames.push(frame)
        }
      })
      if (frames.length > 0) {
        this.frames = frames
      }
    }
  }

  @Ignore
  debugs

  @Ignore
  debugProxy: { inputParams: {}, inputs?: {}, outputs: {} }

  // removeForkedTo(com:ToplComModel){
  //   if(this.forkedTo){
  //     const idx = this.forkedTo.indexOf(com)
  //     this.forkedTo.splice(idx,1)
  //   }
  // }

  get inputJoints(): JointModel[] {
    let rtn = []
    if (this.frames) {
      this.frames.forEach(frame => {
        rtn = rtn.concat(frame.inputJoints)
      })
    }

    return rtn
  }

  get outputJoints(): JointModel[] {
    let rtn = []
    if (this.frames) {
      this.frames.forEach(frame => {
        rtn = rtn.concat(frame.outputJoints)
      })
    }

    return rtn
  }

  searchPin(id: string) {
    return Arrays.find(pin => pin.id === id, ...this.getInputsAll(), ...this.getOutputsAll())
  }

  searchPinByHostId(hostId: string) {
    return Arrays.find(pin => pin.hostId === hostId, ...this.getInputsAll(), ...this.getOutputsAll())
  }

  searchOutputByHostId(hostId: string) {
    return Arrays.find(pin => pin.hostId === hostId, ...this.getOutputsAll())
  }

  exist() {
    return this.parent.comAry.indexOf(this) >= 0
  }

  addFrame(hostId: string, title?: string, name?: string, rootF?: boolean): FrameModel {
    if (!this.frames) {
      this.frames = []
    }
    const frame = new FrameModel(hostId, title, rootF)
    frame.parent = this
    if (name) {
      frame.name = name
    }
    this.frames.push(frame)
    return this.frames[this.frames.length - 1]
  }

  removeFrame(id: string) {
    if (this.frames) {
      let sidx
      this.frames.find((item, idx) => {
        if (item.id === id) {
          sidx = idx
        }
      })
      if (sidx !== void 0) {
        this.frames.splice(sidx, 1)
      }
    }
  }

  getFrame(id: string) {
    return this.frames ? this.frames.find(frame => frame.id === id) : void 0
  }

  get root(): FrameModel {
    let rtn = this
    while (rtn.parent) {
      rtn = rtn.parent as any
      if (rtn instanceof FrameModel && rtn._rootF) {
        break
      }
    }
    return rtn as FrameModel
  }

  searchCom(id: string): ToplComModel {
    if (this.id === id) {
      return this
    }
    let rtn: ToplComModel
    if (this.frames) {
      this.frames.find(frame => {
        rtn = frame.searchCom(id)
        if (rtn) {
          return true
        }
      })
    }
    return rtn;
  }

  searchFrame(id: string): FrameModel {
    let rtn: FrameModel
    if (this.frames) {
      this.frames.find(frame => {
        rtn = frame.searchFrame(id)
        if (rtn) {
          return true
        }
      })
    }
    return rtn;
  }

  addInputPin(opts: {
                hostId: string,
                title: string,
                schema?: T_PinSchema,
                rels?: string[],
                conMax?: number
              }
  ): PinModel
  addInputPin(_hostId: string,
              _title: string,
              _schema: T_PinSchema,
              _conMax?: number): PinModel {
    let hostId,
      title,
      schema,
      rels,
      conMax
    if (typeof arguments[0] === 'object') {
      const opts = arguments[0]

      hostId = opts.hostId
      title = opts.title
      schema = opts.schema
      rels = opts.rels
      conMax = opts.conMax
    } else {
      hostId = _hostId
      title = _title
      schema = _schema
      conMax = _conMax
    }

    const exist = this.inputPins.find(pin => {
      return pin.hostId === hostId
    })
    if (exist) {
      return exist
    }

    const pin = new PinModel(
      'normal',
      'input',
      hostId,
      title,
      schema,
      conMax,
      false,
      rels
    )

    pin.parent = this

    this.inputPins.push(pin)

    return pin
  }

  addInputPinInModel(hostId: string,
                     title: string,
                     schema: T_PinSchema,
                     deletable?: boolean,
                     conMax?: number | null): PinModel {
    if (!this.inputPinsInModel) {
      this.inputPinsInModel = []
    }

    const ipim = this.inputPinsInModel

    const exist = ipim.find(pin => {
      return pin.hostId === hostId
    })
    if (exist) {
      return exist
    }

    const pin = new PinModel(
      'normal',
      'input',
      hostId,
      title,
      schema,
      conMax,
      deletable
    )

    pin.parent = this as ToplComModel

    ipim.push(pin)

    // if (this.forkedTo.length > 0) {
    //   this.forkedTo.forEach(com => {
    //     const cpin = pin.fork(com)
    //     com.inputPinsInModel.push(cpin)
    //   })
    // }

    const rtModel = this.runtime.model
    if (!rtModel.inputAry) {
      rtModel.inputAry = []
    }
    rtModel.inputAry.push({
      hostId,
      title,
      schema,
      conMax
    })

    return ipim[ipim.length - 1]//Return observable object
  }

  addInputPinExt(hostId: string, title: string, schema: T_PinSchema): PinModel {
    const exist = this.inputPinExts.find(pin => {
      return pin.hostId === hostId
    })
    if (exist) {
      return exist
    }

    const pin = new PinModel(
      'ext',
      'input',
      hostId,
      title,
      schema,
      void 0,
      false
    )

    pin.parent = this

    this.inputPinExts.push(pin)
    return pin
  }

  addOutputPin(hostId: string,
               title: string,
               schema: T_PinSchema,
               conMax?: number): PinModel {
    const exist = this.outputPins.find(pin => {
      return pin.hostId === hostId
    })
    if (exist) {
      return exist
    }

    const pin = new PinModel(
      'normal',
      'output',
      hostId,
      title,
      schema,
      conMax,
      false
    )

    pin.parent = this
    this.outputPins.push(pin)
    return pin
  }

  addOutputPinInModel(hostId: string,
                      title: string,
                      schema: T_PinSchema,
                      deletable?: boolean,
                      conMax?: number | null): PinModel {
    if (!this.outputPinsInModel) {
      // if(this.runtime.def.namespace.endsWith('toolbar')){
      //   debugger
      // }
      debugger
      this.outputPinsInModel = []
    }

    const opim = this.outputPinsInModel

    const exist = opim.find(pin => {
      return pin.hostId === hostId
    })
    if (exist) {
      return
    }

    const pin = new PinModel(
      'normal',
      'output',
      hostId,
      title,
      schema,
      conMax,
      deletable
    )

    pin.parent = this

    opim.push(pin)

    // if (this.forkedTo.length > 0) {
    //   this.forkedTo.forEach(com => {
    //     const cpin = pin.fork(com)
    //     com.outputPinsInModel.push(cpin)
    //   })
    // }

    const rtModel = this.runtime.model
    if (!rtModel.outputAry) {
      rtModel.outputAry = []
    }
    rtModel.outputAry.push({
      hostId,
      title,
      schema,
      conMax
    })

    return opim[opim.length - 1]//Return observable object
  }

  addOutputPinExt(hostId: string,
                  title: string,
                  schema: T_PinSchema,): PinModel {
    let exist = this.inputPinExts.some(pin => {
      return pin.hostId === hostId
    })
    if (exist) {
      return
    }

    const pin = new PinModel(
      'ext',
      'output',
      hostId,
      title,
      schema,
      void 0,
      false
    )

    pin.parent = this

    this.outputPinExts.push(pin)
    return pin
  }

  removeInputPin(hostId: string) {
    let sidx
    const rtInputAry = this.inputPinsInModel
    if (rtInputAry) {
      rtInputAry.find((item, idx) => {
        if (item.hostId === hostId) {
          item.destroy()
          sidx = idx
        }
      })
      if (sidx !== void 0) {
        rtInputAry.splice(sidx, 1)
      }

      const rtInAry = this.runtime.model.inputAry
      rtInAry.find((item, idx) => {
        if (item.hostId === hostId) {
          sidx = idx
        }
      })
      if (sidx !== void 0) {
        rtInAry.splice(sidx, 1)
      }
    }
  }

  setInputPinTitle(hostId: string, title: string) {
    Arrays.find(pin => {
      if (pin.hostId == hostId) {
        pin.title = title;
      }
    }, ...this.getInputsAll())

    this.runtime.model.inputAry.find(pin => {
      if (pin.hostId === hostId) {
        pin.title = title
      }
    })
  }

  setInputPinSchema(hostId: string, schema: any) {
    const rtInputAry = this.inputPinsInModel
    if (rtInputAry) {
      rtInputAry.find(pin => {
        if (pin.hostId == hostId) {
          pin.schema = schema;
        }
      })

      this.runtime.model.inputAry.find(pin => {
        if (pin.hostId == hostId) {
          pin.schema = schema;
        }
      })
    }
  }

  removeOutputPin(hostId: string) {
    let sidx
    const rtOutputAry = this.outputPinsInModel
    if (rtOutputAry) {
      rtOutputAry.find((item, idx) => {
        if (item.hostId === hostId) {
          item.destroy()
          sidx = idx
        }
      })
      if (sidx !== void 0) {
        rtOutputAry.splice(sidx, 1)

        sidx = void 0

        const rtOutAry = this.runtime.model.outputAry
        rtOutAry.find((item, idx) => {
          if (item.hostId === hostId) {
            sidx = idx
          }
        })
        if (sidx !== void 0) {
          rtOutAry.splice(sidx, 1)
        }
      } else {
        //throw new Error(`非法删除端口.`)
      }
    } else {
      //throw new Error(`非法删除端口.`)
    }
  }

  setOutputPinTitle(hostId: string, title: string) {
    Arrays.find(pin => {
      if (pin.hostId == hostId) {
        pin.title = title;
      }
    }, ...this.getOutputsAll())

    this.runtime.model.outputAry.find(pin => {
      if (pin.hostId === hostId) {
        pin.title = title
      }
    })
  }

  setOutputPinSchema(hostId: string, schema: any) {
    const rtOutputAry = this.outputPinsInModel
    if (rtOutputAry) {
      rtOutputAry.find(pin => {
        if (pin.hostId == hostId) {
          pin.schema = schema;
        }
      })

      this.runtime.model.outputAry.find(pin => {
        if (pin.hostId == hostId) {
          pin.schema = schema;
        }
      })
    }
  }

  // getForkedInputPin(pin:PinModel){
  //   let rtn = this.forkedInputPins[pin.id]
  //   if(!rtn){
  //
  //   }
  // }
  //
  fork(parent: FrameModel | DiagramModel, io?: { inputs?, outputs? } | 'all-outputs') {
    const ToplComModelForked = require('./ToplComModelForked').default
    return new ToplComModelForked(parent, this, io)
  }

  cutIn(model: BaseUIModel, frameId: string, randomPo: boolean): boolean {
    if (this.frames && this.frames.length > 0) {
      const target = this.frames.find(frame => frame.id == frameId)
      target.cutIn(model, randomPo)
      return true
    }
  }

  focus() {
    //this.zIndex = this.parent.applyZIndex(this)
    this.state.focus()

    Arrays.each(pin => pin.emphasize(),
      ...this.getInputsAll(),
      ...this.getOutputsAll())
  }

  getInputsAll(): PinModel[][] {
    return [this.inputPins,
      this.inputPinsInModel,
      this.inputPinExts,
    ]
  }

  getOutputsAll(): PinModel[][] {
    return [this.outputPins,
      this.outputPinsInModel,
      this.outputPinExts]
  }

  getAllOutputsLength(): number {
    return Arrays.length(...this.getOutputsAll())
  }

  getInputEditor(emitItem: NS_Emits.Component) {
    const model = this
    return {
      get(id) {
        return getIO(model.forkedFrom || model, id, 'input')
      },
      add(id, title, schema, deletable, conMax) {
        assetPinSchema({schema} as any)
        //deletable = deletable !== void 0 ? deletable : true
        const pin = model.addInputPinInModel(id, title, schema, deletable, conMax)
        // setTimeout(v => {
        //   emitItem.focus(pin)
        // })
      },
      remove(id) {
        model.removeInputPin(id)
      },
      setTitle(id, title) {
        model.setInputPinTitle(id, title)
      },
      setSchema(id, schema) {
        assetPinSchema({schema} as any)
        model.setInputPinSchema(id, schema)
      }
    }
  }

  getOutputEditor(emitItem: NS_Emits.Component) {
    const model = this
    return {
      get(id) {
        return getIO(model.forkedFrom || model, id, 'output')
      },
      add(id, title, schema, deletable, conMax) {
        assetPinSchema({schema} as any)
        //deletable = deletable !== void 0 ? deletable : true
        const pin = model.addOutputPinInModel(id, title, schema, deletable, conMax)
        // setTimeout(v => {
        //   emitItem.focus(pin)
        // })
      },
      remove(id) {
        model.removeOutputPin(id)
      },
      setTitle(id, title) {
        model.setOutputPinTitle(id, title)
      },
      setSchema(id, schema) {
        assetPinSchema({schema} as any)
        model.setOutputPinSchema(id, schema)
      }
    }
  }

  blur() {
    this.state.blur()

    Arrays.each(pin => pin.emphasizeRecover(),
      ...this.getInputsAll(),
      ...this.getOutputsAll())

    if (this.frames) {
      this.frames.forEach(frame => frame.blur())
    }
  }

  getDebug(frameLabel: string) {
    return this.debugs ? this.debugs[frameLabel] : void 0
  }

  setDebug(frameLabel: string, debug: { runtime, inputs, outputs }) {
    if (!this.debugs) {
      this.debugs = {}
    }
    this.debugs[frameLabel] = debug
  }

  clearDebug() {
    this.debugs = void 0
    if (this.frames) {
      this.frames.forEach(frame => {
        frame.clearDebugs()
      })
    }
  }

  clearDebugHints() {
    Arrays.each<PinModel>(pin => {
      pin.clearDebugHints()
    }, ...this.getInputsAll(), ...this.getOutputsAll())

    if (this.frames) {
      this.frames.forEach(frame => {
        frame.clearDebugHints()
      })
    }
  }

  toJson() {
    const rt = this.runtime
    const json = {} as any

    json.id = this.id
    json.style = clone(this.style)

    if (this.inputPinsInModel) {
      const inPins = []
      this.inputPinsInModel.forEach(pin => {
        inPins.push(pin.toJson())
      })
      json.inputPinsInModel = inPins
    }

    if (this.outputPinsInModel) {
      const outPins = []
      this.outputPinsInModel.forEach(pin => {
        outPins.push(pin.toJson())
      })
      json.outputPinsInModel = outPins
    }

    if (this.inputPins) {
      const inPins = []
      this.inputPins.forEach(pin => {
        inPins.push(pin.toJson())
      })
      json.inputPins = inPins
    }

    if (this.outputPins) {
      const outPins = []
      this.outputPins.forEach(pin => {
        outPins.push(pin.toJson())
      })
      json.outputPins = outPins
    }

    if (this.inputPinExts) {
      const inPins = []
      this.inputPinExts.forEach(pin => {
        inPins.push(pin.toJson())
      })
      json.inputPinExts = inPins
    }

    if (this.outputPinExts) {
      const outPins = []
      this.outputPinExts.forEach(pin => {
        outPins.push(pin.toJson())
      })
      json.outputPinExts = outPins
    }

    if (this.frames && this.frames.length > 0) {
      const framesJson = []
      this.frames.forEach(frame => {
        framesJson.push(frame.toJson())
      })
      json.frames = framesJson
    }

    return json
  }

  destroy() {
    this.destroyAllConnections()
    if (this.frames) {
      this.frames.forEach(frame => frame.destroy())
    }
    this.parent.delete(this)
  }

  destroyAllConnections() {
    Arrays.each(pin => {
      pin.conAry.map(con => con).forEach(
        con => con.destroy())
    }, ...this.getInputsAll(), ...this.getOutputsAll())
  }
}

function getIO(md: ToplComModel, pinId: string, type: string) {
  if (pinId) {
    let pin: PinModel
    if (type == 'input') {
      pin = Arrays.find(pin => pin.hostId == pinId, ...md.getInputsAll())
    } else {
      pin = Arrays.find(pin => pin.hostId == pinId, ...md.getOutputsAll())
    }

    if (!pin) {
      return
      //throw new Error(`No pin(hostId=${pinId}) found in component(namespace=${md.runtime.def.namespace},id=${md.id}).`)
    }

    return {
      id: pin.hostId,
      title: pin.title,
      setTitle(title) {
        pin.title = title
      },
      get connectionCount() {
        return pin.conAry?.length
      },
      get schema() {
        if (pin.schema) {
          return deepClone(pin.schema)
        }
      },
      setSchema(schema) {
        pin.schema = schema
      }
    }
  } else {
    const ary = type == 'input' ? md.inputPinsInModel : md.outputPinsInModel
    if (ary) {
      return ary.map(pin => ({
        id: pin.hostId,
        title: pin.title,
        setTitle(title) {
          pin.title = title
        },
        setSchema(schema) {
          pin.schema = schema
        },
        get connectionCount() {
          return pin.conAry?.length
        }
      }))
    }
  }
}

function assetComDef(comDef: T_XGraphComDef) {
  if (!comDef) {
    throw new Error(`Component defination not found.`)
  }
  if (comDef.inputs && !Array.isArray(comDef.inputs)) {
    throw new Error(`Inputs in component(title=${comDef.title}) defination should be an array.`)
  }
  if (comDef.outputs && !Array.isArray(comDef.outputs)) {
    throw new Error(`Outputs in component(title=${comDef.title}) defination should be an array.`)
  }
}
