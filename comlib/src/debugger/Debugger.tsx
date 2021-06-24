/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './Debugger.less'

import {useObservable, useComputed} from "@mybricks/rxui";

export default function Debugger({env, inputs, outputs, slots}) {
  //console.log('--Debugger---')
  const my = useObservable(class {
    curVal = 0
    r = '随机值'
  })

  inputs['val'](val => {
    console.log('-----', val)
    my.curVal = val
  })

  return (
    <div className={css.debugger}>
      <p>{my.r}</p>
      <p>{my.curVal}</p>
      <button onClick={e => my.r = Math.random() + ''}>刷新</button>
      <button onClick={e => outRandomNum(outputs)}>输出随机数字</button>
      <button onClick={e => outAndRtn(outputs)}>输出模拟并显示返回数据</button>
    </div>
  )
}

function outRandomNum(outputs) {
  outputs['randomNum'](Math.random())
}

function outAndRtn(outputs) {
  outputs['randomNumAndRtn'](Math.random(), val => {
    console.log(val)
  })
}