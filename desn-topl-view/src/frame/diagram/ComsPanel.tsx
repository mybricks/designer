/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './ComsPanel.less'

import {dragable, observe, useComputed, useObservable} from "@mybricks/rxui";
import React from "react";
import {getPosition} from "@utils";
import {ToplComModel} from "../../com/ToplComModel";
import {alignToCanvasGrid} from "../../ToplUtil";
import {DiagramCtx} from "./Diagram";

class MyCtx {
  unfold: boolean = true
}

export default function ComsPanel() {
  const diagramCtx = observe(DiagramCtx, {from: 'parents'})

  const {model: diagramModel} = diagramCtx

  const myCtx = useObservable(MyCtx)

  const content = useComputed(() => {
    if (myCtx.unfold) {
      const frameModel = diagramModel.parent

      const jsx = []
      if (frameModel.comAry) {
        const used = {}
        if(diagramModel.comAry){
          diagramModel.comAry.forEach(com=>used[com.id] = true)
        }
        jsx.push(<div key={'coms'} className={css.coms}>
          {
            frameModel.comAry.map(com => {
              return (
                <div className={`${css.com} ${used[com.id]?css.used:''}`} key={com.id}
                     onMouseDown={event => addToDiagram(event, com)}>
                  {com.runtime.title}
                </div>
              )
            })
          }
        </div>)
      }

      return jsx
    }
  })


  return (
    <div className={`${css.panel} ${myCtx.unfold ? css.unfold : css.fold}`}>
      {content}
    </div>
  )
}

function addToDiagram(event, comModel: ToplComModel) {
  const {model: diagramModel, viewCtx} = observe(DiagramCtx)
  const {emitSnap} = viewCtx

  let moveNode

  const itemEle = event.target

  let snap, nowPo, diagramPo
  dragable(event,
    ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
      if (state === 'moving') {
        if (!moveNode) {
          moveNode = document.createElement('div')
          const copyNode = itemEle.cloneNode(true)
          moveNode.style.position = 'absolute'

          moveNode.style.zIndex = '1000'
          moveNode.appendChild(copyNode)

          nowPo = getPosition(itemEle)

          document.body.appendChild(moveNode)

          snap = emitSnap.start('moveItems')

          diagramPo = getPosition(diagramModel.$el)
        }

        nowPo.x += dx
        nowPo.y += dy

        moveNode.style.left = nowPo.x + 'px'
        moveNode.style.top = nowPo.y + 'px'
      }

      if (state == 'finish') {
        const xx = alignToCanvasGrid(nowPo.x - diagramPo.x),
          yy = alignToCanvasGrid(nowPo.y - diagramPo.y)

        diagramModel.addCom(comModel, {x: xx, y: yy})

        snap.commit()

        document.body.removeChild(moveNode)
      }
    }
  )
}