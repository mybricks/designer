/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from "./Comments.less";
import {dragable, evt, observe} from "@mybricks/rxui";
import {html} from "../editors";
import {ToplViewContext} from "./ToplView";

import {CommentModel} from './CommentModel'
import {useEffect} from "react";

export default function Comments() {
  const tvContext = observe(ToplViewContext, {from: 'parents'})
  const {frameModel, emitItem} = tvContext

  useEffect(() => {
    if (frameModel.commentAry) {
      const comment = frameModel.commentAry.find(cm => cm.editNow)
      if (comment) {
        html(comment.$el).val({
          get() {
            return comment.content
          }, set(val) {
            comment.content = val

            setTimeout(v => {
              focus(comment, tvContext)
            },100)
          }
        })
      }
    }
  }, [frameModel.commentAry.length])

  return (
    <div className={css.comments}>
      {
        frameModel.commentAry && frameModel.commentAry.map(comment => {
          const {id, po, content} = comment
          return (
            <div id={id} key={id}
                 ref={el => comment.$el = el}
                 className={comment.state.isFocused() ? css.commentFocus : ''}
                 style={{left: po.x, top: po.y}}
                 onMouseDown={evt(e => mouseDown(comment, e)).stop}
                 onClick={evt(event => focus(comment, tvContext)).stop}
                 onDoubleClick={evt(event => dblClick(comment, event)).stop}>
              {content}
            </div>
          )
        })
      }
    </div>
  )
}

function mouseDown(commentModel: CommentModel, evt) {
  dragable(evt,
    ({po: {x, y}, dpo: {dx, dy}, targetStyle}, state) => {
      if (state == 'moving') {
        commentModel.po.x += dx
        commentModel.po.y += dy
      }
    })
}

function focus(commentModel: CommentModel, tvCtx: ToplViewContext) {
  const {frameModel, emitItem, emitSnap} = tvCtx

  emitItem.focus({
    getListeners() {
      let btns = [
        {
          title: '删除',
          keys: ['Backspace'],
          exe: () => {
            let snap = emitSnap.start('itemDelete')
            frameModel.removeComment()
            snap.commit()
          }
        }]

      return btns
    },
    focus() {
      commentModel.focus()
    },
    blur() {
      commentModel.blur()
    }
  })
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