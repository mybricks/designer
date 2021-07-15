/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './Con.less'
import {ConModel} from './ConModel';
import {dragable, evt, observe, useComputed, useObservable,} from '@mybricks/rxui';
import {DesignerContext, NS_Configurable, NS_Emits, NS_Listenable} from "@sdk";
import {useEffect, useMemo} from "react";
import {getCon as getListenable} from './listenable'
import {get as getConfigurable} from './configrable'
import {getPosition} from "@utils";
import {T_Controller} from "./conTypes";
import {clonePo} from "./conUtil";
import Comments from './Comments'
import {ConViewContext} from "./ConView";
import I_Listenable = NS_Listenable.I_Listenable;
import I_Configurable = NS_Configurable.I_Configurable;

export class ConContext {
  context: DesignerContext
  model: ConModel
  emitSnap: NS_Emits.Snap
  emitComponent: NS_Emits.Component
  comment
}

export default function Con({model}: { model: ConModel }) {
  const context = observe(DesignerContext, {from: 'parents'})
  const emitComponent = useObservable(NS_Emits.Component, {expectTo: 'parents'})
  const emitSnap = useObservable(NS_Emits.Snap, {expectTo: 'parents'})


  const conContext = useObservable(ConContext, n => n({context, model, emitComponent, emitSnap}), {to: "children"})
  observe(ConViewContext, {from: 'parents'})
  //Init
  useMemo(() => {
    (model as I_Listenable).getListeners = function () {
      if (context.isDesnMode()) {
        return getListenable(conContext)
      }
    }

    ;(model as I_Configurable).getConfigs = function () {
      return getConfigurable(conContext)
    }
  }, [])

  const classies = useComputed(() => {
    return `${css.con} 
      ${model.opacity ? css.visible : ''}
      ${model.state.isDisabled() ? css.inactive : ''}
      ${model.state.isFocused() ? css.focus : ''}
      ${model.state.isEditing() ? css.editing : ''}
      ${model._ing ? css.ing : ''}
      ${model.errorInfo ? css.errorInfo : ''}
      ${model.state.isRunning() ? css.running : ''}`
  })


  // useEffect(() => {
  //   if (!model.contextPoints) {
  //     model.contextPoints = viewContext.contextPoints
  //     model.contextPoints[model.id] = model.points
  //   }
  // }, [])

  return model._finishPo ? (
    <g className={classies}>
      {model.errorInfo ?
        (<text x={model.points[0].x} y={model.points[0].y-5}>
          {/*[错误的连接]*/}
          {/*{model.errorInfo}*/}
        </text>) : null}
      <Lines/>
    </g>
  ) : null
}

function Lines() {
  const {model} = observe(ConContext, {from: 'parents'})

  // const arrowRef = useComputed(() => {
  //   if (model.state.isFocused()) {
  //     return ''
  //   }
  //   if (model._ing) {
  //     return `url(#arrowR)`
  //   }
  //   if (model.errorInfo) {
  //     return `url(#arrowE)`
  //   }
  //   return `url(#arrow)`
  // })

  const points = useComputed(() => {
    const rtn = []
    if (model.points) {
      model.points.forEach((point, idx) => {
        rtn.push(`${point.x},${point.y}`)
      })
    }

    return rtn.join(' ')
  })

  const ctrls = useComputed(() => {
    if (model.state.isFocused()) {
      const controllers = model.calControllers()
      if (controllers) {
        return controllers.map((ctr, idx) =>
          <path key={idx} className={css.contr}
                style={{display: model.state.isEditing() ? 'block' : 'none'}}
                onClick={evt(click).stop.prevent}
                onDoubleClick={evt((e => ctrlDBClick(ctr, e))).stop}
                onMouseDown={evt(e => moveCtrl(ctr, e)).stop.prevent}
                d={`M${ctr.x - 5} ${ctr.y} l5 -5 l5 5 l-5 5 l-5 -5Z`}
          />
        )
      }
    }
  })

  return (
    <>
      {
        model.points ? (
          <>
            <polyline points={points}
                      className={css.pathBg}
                      onClick={evt(click).stop.prevent}
                      onDoubleClick={evt(dblClick).stop.prevent}/>
            <polyline points={points} className={`${css.pathFront}`}
                      onClick={evt(click).stop.prevent}
              // markerEnd={arrowRef}
            />
            <Comments/>
          </>
        ) : null
      }
      {ctrls}
    </>
  )
}


