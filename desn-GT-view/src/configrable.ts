/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {NS_Configurable} from "@sdk";
import StageViewContext from "./StageViewContext";

export function getConfigs(svContext: StageViewContext) {
  const {model, context, emitItem, emitSnap} = svContext
  let rtn = []

  const ctxCfgs = context.configs

  const stageCfgs = ctxCfgs.editView?.items

  let comCategary = new NS_Configurable.Category('项目')
  rtn.push(comCategary)

  if(Array.isArray(stageCfgs)){
    stageCfgs.forEach(group=>{
      const bgGroup = new NS_Configurable.Group(group.title);
      comCategary.addGroup(bgGroup)

      group.items.forEach(item => {
        bgGroup.addItem(createEdtItem(svContext, {
          title: item.title,
          type: item.type,
          options:item.options,
          value: {
            get() {
              return item.value.get()
            },
            set(val) {
              item.value.set(val)
            }
          }
        }))
      })
    })
  }

  //---------------------------------------------------------------------------------------------

  // const envGroup = new NS_Configurable.Group('调试')
  // comCategary.addGroup(envGroup)

  // if (ctxCfgs.debug && Array.isArray(ctxCfgs.debug.envTypes)) {
  //   envGroup.addItem(createEdtItem(svContext, {
  //     title: `环境类型`,
  //     type: 'select',
  //     options: ctxCfgs.debug.envTypes.map(({id, title}) => ({value: id, label: title})),
  //     value: {
  //       get() {
  //         return context.envVars.debug.envType
  //       },
  //       set(val) {
  //         context.envVars.debug.envType = val
  //       }
  //     }
  //   }))
  // }

  // envGroup.addItem(createEdtItem(svContext, {
  //   title: `用户Token`,
  //   type: 'text',
  //   value: {
  //     get() {
  //       return context.envVars.debug.userToken
  //     },
  //     set(val) {
  //       context.envVars.debug.userToken = val
  //     }
  //   }
  // }))

  // envGroup.addItem(createEdtItem(svContext, {
  //   title: `环境参数`,
  //   type: 'textarea',
  //   value: {
  //     get() {
  //       return context.envVars.debug.envParams
  //     },
  //     set(val) {
  //       context.envVars.debug.envParams = val
  //     }
  //   }
  // }))

  return rtn
}

function createEdtItem(comContext: StageViewContext, editor) {
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
              initVal = (editor.value && editor.value.get || (() => undefined))()
              initVal = initVal == undefined ? null : initVal;
            }
            return initVal;
          }, set(v) {
            wartForComplete = false;
            const snap = emitSnap.start('Change value');
            try {
              (editor.value && editor.value.set || (() => undefined))(v)
              snap.commit()
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