/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {NS_Configurable} from "@sdk";

type ItemType = { title: string, type: string, options?: {}, value: { get, set } }

export function create(block, title: string, items: ItemType[], context) {
  let rtn = []

  let comCategary = new NS_Configurable.Category(title)
  rtn.push(comCategary)

  //comGroup.addItem(new Configurable.RenderItem('组件', comDef.title))

  const infoGroup = new NS_Configurable.Group();
  comCategary.addGroup(infoGroup)

  items.forEach(item => {
    infoGroup.addItem(createEdtItem(block, item, context))
  })

  return rtn;
}

function createEdtItem(block, editor, edtContext) {
  if (typeof editor === 'function') {
    return new NS_Configurable.FunctionItem(function () {
      editor(edtContext)
    })
  } else if (typeof editor === 'object') {
    let options = editor.options
    if (typeof options === 'function') {
      options = editor.options(edtContext)
    }

    return new NS_Configurable.EditItem({
      title: editor.title,
      type: editor.type,
      value: (function () {
        let initVal, wartForComplete = false;//Prevent for invoke value.get many times before onComplete invoked
        return {
          get() {
            if (!wartForComplete) {
              wartForComplete = true;
              initVal = (editor.value && editor.value.get || (() => undefined))(edtContext)
              initVal = initVal == undefined ? null : initVal;
            }
            return initVal;
          }, set(v) {
            wartForComplete = false;
            try {
              (editor.value && editor.value.set || (() => undefined))(edtContext, v)
              if (edtContext.refresh) {
                edtContext.refresh()
              }
              Blockly.Events.fire(new Blockly.Events.BlockChange(block, 'params', 'params', true, false))
            } catch (ex) {
              throw ex;
            }
          }
        }
      })(), options
    })
  } else {
    throw new Error(`Invalid typeof editor(function or object expect)`)
  }
}