import {getPosition} from "@utils";
import {createPortal} from "react-dom";
import {dragable, useComputed, useObservable} from "@mybricks/rxui";
import {NS_EditorsDefault} from "@sdk";

import css from './ResizerHV.less'
import RESIZERV = NS_EditorsDefault.RESIZERV;

class Ctx {
  canvasEle: HTMLElement
  comEle: HTMLElement

  curEle: HTMLElement

  show: boolean = false
  type: 'h' | 'v'

  left: number
  top: number
  width: number
  height: number

  ing: boolean

  getCurDef(type?) {
    const def = this.comEle['_resizer_def_']
    return type ? Object.values(def).find(item => item.type === type) : def
  }

  getValue() {
    const def = this.getCurDef()
    let rtn
    Object.keys(def).find(selector => {
      const item = def[selector]
      if (this.type === item.type) {
        rtn = item.value
        return true
      }
    })
    return rtn
  }
}

const STYLE_H = {
  cursor: 'row-resize',
}

const STYLE_V = {
  cursor: 'col-resize',
}

//let hostEle
let ctx: Ctx

export default function ResizerHV({type, options, selector,comEle, canvasEle, value}) {
  ctx = useObservable(Ctx, next => {
    next({
      comEle,
      canvasEle
    })
  })

  let def = comEle['_resizer_def_']
  if (!def) {
    def = comEle['_resizer_def_'] = {}
  }

  if (!def[selector]) {
    def[selector] = {
      type: type.toUpperCase() === RESIZERV ? 'v' : 'h',
      value,
      stepLength: options && options.stepLength
    }
  }

  comEle.removeEventListener('mouseover', mouseover, true)
  comEle.addEventListener('mouseover', mouseover, true)

  return createPortal(
    <ResizerUI key={'aa'}/>,
    canvasEle
  )
}

function mouseover(evt) {
  if(dragable.event){
    return
  }

  const ele = evt.target

  const def = ctx.getCurDef()

  const hAry = [], vAry = []
  Object.keys(def).forEach(selector => {
    const defItem = def[selector]
    if (defItem.type === 'h') {
      hAry.push(selector)
    } else if (defItem.type === 'v') {
      vAry.push(selector)
    }
  })

  scan(hAry, ele, 'h')
  scan(vAry, ele, 'v')
}

function scan(selectorAry, ele, editorType) {
  const selectors = selectorAry.join(',')
  let selAll;
  try {
    selAll = ctx.comEle.querySelectorAll(selectors);
  } catch (ex) {
    selAll = ctx.comEle.querySelectorAll(':scope' + selectors);
  }

  if (selAll.length > 0) {
    Array.from(selAll).forEach(nele => {
      nele['_editorType_'] = editorType
      nele.removeEventListener('mouseover', resizerMouseover)
      nele.addEventListener('mouseover', resizerMouseover)
    })
    return true
  }
}

function resizerMouseover(evt) {
  if(dragable.event){
    return
  }
  const ele = evt.target
  const po = getPosition(ele, ctx.canvasEle)

  ctx.width = ele.offsetWidth
  ctx.height = ele.offsetHeight
  ctx.left = po.x
  ctx.top = po.y
  ctx.type = ele['_editorType_']
  ctx.curEle = ele

  ctx.show = true

  // thResizer.ele = ele;
  // thResizer.type = hf ? 'h' : 'v';
  // thResizer.x = po.x;
  // thResizer.y = po.y;
  // thResizer.w = ele.offsetWidth;
  // thResizer.h = ele.offsetHeight;
  // thResizer.model = model;
  // //debugger
  // thResizer.proxy = resizer;
  return true
}

function ResizerUI() {
  const style = useComputed(() => {
    if (ctx.show) {
      const sty = {width: ctx.width, height: ctx.height, left: ctx.left, top: ctx.top}

      if (ctx.type === 'h') {
        return Object.assign(sty, STYLE_H)
      }
      if (ctx.type === 'v') {
        return Object.assign(sty, STYLE_V)
      }
    }
  })

  return (
    <div className={`${css.resizer} ${ctx.ing ? css.resizerIng : ''}`} style={style} onMouseDown={mouseDown}/>
  )
}


function mouseDown(event) {
  const value = ctx.getValue()

  dragable(event, ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
    if (state == 'moving') {
      ctx.ing = true
      if (ctx.type === 'h') {
        ctx.top += dy
        value.set({state: 'ing', dy}, {state: 'ing', ele: ctx.curEle})
      } else if (ctx.type === 'v') {
        ctx.left += dx
        value.set({state: 'ing', dx}, {state: 'ing', ele: ctx.curEle})
      }
    }
    if (state === 'finish') {
      ctx.ing = false
      value.set({state: 'finish', dx: 0, dy: 0}, {state: 'finish', ele: ctx.curEle})
    }
  })
}