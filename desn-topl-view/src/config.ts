/**
 * Topological view
 *
 *
 * @author: CheMingjun(chemingjun@126.com)
 */
import {PinModel} from "./pin/PinModel";
import {ToplComModel} from "./com/ToplComModel";

export const enableGlobalPin = false;
export const exeStepTime = 0
export const CANVAS_GRID_SPER = 10

export const COM_EDITOR_KEYS = {
  INPUT_CONNECTED: '@inputConnected',
  INPUT_DIS_CONNECTED: '@inputDisConnected',
  OUTPUT_CONNECTED: '@outputConnected',
  OUTPUT_DIS_CONNECTED: '@outputDisConnected',
}

export const PinExtInputs = [
  {
    hostId: 'show',
    title: '显示',
    schema: {
      request: [{
        type: 'any'
      }],
      response: [{
        type: 'null'
      }]
    },
    exe(pinModel: PinModel) {
      const comModel: ToplComModel = pinModel.parent as ToplComModel

      if (comModel.debugs) {
        Object.keys(comModel.debugs).forEach(framelable => {
          comModel.debugs[framelable].runtime.model.style.display = 'block'
        })
      }
    }
  },
  {
    hostId: 'hide',
    title: '隐藏',
    schema: {
      request: [{
        type: 'any'
      }],
      response: [{
        type: 'null'
      }]
    },
    exe(pinModel: PinModel) {
      const comModel: ToplComModel = pinModel.parent as ToplComModel
      if (comModel.debugs) {
        Object.keys(comModel.debugs).forEach(framelable => {
          comModel.debugs[framelable].runtime.model.style.display = 'none'
        })
      }
    }
  }
]