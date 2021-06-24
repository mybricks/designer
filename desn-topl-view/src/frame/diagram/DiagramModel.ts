/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {clone, Ignore, Serializable} from "@mybricks/rxui";
import {BaseUIModel, I_PinModel} from "@sdk";
import FrameModel from "../FrameModel";
import {ToplComModel} from "../../com/ToplComModel";
import {ConModel} from "../../con/ConModel";
import {JointModel} from "../../joint/JointModel";
import {PinModel} from "../../pin/PinModel";
import {createConModel} from "../../ToplUtil";
import ToplComModelForked from "../../com/ToplComModelForked";
import {Arrays, getPosition} from "@utils";
import {SerializeNS} from '../../constants'

@Serializable(SerializeNS + 'topl.DiagramModel')
export default class DiagramModel extends BaseUIModel {
  title: string

  parent: FrameModel

  startFrom: ToplComModelForked

  showIO: boolean

  comAry: ToplComModel[] = []

  @Ignore
  conTemp: ConModel

  conAry: ConModel[] = []

  style = {
    left: null as number,
    top: null as number,
    height: 200
  }

  @Ignore
  private _connections: {
    changed: boolean
    changing: boolean
  } = {changed: true, changing: void 0}

  get connections(): {
    isChanging: () => boolean,
    isChanged: () => boolean,
    changing: () => void,
    changed: () => void,
    refactored: () => void
  } {
    const th = this
    return {
      isChanging() {
        return th._connections.changing
      },
      isChanged() {
        return th._connections.changed
      },
      changing() {
        th._connections.changing = true
      },
      changed() {
        th._connections.changed = true
      },
      refactored() {
        th._connections.changing = void 0
        th._connections.changed = void 0
      }
    }
  }

  constructor(parent: FrameModel, startFrom?, io?) {
    super();
    if (parent) {
      this.parent = parent
      if (startFrom) {
        const startCom = this.addCom(startFrom, {x: 50, y: 26}, io || 'all-outputs')
        this.startFrom = startCom as ToplComModelForked

        if (startCom.forkedFrom) {
          const fk: ToplComModelForked = startCom as ToplComModelForked
          fk._startInDiagram = true
        }
        this.title = startCom.runtime.title + '组件'
      }
    }
  }

  setStart(com: ToplComModel) {
    const startCom = this.addCom(com, {x: 50, y: 26})
    if (startCom.forkedFrom) {
      (startCom as ToplComModelForked)._startInDiagram = true
    }
    return startCom
  }

  addCom(comModel: ToplComModel, po: { x: number, y: number }, io?: { inputs?, outputs? } | 'all-outputs'): ToplComModel {
    //if (comModel.runtime.hasUI()) {
    if (io) {
      const newModel = comModel.fork(this, io)
      if (po) {
        newModel.style.left = po.x
        newModel.style.top = po.y
      }

      this.comAry.push(newModel)

      return newModel
    } else {
      this.parent.addComponent(comModel)
      //comModel.parent = this
      if (po) {
        comModel.style.left = po.x
        comModel.style.top = po.y
      }

      this.comAry.push(comModel)
      return comModel
    }
  }

  addConnection(from: ConModel, temp?: boolean): ConModel
  addConnection(from: I_PinModel, to: I_PinModel, temp?: boolean): ConModel
  addConnection(from: JointModel, to: JointModel): ConModel
  addConnection(...args): ConModel {
    let con: ConModel
    if (args[0] instanceof ConModel) {
      con = args[0]
    } else if (args.length >= 2 && args[0] instanceof PinModel && args[0] instanceof PinModel) {
      con = createConModel(args[0], args[1], this.$el)
    }

    con.parent = this

    const isTemp = args.find(arg => typeof arg === 'boolean' && arg)

    if (isTemp) {
      this.conTemp = con
      return this.conTemp
    } else {
      this.conAry.push(con)
      return this.conAry[this.conAry.length - 1]//Return observable
    }
  }

  searchCom(id: string) {
    return this.comAry.find(com => com.id === id)
  }

  searchComByKey(_key: string) {
    return this.comAry.find(com => com._key === _key)
  }

