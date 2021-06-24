/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './DebugView.less';

import {observe, useComputed, useObservable} from '@mybricks/rxui';
import React, {useEffect} from 'react';
import {ViewCfgDefault} from '../config';

import GeoCom from '../com/GeoCom';
import {GeoViewContext, scrollFix} from './GeoView';
import {GeoComModel} from "../com/GeoComModel";
import {NS_Emits} from "@sdk";
import {createPortal} from "react-dom";

export default function DebugView() {
  const wrapStyle = useObservable({maxHeight: 0})

  const {context, viewModel, emitItem} = observe(GeoViewContext, {
    from: 'parents'
  })

  useComputed(() => componentWillMounted(wrapStyle))

  // useEffect(() => {
  //   return () => {
  //     if (context.isDesnMode()) {
  //       viewModel.comAry.forEach(item => {
  //         item.clearDebug()
  //       })
  //     }
  //   }
  // }, [])


  observe(NS_Emits.Page, next => next({
    createPortal(children) {
      if (viewModel.$el) {
        return createPortal(children, viewModel.$el)
      }
    }
  }), {from: 'parents'})

  useEffect(() => {
    if (viewModel.state.isEnabled()) {
      scrollFix(viewModel)
    }
  }, [viewModel.state.isEnabled()])

  const zoomViewStyle = useComputed(computeZoomViewStyle)

  const content = useComputed(() => {
    return viewModel.comAry.map((md: GeoComModel, idx) => {
        const debug = md.getDebug()
        return debug ? <GeoCom key={md.id} model={debug}/> : null
      }
    )
  })

  const classes = useComputed(() => {
    const rtn = [css.zoomView]

    const style = viewModel.style
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

    return rtn.join(' ')
  })

  return (
    <div className={css.viewWrap}
         style={{
           opacity: viewModel.state.isEnabled() ? 1 : 0,
           zIndex: viewModel.state.isEnabled() ? 2 : -1
         }}>
      <div className={css.geoView}>
        <div style={zoomViewStyle}
             className={classes}
             ref={ele => ele && (viewModel.scrollEle = viewModel.$el = ele)}>
          {content}
        </div>
      </div>
    </div>
  )
}

function computeZoomViewStyle() {
  const {context, viewModel, emitItem} = observe(GeoViewContext)

  const cfgCanvas = context.configs.stage

  let height: number = viewModel.style.height || cfgCanvas?.style?.height as number,
    width: number = viewModel.style.width || cfgCanvas?.style?.width as number

  const viewStyle = viewModel.style
  return {
    width: width + 'px',
    height: height + 'px',
    transform: `scale(1)`,
    backgroundColor: viewStyle.backgroundColor,
    backgroundImage: viewStyle.backgroundImage,
    paddingLeft: viewStyle.paddingLeft || 0,
    paddingTop: viewStyle.paddingTop || 0,
    paddingRight: viewStyle.paddingRight || 0,
  }
}

function componentWillMounted(wrapStyle) {
  const {context, viewModel, emitItem} = observe(GeoViewContext)

  const ctCfgs = context.configs, stageCfg = ctCfgs.stage

  let ly = stageCfg?.layout?.toLowerCase();
  if (ly == 'absolute') {
    viewModel.style.setLayout('absolute')
  }
  // else {
  //   viewModel.style.setLayout('flex-column')
  // }
  if (viewModel.style.zoom === null) {
    viewModel.style.zoom = ctCfgs.stage.zoom || 1;
  }

  let height = viewModel.style.height || stageCfg?.style?.height,
    width = viewModel.style.width || stageCfg?.style?.width;
  switch (stageCfg.type.toLowerCase()) {
    case 'mobile': {
      height = height || ViewCfgDefault.canvasMobile.height;
      width = width || ViewCfgDefault.canvasMobile.width;
      break;
    }
    case 'custom': {
      height = height || ViewCfgDefault.canvasCustom.height;
      width = width || ViewCfgDefault.canvasCustom.width;
      break;
    }
  }

  viewModel.style.height = height;
  viewModel.style.width = width;

  wrapStyle.maxHeight = height

  if (stageCfg.style) {
    for (let k in stageCfg.style) {
      if (k.match(/^background(Image|Color)$/gi)) {
        viewModel.style[k] = stageCfg.style[k]
      }
    }
  }
}
