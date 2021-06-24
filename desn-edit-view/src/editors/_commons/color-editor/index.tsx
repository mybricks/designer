import React from 'react'
import css from './index.less'
import {SketchPicker} from 'react-color';
import {evt, useComputed, useObservable} from "@mybricks/rxui";
import {createPortal} from "react-dom";
import {getPosition} from "@utils";
import BgColorsOutlined from "@ant-design/icons/BgColorsOutlined";

export default function ColorEditor({value}) {
  const ctx = useObservable(class {
    color: string | object = value.get() || 'rgba(255,255,255,1)'

    ele: HTMLElement

    _popup: boolean = false

    getColorStr() {
      if (this.color) {
        if (typeof (this.color) === 'string') {
          return this.color
        } else if (typeof (this.color) === 'object') {
          return `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.a})`
        }
      }
    }

    showPicker() {
      this._popup = true
    }

    hidePicker() {
      this._popup = false
    }

    setColor(color) {
      this.color = color.rgb
    }

    setColorComplete() {
      value.set(this.getColorStr())
    }
  })

  const popup = useComputed(() => {
    if (ctx._popup) {
      const po = getPosition(ctx.ele)

      const body = document.body

      const style = {
        top: po.y + ctx.ele.offsetHeight + 2
      }
      if (po.x + 220 > body.clientWidth) {
        style.right = 5
      } else {
        style.left = po.x
      }

      return createPortal(
        <div className={css.popup} onClick={ctx.hidePicker}>
          <div onClick={evt().stop}
               style={style}>
            <SketchPicker
              color={ctx.color}
              onChange={ctx.setColor}
              onChangeComplete={ctx.setColorComplete}/>
          </div>
        </div>, body
      )
    }
  })

  return (
    <div className={css.colorPicker}
         ref={ele => ele && (ctx.ele = ele)}>
      <div className={css.now} style={{backgroundColor: ctx.getColorStr()}}
           onClick={ctx.showPicker}/>
      <div className={css.btn}
           onClick={ctx.showPicker}>
        <BgColorsOutlined style={{fontSize: 14}}/>
      </div>
      {popup}
    </div>
  )
}


