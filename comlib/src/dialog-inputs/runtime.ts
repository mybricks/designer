/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
export default function Debugger({env, data, inputs, outputs}) {
  inputs['commit'](val => {
    if (val !== void 0) {
      env.runtime.curWindow.outputs['commit'](val)
    }
    env.runtime.curWindow.destroy()
  })

  inputs['cancel'](val => {
    if (val !== void 0) {
      env.runtime.curWindow.outputs['cancel'](val)
    }
    env.runtime.curWindow.destroy()
  })
}