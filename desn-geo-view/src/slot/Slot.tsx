/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './Slot.less'

import SlotModel from './SlotModel';
import GeoCom from '../com/GeoCom';
import {observe, useComputed} from '@mybricks/rxui';
import {DesignerContext, NS_XGraphComLib} from '@sdk';
import {GeoComModel} from "../com/GeoComModel";

export default function Slot({model, frameLable, scopePath, options}:
                               { model: SlotModel, frameLable: any, scopePath: string, options: {} }) {
  const context = observe(DesignerContext, {from: 'parents'})

  let renderItems = useComputed(() => {
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
    if (!context.isDebugMode()) {
      rtn.push(css.desn)
      if (model.comAry.length == 0) {
        rtn.push(css.empty)
      }
      if (model.state.isHovering()) {
        rtn.push(css.hover)
      }
      if (model.state.isFocused()) {
        rtn.push(css.focus)
      }
    }

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

  const title = useComputed(() => {
    if (model.title) {
      return (
        <div className={css.title}>
          <p>
            {model.title}
          </p>
        </div>
      )
    }
  })

  return (
    <div ref={el => model.$el = el} data-title={options?.title||'拖拽组件到这里'} className={classes}>
      {renderItems}
      {title}
    </div>
  )
}
