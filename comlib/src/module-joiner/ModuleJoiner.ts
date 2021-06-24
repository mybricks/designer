/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
export default function Debugger({env,data, inputs, outputs}) {
  inputs['in'](val => {
    env.runtime.curModule.outputs[data.outputId](val)
  })
}