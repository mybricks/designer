import {T_Controller, T_Po} from "./conTypes";
import {uuid} from "@utils";

export function clonePo(po, oriId?) {
  return Object.assign({}, po, oriId ? null : {id: uuid(), fixed: false})
}

export function visitPoints(points: T_Po[], fn: (type: 'h' | 'v', curPo: T_Po, prePo: T_Po) => any) {
  let prePo: { x: number, y: number }
  points.forEach(po => {
    if (!prePo) {
      prePo = po
      return
    }

    const {x, y, d} = po
    if (x === prePo.x && y === prePo.y) {
      return
    }

    if (y === prePo.y) {//h
      fn('h', po, prePo)
    } else if (x === prePo.x) {//v
      fn('v', po, prePo)
    }

    prePo = po
  })
}

export function isSamePo(p0: T_Po, p1: T_Po): boolean {
  if (!p0 && !p1) {
    return true
  }
  if (p0 && p1 && p0.x === p1.x && p0.y === p1.y) {
    return true
  }
  return false
}

export function indexOf(ary, pt): number {
  let rtn: number
  ary.find((now, idx) => {
    if (now.id == pt.id) {
      rtn = idx
      return true
    }
  })
  return rtn
}

export function refreshControllers(controllers: T_Controller[]) {
  controllers.forEach(ctr => {
    let pt = ctr.endPoints
    ctr.x = pt[0].x + (pt[1].x - pt[0].x) / 2
    ctr.y = pt[0].y + (pt[1].y - pt[0].y) / 2
  })
}

export function caculateBrokenLine(spo: T_Po, fpo: T_Po, type: 'z' | '-|' | '|-' = 'z', conSelf?): ('' | any)[] {
  if (!spo || !fpo) {
    return
  }

  spo = Object.assign({j: 0}, spo)
  fpo = Object.assign({j: 0}, fpo)

  let dx = fpo.x - spo.x,
    dy = fpo.y - spo.y,
    w = Math.abs(fpo.x - spo.x),
    h = Math.abs(fpo.y - spo.y),
    h2 = conSelf ? Math.max(Math.floor(h / 2), 50) : Math.floor(h / 2)
  //h2 = Math.floor(h / 2)

  let points = []

  if (dx > spo.j + fpo.j) {
    let tw = w - spo.j - fpo.j, tw2 = tw / 2;
    // 1 4 quadrants
    if (dy > 0) {//4
      if (type === 'z') {
        //console.log(spo.j)
        points = [
          {x: spo.x, y: spo.y},
          {x: spo.x + spo.j, y: spo.y},
          {x: spo.x + spo.j + tw2, y: spo.y},
          {x: spo.x + spo.j + tw2, y: spo.y + h},
          {x: fpo.x - fpo.j, y: spo.y + h},
          {x: fpo.x, y: spo.y + h}
        ]
        //console.log(points)
      } else if (type === '-|') {
        points = [
          {x: spo.x, y: spo.y},
          {x: spo.x + spo.j, y: spo.y},
          {x: fpo.x, y: spo.y},
          {x: fpo.x, y: spo.y + h}
        ]
      } else if (type === '|-') {
        points = [
          {x: spo.x, y: spo.y},
          {x: spo.x, y: spo.y + h},
          {x: fpo.x - fpo.j, y: spo.y + h},
          {x: fpo.x, y: spo.y + h}
        ]
      }
    } else {//1
      if (type === 'z') {
        points = [
          {x: spo.x, y: spo.y},
          {x: spo.x + spo.j, y: spo.y},
          {x: spo.x + spo.j + tw2, y: spo.y},
          {x: spo.x + spo.j + tw2, y: spo.y - h},
          {x: fpo.x - fpo.j, y: spo.y - h},
          {x: fpo.x, y: spo.y - h}
        ]
      } else if (type === '-|') {
        points = [
          {x: spo.x, y: spo.y},
          {x: spo.x + spo.j, y: spo.y},
          {x: fpo.x, y: spo.y},
          {x: fpo.x, y: spo.y - h}
        ]
      } else if (type === '|-') {
        points = [
          {x: spo.x, y: spo.y},
          {x: spo.x, y: spo.y - h},
          {x: fpo.x - fpo.j, y: spo.y - h},
          {x: fpo.x, y: spo.y - h}
        ]
      }
    }
  } else if (dx > 0) {
    // 3~4  1~2 quadrants
    let x1 = spo.j + fpo.j - dx
    if (dy > 0) {//3~4
      points = [
        {x: spo.x, y: spo.y},
        {x: spo.x + spo.j, y: spo.y},
        {x: spo.x + spo.j, y: spo.y + h2},
        {x: spo.x + spo.j - x1, y: spo.y + h2},
        {x: spo.x + spo.j - x1, y: spo.y + h},
        {x: fpo.x, y: spo.y + h}
      ]
    } else {//1~2
      points = [
        {x: spo.x, y: spo.y},
        {x: spo.x + spo.j, y: spo.y},
        {x: spo.x + spo.j, y: spo.y - h2},
        {x: spo.x + spo.j - x1, y: spo.y - h2},
        {x: spo.x + spo.j - x1, y: spo.y - h},
        {x: fpo.x, y: spo.y - h}
      ]
    }
  } else {
    // 2 3 quadrants
    w += spo.j + fpo.j - 1
    if (dy > 0) {//3th
      points = [
        {x: spo.x, y: spo.y},
        {x: spo.x + spo.j, y: spo.y},
        {x: spo.x + spo.j, y: spo.y + h2},
        {x: spo.x + spo.j - w - 1, y: spo.y + h2},
        {x: spo.x + spo.j - w - 1, y: spo.y + h},
        {x: fpo.x, y: spo.y + h}
      ]
    } else {//2th
      //console.log(Math.random())
      if (type === 'z') {
        points = [
          {x: spo.x, y: spo.y},
          {x: spo.x + spo.j, y: spo.y},
          {x: spo.x + spo.j, y: spo.y - h2},
          {x: spo.x + spo.j - w - 1, y: spo.y - h2},
          {x: spo.x + spo.j - w - 1, y: spo.y - h},
          {x: fpo.x, y: spo.y - h}
        ]
      } else if (type === '-|') {
        points = [
          {x: spo.x, y: spo.y},
          {x: spo.x - w - fpo.j, y: spo.y},
          {x: spo.x - w - fpo.j, y: spo.y - h},
          {x: fpo.x, y: spo.y - h}
        ]
      }
    }
  }

  let uid = uuid()
  points = points.filter((pt, idx) => {
    let po
    if (idx > 0) {
      let pre = points[idx - 1]

      if (pt.x !== pre.x || pt.y !== pre.y) {
        po = pt
        // if (idx >= 1 && idx <= points.length - 2) {//Remove in three-point line
        //   if (
        //     (points[idx].x !== points[idx - 1].x || points[idx].x !== points[idx + 1].x) &&//h
        //     (points[idx].y !== points[idx - 1].y || points[idx].y !== points[idx + 1].y)//v
        //   ) {
        //     po = pt
        //   }
        // }else{
        //   po = pt
        // }
      }
    } else {
      po = pt
    }
    if (po) {
      (po.id = uid + idx)
    }
    return po
  })

  return points
}