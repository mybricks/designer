/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {NS_Configurable, NS_XGraphComLib} from "@sdk";
import {ComContext} from "./ToplCom";
import {createEdtAry, createEdtItem} from "../util";
import ToplComModelForked from "./ToplComModelForked";

export function get(comContext: ComContext, reFocus?: () => any) {
  const {model, comDef, context, emitMessage, emitModule, emitItem, emitSnap} = comContext
  let rtn = []

  let comCategary = new NS_Configurable.Category(model.runtime.title)
  rtn.push(comCategary)

  const comGroup = new NS_Configurable.Group()

  const edtContext = getEditContext(comContext)

  // comGroup.addItem(createEdtItem(comContext, {
  //   title: 'ID',
  //   type: 'text',
  //   options: {
  //     readonly: true
  //   },
  //   value: {
  //     get() {
  //       return model.id
  //     }
  //   }
  // }))

  // comGroup.addItem(createEdtItem(comContext, {
  //   title: '标记色',
  //   type: 'color',
  //   value: {
  //     get() {
  //       return model.runtime.labelColor
  //     }, set(context, val) {
  //       model.runtime.labelColor = val
  //     }
  //   }
  // }))

  // comGroup.addItem(createEdtItem(edtContext, {
  //   title: '标记',
  //   type: 'select',
  //   options: [
  //     {value: 'none', label: '无'},
  //     {value: 'todo', label: '待完成(Todo)'}
  //   ],
  //   value: {
  //     get() {
  //       return model.runtime.labelType
  //     }, set(context, val) {
  //       model.runtime.labelType = val
  //     }
  //   }
  // }))

  // if (model.runtime.def.namespace !== XGDefinedComLib.coms.subModule &&
  //   model.runtime.def.namespace !== XGDefinedComLib.coms.calculate &&
  //   model.runtime.def.namespace !== XGDefinedComLib.coms.extPoint) {
  //   comGroup.addItem(createEdtItem(edtContext, {
  //     title: 'Mock模式',
  //     type: 'switch',
  //     value: {
  //       get() {
  //         return model.runtime.mocking
  //       }, set(context, val) {
  //         model.runtime.mocking = val
  //       }
  //     }
  //   }))
  // }

  comCategary.addGroup(comGroup)

  if (context.isDesnMode()) {
    const ary = createEdtAry(comContext.comDef, getEditContext(comContext), {':root': true}, reFocus);
    if (ary) {
      const edtGroup = new NS_Configurable.Group()
      edtGroup.addItems(ary)

      comCategary.addGroup(edtGroup)
    }
  }
  //
  // const ioGroup = new NS_Configurable.Group()
  // ioGroup.addItem(new NS_Configurable.RenderItem('输入项', function () {
  //   return <CfgPin type={'input'} pins={{
  //     def: model.inputPins,
  //     inModel: model.inputPinsInModel,
  //     ext: model.inputPinExts
  //   }}/>
  // }))
  //
  // ioGroup.addItem(new NS_Configurable.RenderItem('输出项', function () {
  //   return <CfgPin type={'output'} pins={{
  //     def: model.outputPins,
  //     inModel: model.outputPinsInModel,
  //     ext: model.outputPinExts
  //   }}/>
  // }))
  //
  // comCategary.addGroup(ioGroup)

  //-------------------------------------------------------------------
  const sysGroup = new NS_Configurable.Group()
  sysGroup.fixedAt = 'bottom'
  comCategary.addGroup(sysGroup)

  if (model.runtime.def.namespace === NS_XGraphComLib.coms.module) {
    sysGroup.addItem(createEdtItem(edtContext, {
      title: '打开',
      type: 'button',
      value: {
        set(context, val) {
          const frame = model.frames ? model.frames[0] : void 0

          emitModule.load({
            instId: model.id,
            title: model.runtime.title || comDef.title,
            frame//Emits frame only,slot will found in DBLView
          } as any)

          emitItem.blur()
        }
      }
    }))
  }

  sysGroup.addItem(createEdtItem(edtContext, {
    title: `标题`,
    type: 'text',
    value: {
      get() {
        return model.runtime.title || comDef?.title
      }, set(ctx, val) {
        model.runtime.title = val
      }
    }
  }))

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
    if (!(model instanceof ToplComModelForked)
      || !(model as ToplComModelForked).isStartInDiagram()) {
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
  }

  return rtn
}

export function getEditContext({context, model, emitItem, emitPage, emitSnap, emitLogs, emitCanvasView}: ComContext) {
  return {
    title:model.runtime.title,
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