/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {NS_Configurable} from "@sdk";
import {ConContext} from "./Con";

export function get(conContext: ConContext) {
  const {model, context, emitComponent, emitSnap} = conContext
  let rtn = []

  let comCategary = new NS_Configurable.Category('连接')
  rtn.push(comCategary)

  let normalGroup = new NS_Configurable.Group();

  //comGroup.addItem(new Configurable.RenderItem('组件', comDef.title))

  // comGroup = new NS_Configurable.Group();
  // comCategary.addGroup(comGroup)
  //
  // comGroup.addItem(createEdtItem(conContext, {
  //   title: '名称',
  //   type: 'textarea',
  //   value: {
  //     get() {
  //       return model.title
  //     },
  //     set(ctx, val) {
  //       model.title = val
  //     }
  //   }
  // }, reFocus))

  normalGroup.addItem(createEdtItem(conContext, {
    title: 'ID',
    type: 'text',
    options: {
      readonly: true
    },
    value: {
      get() {
        return model.id
      }
    }
  }))

  normalGroup.addItem(createEdtItem(conContext, {
    title: '标题',
    type: 'text',
    value: {
      get() {
        return model.title
      },
      set(context, val) {
        return model.title = val
      }
    }
  }))

  comCategary.addGroup(normalGroup)

  //-------------------------------------------------------------------
  const sysGroup = new NS_Configurable.Group()
  sysGroup.fixedAt = 'bottom'

  comCategary.addGroup(sysGroup)

  sysGroup.addItem(createEdtItem(conContext, {
    title: '删除',
    type: 'button',
    value: {
      set(context, val) {
        let snap = emitSnap.start('itemDelete')

        emitComponent.delete(model)

        emitComponent.focus(void 0)
        snap.commit()
      }
    }
  }))

  return rtn;
}

function createEdtItem(comContext: ConContext, editor, reFocus?: () => any) {
  const {model, emitSnap} = comContext
  const edtContext = {}
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
            const snap = emitSnap.start('Change value');
            try {
              (editor.value && editor.value.set || (() => undefined))(edtContext, v)
              snap.commit()
              reFocus && Promise.resolve().then(reFocus)
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