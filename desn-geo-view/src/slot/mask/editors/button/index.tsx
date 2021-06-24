/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import React from 'react'
import css from './index.less'


export default function Button({title, value, options, ele, containerEle}: { ele: HTMLElement }) {
  return (
    <div className={`${css.button} ${css[options?.type]}`} onClick={value.set}>
      {title}
    </div>
  )
}