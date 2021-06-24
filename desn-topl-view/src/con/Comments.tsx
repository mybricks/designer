/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from "./Comments.less";
import {dragable, evt, observe, Serializable} from "@mybricks/rxui";
import {html} from "../editors";
import {ConContext} from "./Con";
import {getComment} from "./listenable";
import ToplBaseModel from "../ToplBaseModel";
import {SerializeNS} from '../constants';
import {useEffect} from "react";

import {visitPoints} from "./conUtil";

@Serializable(SerializeNS + 'topl.con.CommentModel')
export class CommentModel extends ToplBaseModel {
  conModel

  content: string

  po: { x: number, y: number }

  ratio: number

  constructor(conModel, content: string, po: { x: number, y: number }) {
    super()
    if(conModel){
      this.conModel = conModel
      this.content = content
      this.po = po

      this.refreshRatio()
    }
  }

  refreshRatio() {
    let curLength = 0, poLength = 0
    const dis = 10
    const {x: cx, y: cy} = this.po
    visitPoints(this.conModel.points, (type, {x, y}, prePo) => {
      if (type === 'h') {
        if (Math.abs(cy - y) <= dis &&
          (Math.min(x, prePo.x, cx) !== cy && Math.max(x, prePo.x, cx) !== cx
            || Math.abs(Math.min(x, prePo.x) - cx) <= dis
            || Math.abs(Math.max(x, prePo.x) - cx) <= dis)) {
          poLength = curLength + cx - Math.min(x, prePo.x)
        }
        curLength += Math.abs(x - prePo.x)
      } else {
        if (Math.abs(cx - x) <= dis &&
          (Math.min(y, prePo.y, cy) !== cy && Math.max(y, prePo.y, cy) !== cy
            || Math.abs(Math.min(y, prePo.y) - cy) <= dis
            || Math.abs(Math.max(y, prePo.y) - cy) <= dis)) {
          poLength = curLength + cy - Math.min(y, prePo.y)
        }
        curLength += Math.abs(y - prePo.y)
      }
    })

    let ratio = poLength / this.conModel.length
    if (ratio >= 1 || ratio == 0) {
      ratio = 0.5
    }

    this.ratio = ratio
  }


  focus() {
    this.state.focus()
  }

  blur() {
    this.state.enable()
  }
}

export default function Comments() {
  const {model: conModel,} = observe(ConContext, {from: 'parents'})

  useEffect(() => {
    const comments = conModel.commentAry
    if (comments) {
      comments.forEach(({content, ratio, po, active}, idx) => {
        if (!(comments[idx] instanceof CommentModel)) {
          conModel.commentAry[idx] = new CommentModel(conModel, content, po)
        }
      })
    }
  }, [])

  return (
    <foreignObject className={css.comments}>
      {
        conModel.commentAry && conModel.commentAry.map(comment => {
          if (comment instanceof CommentModel) {
            const {id, po, content} = comment
            return (
              <div id={id} key={id}
                   className={comment.state.isFocused() ? css.commentFocus : ''}
                   style={{left: po.x, top: po.y}}
                   onMouseDown={evt(e => mouseDown(comment, e)).stop}
                   onClick={evt(event => click(comment, event)).stop}
                   onDoubleClick={evt(event => dblClick(comment, event)).stop}>
                {content}
              </div>
            )
          }
        })
      }
    </foreignObject>
  )
}

function mouseDown(commentModel: CommentModel, evt) {
  dragable(evt,
    ({po: {x, y}, dpo: {dx, dy}, targetStyle}, state) => {
      if (state == 'moving') {
        commentModel.po.x += dx
        commentModel.po.y += dy
      }
      if (state === 'finish') {
        commentModel.refreshRatio()
      }
    })
}

function click(commentModel: CommentModel, evt) {
  const {model, emitComponent} = observe(ConContext)

  const conContext = observe(ConContext)
  focus(conContext, commentModel)
}

function dblClick(comment: CommentModel, evt) {
  html(evt.target).val({
    get() {
      return comment.content
    }, set(val) {
      comment.content = val
    }
  })
}

function focus(conContext: ConContext, commentModel: CommentModel) {
  const {model: conModel, emitComponent} = conContext
  emitComponent.focus({
    getListeners() {
      return getComment(conContext)
    },
    focus() {
      commentModel.focus()
      conModel.focus()
    },
    blur() {
      conModel.blur()
    }
  })
}