import {NS_Configurable} from "@sdk";
import {antiShaking} from "@utils";
import {ToplViewContext} from "../../ToplView";

export function createEdtItem(tvCtx: ToplViewContext, editor: any) {
  const {emitItem, emitSnap} = tvCtx
  if (typeof editor === 'object') {
    let ifVisible
    if (typeof editor.ifVisible === 'function') {
      ifVisible = () => {
        // const activeF = activeEditorAry.indexOf(editor) >= 0//To avoid triger observable in disactive editor
        // if (activeF) {
          const rtn = editor.ifVisible()
          return typeof (rtn) === 'boolean' ? rtn : false
        //}
      }
    }
    let options = editor.options
    if (typeof options === 'function') {
      options = editor.options()
    }

    const describer = {
      title: editor.title,
      type: editor.type,
      description: editor.description,
      value: (function () {
        let initVal, wartForComplete = false;//Prevent for invoke value.get many times before onComplete invoked
        return {
          get() {
            if (!wartForComplete) {
              wartForComplete = true

              initVal = (editor.value && editor.value.get || (() => undefined))()
              initVal = initVal == undefined ? null : initVal;
            }
            return initVal;
          }, set(v) {
            antiShaking().push(() => {
              try {
                initVal = v
                wartForComplete = false;

                const snap = emitSnap.start('Change value');
                const fn = (editor.value && editor.value.set || (() => undefined))

                fn(v)
                snap.commit()
                emitItem.reFocus()
              } catch (ex) {
                throw ex;
              }
            })
          }
        }
      })(), options, ifVisible
    }

    return new NS_Configurable.EditItem(describer)
  } else {
    throw new Error(`Invalid typeof editor(function or object expect)`)
  }
}