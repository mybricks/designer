/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {NS_Configurable} from "@sdk";
import {ComContext} from "../ToplCom";
import {createEdtItem} from "../../util";

export function get(comContext: ComContext, reFocus?: () => any) {
  const {model, comDef, context, emitMessage, emitModule, emitItem, emitSnap} = comContext
  let rtn = []

  let comCategary = new NS_Configurable.Category(model.runtime.title)
  rtn.push(comCategary)

  const edtContext = getEditContext(comContext)

  //-------------------------------------------------------------------
  const sysGroup = new NS_Configurable.Group()
  sysGroup.fixedAt = 'bottom'
  comCategary.addGroup(sysGroup)

  sysGroup.addItem(() => {
      return (
        <div>
          <span style={{color: '#999', fontStyle: 'italic'}}>ID : {model.id}</span>
          <span style={{marginLeft: 10, color: '#999', fontStyle: 'italic'}}>版本号 : {model.runtime.def.version}</span>
        </div>
      )
    }
  )

  if (context.isDesnMode()) {
    sysGroup.addItem(createEdtItem(edtContext, {
      title: '删除',
      type: 'button',
      options: {type: 'danger'},
      value: {
        set(context, val) {
          const snap = emitSnap.start('itemDelete')
          emitItem.delete(model)
          emitItem.focus(void 0)
          snap.commit()
        }
      }
    }))
  }

  return rtn
}

export function getEditContext({context, model, emitItem, emitPage, emitSnap, emitLogs, emitCanvasView}: ComContext) {
  return {
    snap: emitSnap,
    logs: emitLogs,
    get data() {
      return model.data
    },
    input: model.getInputEditor(emitItem),
    output: model.getOutputEditor(emitItem),
    get env() {
      return {
        getCurPage() {
          return emitPage.getCurPage()
        },
        getPageTree(all?) {
          return emitPage.getPageTree(all)
        }
      }
    }
    // openEditor(opts) {
    //   //th.emitOpen.editor(opts)
    // }
  }
}