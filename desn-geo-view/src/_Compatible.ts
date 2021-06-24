import {GeoComModel} from "./com/GeoComModel";
import SlotModel from "./slot/SlotModel";

export const _2020_10_25 = (function () {
  function doSlot(model: SlotModel) {
    if (Array.isArray(model.itemAry)) {
      model.comAry = model.itemAry

      model.comAry.forEach(item => {
        if (item.slots) {
          item.slots.forEach(slot => {
            doSlot(slot)
          })
        }
      })
      model.itemAry = void 0
    }
  }

  return {
    view(model: SlotModel) {
      doSlot(model)
    }
  }
})()

export const _2020_9_27 = {
  view(model: SlotModel) {
    transferDef(model)
  }
}

function transferDef(slot: SlotModel) {
  if (slot.comAry) {
    slot.comAry.forEach(comModel => {
      if (comModel instanceof GeoComModel) {
        if (!comModel.runtime.def) {
          comModel.runtime.def = comModel.def
        }
        if (comModel.slots) {
          comModel.slots.forEach(slot => {
            transferDef(slot)
          })
        }
      }
    })
  }
}