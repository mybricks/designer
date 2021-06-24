import React, {useEffect} from 'react'
import {Ignore, observe, useComputed, useObservable} from '@mybricks/rxui'
import {BaseUIModel, DesignerContext, NS_Emits, T_ComDef} from '@sdk'

import GeoViewModel from './GeoViewModel'
import DesnNormalView from './DesnNormalView'
import DebugView from './DebugView';
import {getEmitItem, getOutliners} from "./desnViewInit";
import SlotModel from "./SlotModel";
import {GeoComModel} from "../com/GeoComModel";
import DialogDesnView from "./dialog/DialogDesnView";
import DialogViewModel from "./dialog/DialogViewModel";
import DialogDebugView from "./dialog/DialogDebugView";

import {antiShaking} from '@utils'

class Mover {
  x: number
  y: number

  show({x, y}) {
    this.x = x
    this.y = y
  }

  hide() {
    this.x = void 0
  }
}

export class GeoViewContext {
  context: DesignerContext

  viewModel: GeoViewModel

  mover: Mover

  page: { id: string, title: string }

  hoverModel: BaseUIModel

  placeholder: { type: 'h' | 'v', x, y, w, h, index } = {}

  emitLogs: NS_Emits.Logs

  emitItem: NS_Emits.Component

  emitModule: NS_Emits.Module

  emitSnap: NS_Emits.Snap

  emitPage: NS_Emits.Page
}

export default function GeoView({page, viewModel}: { viewModel: GeoViewModel }) {
  const emitLogs = useObservable(NS_Emits.Logs, {expectTo: 'parents'})
  const emitItem = useObservable(NS_Emits.Component, {expectTo: 'parents'})
  const emitSnap = useObservable(NS_Emits.Snap, {expectTo: 'parents'})
  const emitModule = useObservable(NS_Emits.Module, {expectTo: 'parents'})
  const emitPage = useObservable(NS_Emits.Page, {expectTo: 'parents'})

  const context = observe(DesignerContext, {from: 'parents'})

  const mover = useObservable(Mover)

  const viewCtx = useObservable(GeoViewContext, n => n({
    context,
    viewModel,
    page,
    mover,
    emitLogs,
    emitItem,
    emitSnap,
    emitModule,
    emitPage
  }), {
    to: 'children'
  }, [viewModel])

  observe(NS_Emits.Component, next => {
    next(getEmitItem(viewCtx))
  }, {from: 'parents'}, [viewModel])

  observe(NS_Emits.Module, next => {
    next({
      clearAllTempComs() {
        viewModel.clearAllTempComs()
      }
    })
  }, {from: 'parents'})

  observe(NS_Emits.Debug, n => n({
    setComDebug: (scopePath: string, frameLable: string, instanceId: string, {
      inputs,
      outputs,
      frames,
      inputParams
    }, comDef: T_ComDef) => {
      let model: GeoComModel = viewModel.searchCom(instanceId)
      if (model) {
        // if(model.runtime.def.namespace==='power.normal-ui-pc-v2.page-header'){
        //   debugger
        // }
        const debugModel = model.setDebug(scopePath, frameLable, {inputs, outputs, frames, inputParams})
        return debugModel.runtime
      } else {
        throw new Error(`组件(${comDef.namespace},id=${instanceId})在布局视图中未找到.`)
      }
    },
    stop() {
      viewModel.clearDebugs()
    }
  }), {from: 'parents'}, [viewModel])

  useEffect(() => {
    if (context.isDesnMode()) {
      viewModel.clearAllTempComs()
    }
  }, [context.getMode()])


  //Img lazy load
  useEffect(() => {
    const throttle = antiShaking(200)

    const scrollDom = viewModel.scrollEle

    function isInClient(el) {
      let {top, right, bottom, left} = el.getBoundingClientRect();
      let clientHeight = window.innerHeight;
      let clientWidth = window.innerWidth;
      return !(top > clientHeight || bottom < 0 || left > clientWidth || right < 0);
    }

    function checkAllImags() {
      const imgs = scrollDom.querySelectorAll('img');

      Array.from(imgs).map((imgDom, inx) => {
        if (imgDom.dataset && imgDom.dataset.src) {
          if (!imgDom['__render__'] && isInClient(imgDom)) {
            const imgUrl = imgDom.getAttribute('data-src') as string

            const img = new Image()
            img.src = imgUrl
            img.onload = function () {
              imgDom.setAttribute('src', imgUrl);
            }

            imgDom['__render__'] = true
          }
        }
      })
    }

    //const thCheck = throttle(checkAllImags)
    const thCheck = () => throttle.push(checkAllImags)

    thCheck()

    scrollDom.addEventListener('scroll', thCheck);
    return () => {
      scrollDom.removeEventListener('scroll', thCheck);
    }
  }, [context.getMode()])

  if (context.isDebugMode()) {
    if (viewModel instanceof DialogViewModel) {
      return <DialogDebugView key='debugView'/>
    } else {
      return <DebugView key='debugView'/>
    }
  } else {
    if (viewModel instanceof DialogViewModel) {
      return <DialogDesnView key='desnView' viewModel={viewModel}/>
    } else {
      return <DesnNormalView key='desnView' viewModel={viewModel}/>
    }
  }
}

export function scrollFix(model: SlotModel) {
  if (model.$el) {
    const ele = model.$el.parentNode.parentNode as HTMLElement

    const x = (ele.scrollWidth - model.$el.clientWidth) / 2
    if (!model.style.left
      || x > (model.style.left + ele.offsetWidth)
      || (x + model.$el.clientWidth) < model.style.left) {
      model.style.left = ele.scrollLeft = (ele.scrollWidth - ele.clientWidth) / 2
    }

    ele.scrollLeft = model.style.left

    const y = (ele.scrollHeight - model.$el.clientHeight) / 2
    if (!model.style.top
      || x > (model.style.top + ele.offsetWidth)
      || (x + model.$el.clientHeight) < model.style.top) {
      model.style.top = (ele.scrollHeight - ele.clientHeight) / 2
    }

    ele.scrollTop = model.style.top
  }
}

// export function wheel(evt, viewModel) {
//   viewModel.style.left = Math.round(viewModel.style.left-evt.deltaX)
//   viewModel.style.top = Math.round(viewModel.style.top-evt.deltaY)
//   // evt.nativeEvent['__preventDefault__'] = true
// }
