import css from './Beautify.less'

import FrameModel from "../frame/FrameModel";
import {ToplComModel} from "../com/ToplComModel";
import {ConModel} from "./ConModel";
import {T_Po} from "./conTypes";
import {isSamePo} from "./conUtil";
import {observe, useComputed} from "@mybricks/rxui";

import {Arrays} from '@utils'

import {ToplViewContext} from "../frame/ToplView";
import {useEffect, useRef} from "react";

type T_Joiner = { id: any, x: number, y: number }

export default function Beautify({frameModel}: { frameModel: FrameModel }) {
  //const tvContext = observe(ToplViewContext, {from: 'parents'})

  const joinerAry = useRef<T_Joiner[]>()

  useComputed(() => {
    if (frameModel.connections.isChanged()) {
      joinerAry.current = refresh(frameModel)
      frameModel.connections.refactored()
    }
  })

  return (
    <g className={`${css.beautify} ${frameModel.connections.isChanging() ? css.hidden : ''}`}>
      {
        joinerAry.current && joinerAry.current.map(jt => {
          return (
            <circle key={jt.id} cx={jt.x} cy={jt.y} r="2" fill='#555'/>
          )
        })
      }
    </g>
  )
}

function refresh(frameModel: FrameModel): T_Joiner[] {
  let ary: T_Joiner[] = []
  ary = ary.concat(calJoiners(frameModel))
  if (frameModel.comAry) {
    frameModel.comAry.forEach(item => {
      ary = ary.concat(calJoiners(item))
    })
  }
  return ary
}

function calJoiners(model: ToplComModel | FrameModel): T_Joiner[] {
  let ary: T_Joiner[] = []

  if (model instanceof FrameModel) {
    model.inputPins.forEach(pin => {
      if (pin.conAry?.length > 1) {
        const jtAry = calOutputJoiners(pin.conAry)
        ary = ary.concat(jtAry)
      }
    })

    model.outputPins.forEach(pin => {
      if (pin.conAry?.length > 1) {
        const jtAry = calInputJoiners(pin.conAry)
        ary = ary.concat(jtAry)
      }
    })
  } else if (model instanceof ToplComModel) {
    Arrays.each(pin => {
      if (pin.conAry?.length > 1) {
        const jtAry = calInputJoiners(pin.conAry)
        ary = ary.concat(jtAry)
      }
    }, ...model.getInputsAll())


    Arrays.each(pin => {
      if (pin.conAry?.length > 1) {
        const jtAry = calOutputJoiners(pin.conAry)
        ary = ary.concat(jtAry)
      }
    }, ...model.getOutputsAll())

  }

  return ary
}

function calInputJoiners(conAry: ConModel[]): T_Joiner[] {
  const rtn: T_Joiner[] = []

  let firstPoints: T_Po[], curPoints: T_Po[]

  for (let idx = conAry.length - 1; idx >= 0; idx--) {
    const con = conAry[idx]
    if (idx === conAry.length - 1) {
      firstPoints = con.points
    } else if (firstPoints && (curPoints = con.points)) {
      let joiner, forkIdx: number, forkPre: T_Po, forkAfter: T_Po

      for (let ti = firstPoints.length - 1; ti >= 0; ti--) {
        const fpt = firstPoints[ti]
        const tpt = curPoints[curPoints.length - (firstPoints.length - ti)]
        if (isSamePo(fpt, tpt)) {
          forkPre = tpt
          forkIdx = ti
        } else {
          forkAfter = tpt
          break
        }
      }

      if (forkPre && forkAfter) {
        const nextPoint = firstPoints[forkIdx - 1]
        if (forkAfter.x === forkPre.x) {
          let y
          if (Math.abs(nextPoint.y - forkAfter.y)
            >= (Math.abs(nextPoint.y - forkPre.y) + Math.abs(forkAfter.y - forkPre.y))) {
            y = forkPre.y
          } else {
            y = forkAfter.y > forkPre.y ? Math.min(forkAfter.y, nextPoint.y) : Math.max(forkAfter.y, nextPoint.y)
          }
          joiner = {id: Math.random(), y, x: forkPre.x}
        } else {
          let x
          if (Math.abs(nextPoint.x - forkAfter.x)
            >= (Math.abs(nextPoint.x - forkPre.x) + Math.abs(forkAfter.x - forkPre.x))) {
            x = forkPre.x
          } else {
            x = forkAfter.x > forkPre.x ? Math.min(forkAfter.x, nextPoint.x) : Math.max(forkAfter.x, nextPoint.x)
          }
          joiner = {id: Math.random(), x, y: forkPre.y}
        }
      }

      joiner && rtn.push(joiner)
    }
  }

  return rtn
}

function calOutputJoiners(conAry: ConModel[]): T_Joiner[] {
  const rtn: T_Joiner[] = []

  let firstPoints: T_Po[], curPoints: T_Po[]
  conAry.forEach((con, idx) => {
    if (idx === 0) {
      firstPoints = con.points
    } else if (firstPoints && (curPoints = con.points)) {
      let joiner, forkIdx: number, forkPre: T_Po, forkAfter: T_Po
      firstPoints.find((fpt, idx) => {
        const tpt = curPoints[idx]
        if (isSamePo(fpt, tpt)) {
          forkPre = tpt
          forkIdx = idx
        } else {
          forkAfter = tpt
          return true
        }
      })

      if (forkPre && forkAfter) {
        const nextPoint = firstPoints[forkIdx + 1]
        if (forkAfter.x === forkPre.x) {
          let y
          if (Math.abs(nextPoint.y - forkAfter.y)
            >= (Math.abs(nextPoint.y - forkPre.y) + Math.abs(forkAfter.y - forkPre.y))) {
            y = forkPre.y
          } else {
            y = forkAfter.y > forkPre.y ? Math.min(forkAfter.y, nextPoint.y) : Math.max(forkAfter.y, nextPoint.y)
          }
          joiner = {id: Math.random(), y, x: forkPre.x}
        } else {
          let x
          if (Math.abs(nextPoint.x - forkAfter.x)
            >= (Math.abs(nextPoint.x - forkPre.x) + Math.abs(forkAfter.x - forkPre.x))) {
            x = forkPre.x
          } else {
            x = forkAfter.x > forkPre.x ? Math.min(forkAfter.x, nextPoint.x) : Math.max(forkAfter.x, nextPoint.x)
          }
          joiner = {id: Math.random(), x, y: forkPre.y}
        }
      }

      joiner && rtn.push(joiner)
    }
  })

  return rtn
}

function shouldUpdate(model: ToplComModel) {
  if (model.state.isMoving()) {
    return true
  }
  //return false

  if (model.inputPins) {
    const yes = Arrays.find(pin => {
      if (pin.conAry) {
        return pin.conAry.find(con => con.startPin?.parent.state.isMoving())
      }
    }, ...model.getInputsAll())
    if (yes) {
      return true
    }
  }
  if (model.outputPins) {
    return Arrays.find(pin => {
      if (pin.conAry) {
        return pin.conAry.find(con => con.startPin?.parent.state.isMoving())
      }
    }, ...model.getOutputsAll())
  }
}