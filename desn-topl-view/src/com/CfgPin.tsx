import css from './CfgPin.less'
import {useComputed, useObservable} from "@mybricks/rxui";
import {NS_Emits} from "@sdk";
import {PinModel} from "../pin/PinModel";

export default function CfgPin({type, pins}: {
  type: 'input' | 'output',
  pins: {
    def: PinModel[],
    inModel: PinModel[],
    ext: PinModel[]
  }
}) {
  const emitItem = useObservable(NS_Emits.Component, {expectTo: 'parents'})

  function click(model: PinModel) {
    emitItem.focus(model)
    model.hint = void 0
  }

  const content = useComputed(() => {
    const rtn = []
    if (pins.def) {
      pins.def.forEach((pin, idx) => {
        rtn.push(renderPin(pin, click))
      })
    }
    if (pins.inModel) {
      pins.inModel.forEach((pin, idx) => {
        rtn.push(renderPin(pin, click))
      })
    }
    if (pins.ext) {
      pins.ext.forEach((pin, idx) => {
        rtn.push(renderPin(pin, click))
      })
    }
    return rtn
  })


  return (
    <div className={`${css.main} ${type === 'input' ? css.input : css.output}`}>
      <div className={css.title}>{type === 'input' ? '输入项' : '输出项'}</div>
      {content.length?content:'[空]'}
    </div>
  )
}

function renderPin(pin: PinModel, click) {
  return (
    <div key={pin.id} className={css.item}
         onMouseEnter={e => pin.hint = true}
         onMouseLeave={e => pin.hint = void 0}
         onClick={e => click(pin)}>
      <i/>
      <span>{pin.title}</span>
    </div>
  )
}