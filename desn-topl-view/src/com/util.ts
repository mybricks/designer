import {ToplComModel} from './ToplComModel';
import FrameModel from '../frame/FrameModel';
import {getPosition, Arrays} from '@utils';

export function canCutInFrame(model: ToplComModel, toFrame: FrameModel) {
  if (toFrame) {
    if (!toFrame.editable) {
      return false
    }
    if (toFrame.parent && model.id == toFrame.parent.id) {//self's slot
      return false
    }
    if (model.parent === toFrame) {//cur parent slot
      return false
    }
    return true
  }
  return
}

export const refactorCons = function (model: ToplComModel | FrameModel, temp?: boolean) {
  setTimeout(() => {
    if (model instanceof ToplComModel) {
      let viewPo

      if (model.parent instanceof FrameModel) {
        if (model.parent.currentDiagram) {
          viewPo = getPosition(model.parent.currentDiagram.$el)
        } else {
          viewPo = getPosition(model.parent.$el)
        }
      } else {
        viewPo = getPosition(model.parent.$el)
      }

      Arrays.each(pin => {
        refreshIn(viewPo, pin, temp)
      }, ...model.getInputsAll())


      Arrays.each(pin => {
        refreshOut(viewPo, pin, temp)
      }, ...model.getOutputsAll())


      if (model.frames) {
        model.frames.forEach(fra => {
          fra.refreshJoints()
        })
      }
    } else if (model instanceof FrameModel) {
      const viewPo = getPosition(model.$el)

      Arrays.each(pin => {
        refreshOut(viewPo, pin, temp)
      }, model.inputPins)

      Arrays.each(pin => {
        refreshIn(viewPo, pin, temp)
      }, model.outputPins)
    }
  })
}

function refreshIn(viewPo, pin, temp) {
  const pinDom = pin.$el

  const pinPo = getPosition(pinDom)
  const finishPo = {
    temp,
    x: pinPo.x - viewPo.x + 2,//For arrow
    y: pinPo.y + pinDom.offsetHeight / 2 - viewPo.y,
    j: pin.getJoinerWidth()
  }

  pin.conAry.forEach(con => {
    con.finishPo = finishPo
  })
}

function refreshOut(viewPo, pin, temp) {
  let pinDom = pin.$el

  let pinPo = getPosition(pinDom)
  let startPo = {
    temp,
    x: pinPo.x + pinDom.offsetWidth - viewPo.x,
    y: pinPo.y + pinDom.offsetHeight / 2 - viewPo.y,
    j: pin.getJoinerWidth()
  }

  pin.conAry.forEach(con => {
    con.startPo = startPo
  })
}