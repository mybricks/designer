import css from './DialogDesnView.less';

import {dragable, evt, observe, useComputed, useObservable, useWatcher} from '@mybricks/rxui';
import React, {useEffect} from 'react';
import {ViewCfgDefault} from '../../config';

import GeoCom from '../../com/GeoCom';
import Mask from '../mask';
import {GeoViewContext, scrollFix} from '../GeoView';
import {NS_Emits} from "@sdk";
import GeoViewModel from "../GeoViewModel";
import {getOutliners} from "../desnViewInit";
import {get as getConfiguration} from './configrable'
import SlotModel from "../SlotModel";
import Placeholder from "../Placeholder";

export default function DialogDesnView({viewModel}: { viewModel: GeoViewModel }) {
  const wrapStyle = useObservable({maxHeight: 0})

  const emitView = useObservable(NS_Emits.Views, {expectTo: 'parents'})

  const viewCtx = observe(GeoViewContext, {from: 'parents'})

  const {page, placeholder, context, emitItem, emitSnap} = viewCtx

  useWatcher(viewModel, 'comAry', (prop, val, preVal) => {
    if (viewModel.state.isEnabledOrAbove()) {
      //setTimeout(() => {//Performance
      emitView.focusStage({
        outlines: getOutliners(viewCtx)
      })
      //})
    }
  })

  useComputed(() => {
    init(wrapStyle)
    if (viewModel.state.isEnabledOrAbove()) {
      emitView.focusStage({
        outlines: getOutliners(viewCtx)
      })
    }
  })

  useEffect(() => {
    if (viewModel.state.isEnabled()) {
      scrollFix(viewModel)
    }
    if (!viewModel.initF) {
      viewModel.initF = true
      viewModel.style.paddingBottom = 10
      viewModel.style.paddingLeft = 10
      viewModel.style.paddingRight = 10
      // const comDef = context.getComDef({namespace: NS_XGraphComLib.coms.dialogProxy})
      // const dialogProxy = new ComSeedModel({
      //     namespace: comDef.namespace,
      //     rtType: comDef.rtType,
      //     //data: {outputId: inputPin.id}
      //   }
      // )
      // emitItem.add(dialogProxy, 'finish', {deletable: false})
    }
  }, [viewModel.state.isEnabled()])

  // useEffect(() => {
  //   if (viewModel.state.isEnabled()) {
  //     viewModel.$el.click()
  //   }
  // }, [viewModel.page])

  useEffect(() => {
    const validateSlot = (slotModel: SlotModel) => {
      if (slotModel.comAry) {
        slotModel.comAry.forEach(com => {
          emitItem.exist(com.runtime.def, com.id)
          if (com.slots) {
            com.slots.forEach(slot => validateSlot(slot))
          }
        })
      }
    }

    validateSlot(viewModel)

    return () => {

    }
  }, [])

  const wrapViewStyle = useComputed(() => computeWrapViewStyle(wrapStyle))
  const zoomViewStyle = useComputed(computeZoomViewStyle)

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
         }}
         onClick={clickWrap}
         onScroll={scroll}>
      <div style={wrapViewStyle}
           className={`${css.geoView} ${viewModel.state.isHovering() ? css.geoViewHover : ''}`}
           onClick={evt(click).stop}>
        <div className={css.header}>
          <p>{page.title || '未标题'}</p>
          <span></span>
        </div>
        <div style={zoomViewStyle} className={classes}
             ref={el => el && (viewModel.$el = el)}>
          {viewModel.comAry.map((md, idx) =>
            (<GeoCom key={md.id} model={md}/>)
          )}
          <Placeholder/>
          <Mask/>
        </div>
      </div>
    </div>
  )
}

