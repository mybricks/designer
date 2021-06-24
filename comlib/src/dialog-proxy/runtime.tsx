/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import React, {useCallback, useMemo} from "react";
import css from './runtime.less'

export default function Debugger({env, data, inputs, outputs}) {
  if (env.runtime) {
    inputs['in'](val => {
      env.runtime.curWindow.outputs['commit'](val)
    })
  }
  const commit = useCallback(() => {
    if (env.runtime) {
      outputs['commit'](1)
      //env.runtime.curWindow.destroy()
    }
  }, [])

  const cancel = useCallback(() => {
    if (env.runtime) {
      outputs['cancel'](1)
    }
  }, [])

  return (
    <div className={css.toolbar}>
      <button btn-commit={1} onClick={commit}>确定</button>
      <button btn-cancel={1} onClick={cancel}>取消</button>
    </div>
  )
}