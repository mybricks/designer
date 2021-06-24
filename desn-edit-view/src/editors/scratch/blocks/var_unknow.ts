export function init() {
  Blockly.JavaScript['var_unknow'] = function (block) {
    const value = block.getFieldValue(`value`)
    return [`${JSON.stringify(value)}`, Blockly.JavaScript.ORDER_ATOMIC];
  }

  Blockly.Blocks['var_unknow'] = {
    init: function () {
      this.setHelpUrl(Blockly.Msg['LISTS_CREATE_WITH_HELPURL']);
      this.setStyle('list_blocks');

      this.appendDummyInput().appendField(new Blockly.FieldTextInput(), 'value')

      this.setOutput(true);
    }
  }
}