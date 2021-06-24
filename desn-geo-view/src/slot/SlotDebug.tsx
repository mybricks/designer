import css from './SlotDebug.less'

import SlotModel from './SlotModel';
import GeoCom from '../com/GeoCom';
import {observe, useComputed} from '@mybricks/rxui';
import {DesignerContext} from '@sdk';
import {GeoComModel} from "../com/GeoComModel";
import DialogViewModel from "./dialog/DialogViewModel";
import DialogDebugViewInSlot from "./dialog/DialogDebugViewInSlot";

export default function SlotDebug({
                                    model, frameLable, scopePath,
                                    inputs, outputs, options
                                  }:
                                    {
                                      model: SlotModel, frameLable: any, scopePath: string,
                                      inputs: {}, outputs: {}, options: {}
                                    }) {
  const context = observe(DesignerContext, {from: 'parents'})

  const renderItems = useComputed(() => {
    if (model.comAry) {
      return (
        model.comAry.map((item: GeoComModel) => {
          if (context.isDebugMode()) {
            if (item.runtime.hasUI()) {
              // if(item.runtime.def.namespace===NS_XGraphComLib.coms.module){
              //   debugger
              // }
              const debug = item.getDebug(scopePath, frameLable)
              if (debug) {
                return (
                  <GeoCom key={frameLable + item.id} model={debug} slot={item.id}/>
                )
              }
            }
          } else {
            if (item.runtime.hasUI()) {
              return (
                <GeoCom key={item.id} model={item} slot={item.id}/>
              )
            }
          }
        }))
    }
  })

  const classes = useComputed(() => {
    const rtn = [css.slot]

    const style = model.style
    if (style) {
      if (style.isLayoutOfFlexColumn()) {
        rtn.push(css.lyFlexColumn)
      } else if (style.isLayoutOfFlexRow()) {
        rtn.push(css.lyFlexRow)
      }

      const justifyContent = style.getJustifyContent()
      if (justifyContent) {
        if (justifyContent.toUpperCase() === 'FLEX-START') {
          rtn.push(css.justifyContentFlexStart)
        } else if (justifyContent.toUpperCase() === 'CENTER') {
          rtn.push(css.justifyContentFlexCenter)
        } else if (justifyContent.toUpperCase() === 'FLEX-END') {
          rtn.push(css.justifyContentFlexFlexEnd)
        } else if (justifyContent.toUpperCase() === 'SPACE-AROUND') {
          rtn.push(css.justifyContentFlexSpaceAround)
        } else if (justifyContent.toUpperCase() === 'SPACE-BETWEEN') {
          rtn.push(css.justifyContentFlexSpaceBetween)
        }
      }

      const alignItems = style.getAlignItems()
      if (alignItems) {
        if (alignItems.toUpperCase() === 'FLEX-START') {
          rtn.push(css.alignItemsFlexStart)
        } else if (alignItems.toUpperCase() === 'CENTER') {
          rtn.push(css.alignItemsFlexCenter)
        } else if (alignItems.toUpperCase() === 'FLEX-END') {
          rtn.push(css.alignItemsFlexFlexEnd)
        }
      }
    }
    //
    // const justifyContent = options?.justifyContent
    // if (justifyContent) {
    //   if (justifyContent.toUpperCase() === 'FLEX-START') {
    //     rtn.push(css.justifyContentFlexStart)
    //   } else if (justifyContent.toUpperCase() === 'CENTER') {
    //     rtn.push(css.justifyContentFlexCenter)
    //   } else if (justifyContent.toUpperCase() === 'FLEX-END') {
    //     rtn.push(css.justifyContentFlexFlexEnd)
    //   } else if (justifyContent.toUpperCase() === 'SPACE-AROUND') {
    //     rtn.push(css.justifyContentFlexSpaceAround)
    //   } else if (justifyContent.toUpperCase() === 'SPACE-BETWEEN') {
    //     rtn.push(css.justifyContentFlexSpaceBetween)
    //   }
    // }
    //
    // const alignItems = options?.alignItems
    // if (alignItems) {
    //   if (alignItems.toUpperCase() === 'FLEX-START') {
    //     rtn.push(css.alignItemsFlexStart)
    //   } else if (alignItems.toUpperCase() === 'CENTER') {
    //     rtn.push(css.alignItemsFlexCenter)
    //   } else if (alignItems.toUpperCase() === 'FLEX-END') {
    //     rtn.push(css.alignItemsFlexFlexEnd)
    //   }
    // }

    return rtn.join(' ')
  })

  return model instanceof DialogViewModel ? (
    <DialogDebugViewInSlot
      viewModel={model}
      frameLable={frameLable}
      scopePath={scopePath}
      inputs={inputs}
      outputs={outputs}/>
  ) : (
    <section className={classes}>{renderItems}</section>
  )
}
