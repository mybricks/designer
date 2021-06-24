/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import FrameModel from './frame/FrameModel';
import {PinModel} from "./pin/PinModel";
import {JointModel} from "./joint/JointModel";
import {getPosition} from "@utils";
import {ConModel} from "./con/ConModel";
import {CANVAS_GRID_SPER} from "./config";

export function getChild(f0, f1): FrameModel {
  if (f0.id == f1.id) {
    return
  }
  let fp = f0.parent
  while (fp) {
    if (fp.id == f1.id) {
      return f0;
    }
    fp = fp.parent
  }
  return f1;
}

export function calJontPoints(points0: Array<{ x: number, y: number }>,
                              points1: Array<{ x: number, y: number }>) {
  let pre;

  function between(p0, p1, pt, d) {
    return Math.min(p0[d], p1[d]) < pt[d] &&
      pt[d] < Math.max(p0[d], p1[d])
  }

  let rtn = []

  points0.forEach((po, idx) => {
    if (!pre) {
      return pre = po;
    } else if (po.x == pre.x && po.y == pre.y) {
      return;
    }
    let d = po.y == pre.y ? 'x' : po.x == pre.x ? 'y' : null
    if (d) {
      let finds = []
      for (let i = 0; i < points1.length - 1; i++) {
        let npo = points1[i]
        if (between(po, pre, npo, d) && between(po, pre, points1[i + 1], d)) {//cross-x
          finds.push([npo, points1[i + 1]])
          i = i + 1
        }
      }
      if (finds.length > 0) {
        finds.forEach(ary => {
          let dxF = d == 'x'
          if (between(ary[0], ary[1], po, dxF ? 'y' : 'x')) {
            //debugger;
            rtn.push({x: dxF ? ary[0]['x'] : po['x'], y: dxF ? po['y'] : ary[0]['y']})//cross-y
          }
        })
      }
    }
    pre = po;
  })
  return rtn;
}

export function createConModel(from: PinModel | JointModel,
                               to: PinModel | JointModel,
                               parentEl: HTMLElement): ConModel {
  let fromEle = from.$el as HTMLElement, toEle = to.$el as HTMLElement,
    fromPo = getPosition(fromEle, parentEl), toPo = getPosition(toEle, parentEl)
  return ConModel.create(
    from,
    {
      x: fromPo.x + fromEle.offsetWidth,
      y: fromPo.y + fromEle.offsetHeight / 2,
      j: from.getJoinerWidth()
    },
    to,
    {
      x: toPo.x + 2,
      y: toPo.y + toEle.offsetHeight / 2,
      j: to.getJoinerWidth()
    }
  )
}

export function alignToCanvasGrid(x: number) {
  return Math.round(x / CANVAS_GRID_SPER) * CANVAS_GRID_SPER
}
