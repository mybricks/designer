import {createPortal} from "react-dom";
import {dragable, useComputed, useObservable} from "@mybricks/rxui";
import {getPosition} from "@utils";

class Ctx {
  canvasEle:HTMLElement
  comEle: HTMLElement

  left: { x: number, y: number }
  right: { x: number, y: number }
  top: { x: number, y: number }
  bottom: { x: number, y: number }

  value

  refreshPo(){
    const ele = this.comEle

    const po = getPosition(ele, this.canvasEle)
    this.top = {x: po.x + ele.offsetWidth / 2 - 3, y: po.y - 3}
    this.right = {x: po.x + ele.offsetWidth - 3, y: po.y + ele.offsetHeight / 2 - 4}
    this.bottom = {x: po.x + ele.offsetWidth / 2 - 3, y: po.y + ele.offsetHeight - 4}
    this.left = {x: po.x - 3, y: po.y + ele.offsetHeight / 2 - 4}
  }
}

const DOT_SIZE = 7

const STYLE_H = {
  width: DOT_SIZE,
  height: DOT_SIZE,
  border: '1px solid #fa6400',
  backgroundColor: '#FFF',
  position: 'absolute',
  cursor: 'col-resize',
  zIndex: 10000,
  boxShadow: `1px 2px 3px 0px #bbb`
}

const STYLE_V = {
  width: DOT_SIZE,
  height: DOT_SIZE,
  border: '1px solid #fa6400',
  backgroundColor: '#FFF',
  position: 'absolute',
  cursor: 'row-resize',
  zIndex: 10000,
  boxShadow: `1px 2px 3px 0px #bbb`
}

//let hostEle
let ctx: Ctx

export default function Resizer({type, options, selector, comEle, canvasEle, value}) {
  if (!options || !Array.isArray(options) || options.indexOf('width') == -1 && options.indexOf('height') == -1) {
    return
  }

  ctx = useObservable(Ctx, next => {
    const po = getPosition(comEle, canvasEle)
    const top = {x: po.x + comEle.offsetWidth / 2 - 3, y: po.y - 3}
    const right = {x: po.x + comEle.offsetWidth - 3, y: po.y + comEle.offsetHeight / 2 - 4}
    const bottom = {x: po.x + comEle.offsetWidth / 2 - 3, y: po.y + comEle.offsetHeight - 4}
    const left = {x: po.x - 4, y: po.y + comEle.offsetHeight / 2 - 4}

    next({comEle,canvasEle, value, top, right, bottom, left})
  })

  const jsx = useComputed(() => {
    const jsx = []
    if (options.indexOf('width') >= 0) {
      jsx.push(
        <div key='left' style={Object.assign({left: ctx.left.x, top: ctx.left.y}, STYLE_H)}
             onMouseDown={e => mouseDown(e, 'left')}>
        </div>
      )
      jsx.push(
        <div key='right' style={Object.assign({left: ctx.right.x, top: ctx.right.y}, STYLE_H)}
             onMouseDown={e => mouseDown(e, 'right')}>
        </div>
      )
    }
    if (options.indexOf('height') >= 0) {
      jsx.push(
        <div key='top' style={Object.assign({left: ctx.top.x, top: ctx.top.y}, STYLE_V)}
             onMouseDown={e => mouseDown(e, 'top')}>
        </div>
      )
      jsx.push(
        <div key='bottom' style={Object.assign({left: ctx.bottom.x, top: ctx.bottom.y}, STYLE_V)}
             onMouseDown={e => mouseDown(e, 'bottom')}>
        </div>
      )
    }

    return jsx
  })


  return createPortal(
    jsx,
    canvasEle
  )
}

function mouseDown(event, type) {
  dragable(event, ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
    if (state == 'moving') {
      if (type === 'top' || type === 'bottom') {
        if ((ctx.bottom.y - ctx.top.y) <= DOT_SIZE) {
          return
        }
      }

      if (type === 'left' || type === 'right') {
        if ((ctx.right.x - ctx.left.x) <= DOT_SIZE) {
          return
        }
      }

      if (type === 'top') {
        // ctx.top += dy
        // delta += dy
        //ctx.left.y -= dy / 2
        //ctx.right.y -= dy / 2

        //ctx.bottom.y -= dy
        ctx.value.set({dy: -1 * dy, dx: 0}, {state: 'ing'})
      } else if (type === 'bottom') {
        //ctx.left.y += dy / 2
        //ctx.right.y += dy / 2

        //ctx.bottom.y += dy
        ctx.value.set({dy, dx: 0}, {state: 'ing'})
      } else if (type === 'left') {
        //ctx.top.x -= dx / 2
        //ctx.bottom.x -= dx / 2

        //ctx.right.x -= dx
        ctx.value.set({dy: 0, dx: -1 * dx}, {state: 'ing'})
      } else if (type === 'right') {
        //ctx.top.x += dx / 2
        //ctx.bottom.x += dx / 2

        //ctx.right.x += dx
        ctx.value.set({dy: 0, dx}, {state: 'ing'})
      }

      ctx.refreshPo()

      //ctx.reset()
    }
    if (state === 'finish') {
      ctx.value.set({dx: 0, dy: 0}, {state: 'finish'})
    }
  })
}