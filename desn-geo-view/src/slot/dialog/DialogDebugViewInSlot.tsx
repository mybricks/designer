import css from './DialogDebugViewInSlot.less';

import {observe, useComputed, useObservable} from '@mybricks/rxui';
import React from 'react';

import GeoCom from '../../com/GeoCom';
import {GeoViewContext} from '../GeoView';
import DialogViewModel from "./DialogViewModel";
import {GeoComModel} from "../../com/GeoComModel";
import {createPortal} from "react-dom";

class DialogDebugCtx {
  inputs
  outputs
}

export default function DialogDebugViewInSlot(
  {
    viewModel, frameLable, scopePath,
    inputs, outputs
  }: {
    viewModel: DialogViewModel,
    inputs: {}, outputs: {}
  }) {

  const viewCtx = observe(GeoViewContext, {from: 'parents'})

  const {context, viewModel: vm} = viewCtx

  useObservable(DialogDebugCtx, next => next({inputs, outputs}))

  const zoomViewStyle = useComputed(computeZoomViewStyle)

  const renderItems = useComputed(() => {
    if (viewModel.comAry) {
      return (
        viewModel.comAry.map((item: GeoComModel) => {
          if (context.isDebugMode()) {
            if (item.runtime.hasUI()) {
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

  return createPortal(
    (
      <div className={css.bg}>
        <div style={zoomViewStyle} className={`${css.dialog}`}
             ref={el => el && (viewModel.$el = el)}>
          <div className={css.header}>
            <p>{viewModel.title}</p>
          </div>
          <div className={css.content}>
            {renderItems}
          </div>
        </div>
      </div>
    ), vm.$el.parentNode.parentNode
  )
}

// function commit() {
//   const {viewModel, emitModule} = observe(GeoViewContext)
//
//   emitModule.clearAllTempComs()
//
//   const {outputs} = observe(DialogDebugCtx)
//   outputs['commit'](1)
// }
//
// function cancel() {
//   const {viewModel, emitModule} = observe(GeoViewContext)
//
//   emitModule.clearAllTempComs()
//
//   const {outputs} = observe(DialogDebugCtx)
//   outputs['cancel'](1)
// }

function computeZoomViewStyle() {
  const {context, viewModel, emitItem} = observe(GeoViewContext)
  const viewStyle = viewModel.style

  let zoom = viewStyle.zoom, z0 = Math.round(50 * zoom), z1 = Math.round(10 * zoom);

  return {
    paddingLeft: viewStyle.paddingLeft || 0,
    paddingTop: viewStyle.paddingTop || 0,
    paddingRight: viewStyle.paddingRight || 0
  }
}