function click(evt) {
  const {context, model, emitComponent} = observe(ConContext)

  // if (model.state.isFocused()&&context.isDesnMode()) {
  //   model.state.editing()
  // } else {
  emitComponent.focus(model)
  //}
}

function dblClick(evt) {
  const conContext = observe(ConContext)
  const {model, emitComponent} = conContext

  model.startPin.blur()
  model.finishPin.blur()

  model.state.enable()

  const cpo = getPosition(model.parent.$el)
  const x = evt.clientX - cpo.x
  const y = evt.clientY - cpo.y

  model.addComment('注释', {x, y})
}

function ctrlDBClick(ctrl: T_Controller, e) {////TODO
  const {emitSnap, model} = observe(ConContext)
  // const all = ctrl.allPoints
  // const [p0,p1] = ctrl.endPoints
  //
  // all.splice(all.indexOf(p0),1)
  // all.splice(all.indexOf(p1),1)

  model.reset()
}

function moveCtrl(ctrl: T_Controller, e) {
  const {emitSnap, emitComponent, model} = observe(ConContext)

  let snap, fixed = false

  dragable(e,
    ({po: {x, y}, dpo: {dx, dy}, targetStyle}, state) => {
      if (state == 'moving') {
        !snap && (snap = emitSnap.start('Change connection'))
        if (!fixed) {
          fixed = true
          enableCtrl(ctrl)
        }

        if (ctrl.type == 'h') {
          ctrl.endPoints[0].y += dy
          ctrl.endPoints[0].fixed = true

          ctrl.endPoints[1].y += dy
          ctrl.endPoints[1].fixed = true
        } else if (ctrl.type == 'v') {
          ctrl.endPoints[0].x += dx
          ctrl.endPoints[0].fixed = true

          ctrl.endPoints[1].x += dx
          ctrl.endPoints[1].fixed = true
        }
        model.refreshComments()
      }
      if (state == 'finish') {
        model.refreshPoints()
        snap.commit()

        Promise.resolve().then(v => {
          emitComponent.focus(model)
          model.state.editing()
        })
      }
    }
  )
}

function enableCtrl(ctrl: T_Controller) {
  let startIdx = ctrl.allPoints.indexOf(ctrl.endPoints[0])
  if (startIdx === 1) {
    ctrl.allPoints.splice(startIdx, 0, clonePo(ctrl.endPoints[0]))
  }

  let endIdx = ctrl.allPoints.indexOf(ctrl.endPoints[1])
  if (endIdx === ctrl.allPoints.length - 2) {
    ctrl.allPoints.splice(endIdx + 1, 0, clonePo(ctrl.endPoints[1]))
  }

  if (ctrl.type == 'h') {
    if (ctrl.endPoints[0].y === ctrl.allPoints[startIdx - 1].y) {//In a line
      ctrl.allPoints.splice(startIdx, 0, clonePo(ctrl.endPoints[0]))
    } else if (ctrl.endPoints[1].y === ctrl.allPoints[endIdx + 1].y) {//In a line
      ctrl.allPoints.splice(endIdx + 1, 0, clonePo(ctrl.endPoints[1]))
    }
  } else if (ctrl.type == 'v') {
    if (ctrl.endPoints[0].x === ctrl.allPoints[startIdx - 1].x) {//In a line
      ctrl.allPoints.splice(startIdx, 0, clonePo(ctrl.endPoints[0]))
    } else if (ctrl.endPoints[1].x === ctrl.allPoints[endIdx + 1].x) {//In a line
      ctrl.allPoints.splice(endIdx + 1, 0, clonePo(ctrl.endPoints[1]))
    }
  }
}