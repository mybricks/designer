export default function Debugger({env,data, inputs, outputs}) {
  inputs['in'](val => {
    env.runtime.curModule.outputs[data.outputId](val)
  })
}