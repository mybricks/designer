import {BLOCK_TYPE_INPUT_START, VAR_OUTPUT} from "../constants";

export default {
  name: BLOCK_TYPE_INPUT_START,
  title: '当输入到达',
  showInToolbox: false,
  root:true,
  data: {
    hostId: void 0
  },
  render(renderer, data, {curFn}) {
    data.hostId = curFn.id
    renderer.appendDummyInput()
      .appendField(curFn.input ? `当输入 ${curFn.input} 到达` : `开始执行`)

    renderer.appendStatementInput('Body')
    renderer.setColour(330)
  },
  editors: [{
    title: '列表',
    type: 'params',
    value: {
      get({data}) {
        return data.itemAry
      },
      set({data}, val) {
        if (typeof val === 'string') {
          val = JSON.parse(val)
        }
        data.itemAry = val
      }
    }
  }],
  to(type, block, data, {curFn, logDebug}) {
    if (type === 'js') {
      const inputVarName = data.hostId
      const bodyCode = Blockly.JavaScript.statementToCode(block, 'Body');

      if (!curFn.input) {
        return `
              ${bodyCode}
              `
      } else {
        return `
              ${inputVarName}((${inputVarName},${VAR_OUTPUT})=>{
                ${bodyCode}
              })
              `
      }
    }
  }
}