export default {
  name: 'xg.var_set',
  title: '变量赋值',
  showInToolbox: false,
  data: {},
  render(renderer, data, {createBlock}) {
    renderer.setColour(50)
    const varInput = renderer.appendValueInput('varName').appendField('赋值')
    renderer.appendValueInput('rtn')
      .appendField('=')
    renderer.inputsInline = true
    renderer.setPreviousStatement(true)
    renderer.setNextStatement(true)

    // setTimeout(() => {
    //   if (!varInput.connection.targetConnection) {
    //     const varBlock = createBlock('variables_get')
    //     varInput.connection.connect(varBlock.outputConnection)
    //   }
    // })
  },
  to(type, block, data, {logDebug}) {
    if (type === 'js') {
      const varName = Blockly.JavaScript.valueToCode(block, 'varName', Blockly.JavaScript.ORDER_NONE)
      const rtn = Blockly.JavaScript.valueToCode(block, 'rtn', Blockly.JavaScript.ORDER_NONE)

      return `
        ${varName}=${rtn}
      `
    }
  }
}