  searchCon(fromId: string, toId: string) {
    if (this.conAry) {
      return this.conAry.find(con => con.startPin.id === fromId && con.finishPin.id === toId)
    }
  }

  refreshInnerCons(temp?: boolean, whichSide?: 'input' | 'output') {
    let ppo = getPosition(this.$el)
    let refreshOut = pin => {
      let pinDom = pin.$el

      let pinPo = getPosition(pinDom)
      let finishPo = {
        temp,
        x: pinPo.x - ppo.x,
        y: pinPo.y + pinDom.offsetHeight / 2 - ppo.y,
        j: pin.getJoinerWidth()
      }

      pin.conAry.forEach(con => {
        con.finishPo = finishPo
      })
    }, refreshIn = pin => {
      let pinDom = pin.$el

      let pinPo = getPosition(pinDom)
      let startPo = {
        temp,
        x: pinPo.x + pinDom.offsetWidth - ppo.x,
        y: pinPo.y + pinDom.offsetHeight / 2 - ppo.y,
        j: pin.getJoinerWidth()
      }

      pin.conAry.forEach(con => {
        con.startPo = startPo
      })
    }

    (!whichSide || whichSide == 'input') && this.parent.inputPins.forEach(refreshIn);
    (!whichSide || whichSide == 'output') && this.parent.outputPins.forEach(refreshOut)
  }

  delete(model: ToplComModel | ConModel | PinModel | JointModel): boolean {
    const del = (ary) => {
      let fidx = ary.indexOf(model)
      // ary.find((tm, idx) => {
      //   if (tm.id === model.id) {
      //     fidx = idx;
      //     return true
      //   }
      // })
      if (fidx >= 0) {
        ary.splice(fidx, 1)
        return true
      }
    }

    if (model instanceof ToplComModel) {
      // if (model.forkedFrom) {
      //   model.forkedFrom.removeForkedTo(model)
      // }
      del(this.comAry)
      if (!model.runtime.hasUI()) {
        this.parent.delete(model)
      }
    } else if (model instanceof ConModel) {
      //debugger
      if (this.conTemp && this.conTemp.id === model.id) {
        this.conTemp = void 0
      } else {
        del(this.conAry)
      }
    }
    return
  }

  destroy() {
    if (this.comAry) {
      this.comAry.forEach(com => {
        if (com.forkedFrom) {
          Arrays.each<PinModel>(pin => {
            if (pin.conAry) {
              pin.conAry.forEach(con => {
                (pin.forkedFrom as PinModel).deleteCon(con)
              })
            }
          }, ...com.getInputsAll())

          Arrays.each<PinModel>(pin => {
            if (pin.conAry) {
              pin.conAry.forEach(con => {
                (pin.forkedFrom as PinModel).deleteCon(con)
              })
            }
          }, ...com.getOutputsAll())
        } else {//Logical component belongs to framemodel
          this.parent.delete(com)
        }
      })
    }
  }

  toJson() {
    const rtn: {
      id,
      title,
      showIO,
      style,
      startCom,
      comAry,
      conAry,
      diagramAry
    } = {}

    rtn.id = this.id
    rtn.title = this.title
    rtn.showIO = this.showIO

    rtn.style = clone(this.style)
    rtn.startCom = this.startFrom ? this.startFrom.toJson(true) : void 0

    if (this.comAry) {
      const comAry = []
      this.comAry.forEach(com => {
        if (com.forkedFrom) {// instanceof ToplComModelForked
          // if(this.parent.comAry.find(tc=>{
          //   if(tc.id===com.forkedFrom.id){
          //     return true
          //   }
          // })){
          //   comAry.push((com as ToplComModelForked).toJSON(true))
          // }else{
          //   //console.log(com.id,com.runtime.def.namespace)
          // }
          comAry.push((com as ToplComModelForked).toJson(true))
        } else {
          comAry.push(com.id)
        }
      })
      rtn.comAry = comAry
    }

    if (this.conAry) {
      const cons = []
      this.conAry.forEach(con => {
        cons.push(con.toJson())
      })
      rtn.conAry = cons
    }

    return rtn
  }
}