function computeWrapViewStyle(wrapStyle) {
  const {context, viewModel, emitItem} = observe(GeoViewContext)
  let zoom = viewModel.style.zoom, z0 = Math.round(50 * zoom), z1 = Math.round(10 * zoom);

  return {
    //maxHeight: wrapStyle.maxHeight * zoom + 'px',
    // backgroundSize: `${z0}px ${z0}px, ${z0}px ${z0}px, ${z1}px ${z1}px, ${z1}px ${z1}px`,
    // backgroundImage: `
    //   linear-gradient(#F0F0F0 1px, transparent 0),
    //   linear-gradient(90deg, #F0F0F0 1px, transparent 0),
    //   linear-gradient(#F7F7F7 1px, transparent 0),
    //   linear-gradient(90deg, #F7F7F7 1px, transparent 0)`,
    //transform: `translate(${viewModel.style.left}px,${viewModel.style.top}px)`,
    //backgroundColor: viewModel.style.backgroundColor || 'RGBA(255,255,255,.8)',
    //backgroundImage: viewModel.style.backgroundImage,
  }
}

function computeZoomViewStyle() {
  const {context, viewModel, emitItem} = observe(GeoViewContext)
  const viewStyle = viewModel.style

  let zoom = viewStyle.zoom, z0 = Math.round(50 * zoom), z1 = Math.round(10 * zoom);

  return {
    paddingLeft: viewStyle.paddingLeft || 0,
    paddingTop: viewStyle.paddingTop || 0,
    paddingRight: viewStyle.paddingRight || 0,
    paddingBottom: viewStyle.paddingBottom || 0,
    //paddingBottom: 200,
    width: viewStyle.width * zoom,
    //width: viewModel.style.width + 'px',
    //minHeight: viewStyle.height + 'px',
    transform: `scale(${viewStyle.zoom})`,
    backgroundColor: viewStyle.backgroundColor || 'RGBA(255,255,255,.8)',
  }
}

function init(wrapStyle) {
  const {context, viewModel, emitItem} = observe(GeoViewContext)

  const cfgCanvas = context.configs.stage

  let ly = cfgCanvas?.layout?.toLowerCase();
  if (ly == 'absolute') {
    viewModel.style.setLayout('absolute')
  } else {
    viewModel.style.setLayout('flex-column')
  }
  if (viewModel.style.zoom === null) {
    viewModel.style.zoom = cfgCanvas?.zoom || 1;
  }

  let height: number = viewModel.style.height || cfgCanvas?.style?.height as number,
    width: number = viewModel.style.width || cfgCanvas?.style?.width as number
  switch (cfgCanvas?.type?.toLowerCase()) {
    case 'mobile': {
      height = height || ViewCfgDefault.canvasMobile.height;
      width = width || ViewCfgDefault.canvasMobile.width;
      break;
    }
    case 'pc': {
      height = height || ViewCfgDefault.canvasPC.height;
      width = width || ViewCfgDefault.canvasPC.width;
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

  if (cfgCanvas?.style) {
    for (let k in cfgCanvas.style) {
      if (k.match(/^background(Image|Color)$/gi)) {
        viewModel.style[k] = cfgCanvas.style[k]
      }
    }
  }
}

function scroll(evt) {
  const {viewModel} = observe(GeoViewContext)
  const ele = viewModel.$el.parentNode.parentNode as HTMLElement

  viewModel.style.left = ele.scrollLeft
  viewModel.style.top = ele.scrollTop

  //lazyImg(evt.target)
}

function clickWrap() {
  if (dragable.event) {//has something dragging
    return
  }
  const geoViewContext = observe(GeoViewContext)
  const {context, viewModel, emitItem} = geoViewContext

  // if (!viewModel.selectZone) {
  //   viewModel.blur()
  // }
}

function click() {
  if (dragable.event) {//has something dragging
    return
  }
  const geoViewContext = observe(GeoViewContext)
  const {context, viewModel, emitItem} = geoViewContext

  // if (!viewModel.selectZone) {
  //   viewModel.blur()
  // }

  const configs = getConfiguration(geoViewContext)

  emitItem.focus({
    getConfigs() {
      return configs
    },
    getListeners() {
      return []
    }
  })
}