import React from 'react'
import css from './index.less'
import {NS_EditorsDefault} from "@sdk";

export default function Button({title, value, options, ele, containerEle}: { ele: HTMLElement }) {
  return (
    <div className={`${css.button} ${css[options?.type]}`} onClick={value.set}>
      {title}
    </div>
  )
}

Button.showTitle = false

