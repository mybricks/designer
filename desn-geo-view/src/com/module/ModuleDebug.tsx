import {observe, useComputed} from "@mybricks/rxui";
import css from "./ModuleDebug.less";
import {useMemo} from "react";
import {ComContext} from "../GeoCom";
import {getEnv, getStyle} from "../comCommons";
import {refactorStyle} from "../../geoUtil";
import GeoComDebugModel from "../GeoComDebugModel";
import SlotModel from "../../slot/SlotModel";
import SlotDebug from "../../slot/SlotDebug";

export default function ModuleDebug() {
  const comContext = observe(ComContext, {from: 'parents'})
  const {comDef, model} = comContext

  const style = useComputed(computeStyle)

  const dmodel = model as GeoComDebugModel

  const rt = useMemo(() => {//Avoid refresh component twice when style(display='block' eg) changed
    return <comDef.runtime data={dmodel.data}
                           env={getEnv(model, comContext)}
                           slots={renderSlotAry(dmodel)}
                           style={getStyle()}
                           inputs={dmodel.inputs}
                           outputs={dmodel.outputs}
                           frames={dmodel.frames}/>
  }, [])

  return <div ref={el => model.$el = el} style={style} className={`${css.debug}`}>
    {rt}
  </div>
}

function computeStyle() {
  const comContext = observe(ComContext)
  const {model, context, emitItem, emitSnap, comDef} = comContext

  const css = model.style.toCSS()
  let sty = {}
  for (let nm in css) {
    sty[nm] = css[nm]
  }

  sty['width'] = '100%'

  const {left, top, width, height} = model.style

  if (context.isDesnMode()) {
    sty = Object.assign(sty, model.style.isLayoutAbsolute() ? {
      // transform: model.isLayoutAbsolute() ?
      //   `translateY(${model.position.y}px) translateX(${model.position.x}px)` : '',
      zIndex: 1,
      position: 'absolute',
      left: left + 'px',
      top: top + 'px',
      width: width + 'px',
      height: height + 'px'
    } : {
      //height: height ? (height + 'px') : undefined
    })
  } else {
    sty = Object.assign(sty, model.style.isLayoutAbsolute() ? {
      zIndex: 1,
      position: 'absolute',
      left: left + 'px',
      top: top + 'px',
      width: width + 'px',
      height: height + 'px'
    } : {})
  }

  refactorStyle(sty)
  return sty
}

function renderSlotAry(model: GeoComDebugModel) {
  const {inputs, outputs} = model
  const rst = {}
  const slotAry = model.slots
  if (slotAry) {
    slotAry.forEach((slot: SlotModel) => {
      rst[slot.id] = {
        id: slot.id,
        title: slot.title,
        render(data, key) {
          const frame = model.frames[slot.id]

          let scopePath
          if (frame) {
            scopePath = frame(data||model.inputParams)
          }

          if (scopePath && scopePath.indexOf(':') >= 0) {//
            return <SlotDebug key={slot.id} model={slot} scopePath={scopePath} inputs={inputs} outputs={outputs}/>
          } else {
            return <SlotDebug key={slot.id} model={slot} inputs={inputs} outputs={outputs}/>
          }
        }
      }
    })
  }
  return rst
}