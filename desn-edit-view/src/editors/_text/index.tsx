import React, {useCallback, useEffect} from 'react'
import {useComputed, useObservable} from "@mybricks/rxui"
import css from './index.less'
import {createPortal} from "react-dom";
import {getPosition} from "@utils";

class MyCtx {
  val
  value
  changed: boolean = false

  editorEle: HTMLElement

  top
  left
  width
  height

  setVal(v) {
    if (v !== this.val) {
      this.changed = true
      this.val = v
    }
  }
}

export default function Text({title, value, options, ele, containerEle}: { ele: HTMLElement }) {
  const ctx = useObservable(MyCtx, next => {
    next({value})
  })

  useComputed(() => {
    ctx.val = value.get() || ''

    const po = getPosition(ele, containerEle)
    ctx.top = po.y
    ctx.left = po.x
    ctx.width = ele.clientWidth
    ctx.height = ele.clientHeight
  })

  const updateVal = useCallback(val => {
    // if (ctx.changed) {
    //   ctx.changed = false
    //
    // }
    ctx.value.set(val)
  }, [])

  useEffect(() => {
    ctx.editorEle.onfocus = function () {
      setTimeout(function () {
        let sel, range;
        if (window.getSelection && document.createRange) {
          range = document.createRange();
          range.selectNodeContents(ctx.editorEle);
          sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } else if (document.body.createTextRange) {
          range = document.body.createTextRange();
          range.moveToElementText(ctx.editorEle);
          range.select();
        }
      }, 1)
    }
    ctx.editorEle.focus()

    // return () => {
    //   updateVal()
    // }
  }, [])

  return createPortal(
    (
      <div className={css.text}>
        <div ref={ele => ele && (ctx.editorEle = ele)}
             contentEditable={true}
             dangerouslySetInnerHTML={{__html: ctx.val}}
             onBlur={e => {
               updateVal(e.target.innerText)
             }}>
        </div>
      </div>
    ),
    ele
  )
}