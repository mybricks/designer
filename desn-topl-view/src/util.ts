import {NS_Configurable, T_XGraphComDef} from "@sdk";
import Group = NS_Configurable.Group;

export function createEdtAry(comDef: T_XGraphComDef, edtContext, selectors, reFocus?: () => any): Array<NS_Configurable.EditItem> {
  let edtAry;
  if (comDef.editors) {
    const viewOn = comDef.rtType && comDef.rtType.match(/js|scratch/gi) ? comDef.editors : comDef.editors.logic
    if (viewOn) {
      const ary = [];
      Object.keys(selectors).forEach(selector => {
        if (edtAry = viewOn[selector]) {
          edtAry.forEach(edt => {
            if (edt.type) {
              ary.push(createEdtItem(edtContext, edt, reFocus))
            } else if (Array.isArray(edt.items)) {
              let ifVisible
              if (typeof edt.ifVisible === 'function') {
                ifVisible = () => {
                  const rtn = edt.ifVisible(edtContext)
                  return typeof (rtn) === 'boolean' ? rtn : false
                }
              }

              const group = new Group({title: edt.title, description: edt.description, ifVisible})

              edt.items.forEach(edt2 => {
                if (typeof edt2 === 'function' || edt2.type) {
                  group.addItem(createEdtItem(edtContext, edt2))
                }
              })

              if (group.items && group.items.length > 0) {
                ary.push(group)
              }
            }
          })
        }
      })
      return ary
    }
  }
}

export function createEdtItem(edtContext: { def?, data?, input?, output?, setScript?, snap, logs },
                              editor, reFocus?: () => any) {
  if (typeof editor === 'function') {
    return new NS_Configurable.FunctionItem(function () {
      editor(edtContext)
    })
  } else if (typeof editor === 'object') {
    let options = editor.options
    if (typeof options === 'function') {
      try {
        options = editor.options(edtContext)
      } catch (ex) {
        console.error(ex)
        return new NS_Configurable.ErrorItem({title: '编辑项错误', description: ex.stack})
      }
    }

    return new NS_Configurable.EditItem({
      title: editor.title,
      type: editor.type,
      description: editor.description,
      value: (function () {
        let initVal, wartForComplete = false;//Prevent for invoke value.get many times before onComplete invoked
        return {
          get() {
            if (initVal !== void 0) {
              return initVal
            }

            try {
              initVal = (editor.value && editor.value.get || (() => undefined))(edtContext)
              initVal = initVal == undefined ? null : initVal;
            } catch (ex) {
              console.error(ex)

              edtContext.snap.error(`编辑器(${editor.title}.value.get)发生错误.`, ex.message)
              return
            }
            return initVal;
          }, set(v) {
            if (initVal !== v) {
              const snap = edtContext.snap.start('Change value');
              try {
                (editor.value && editor.value.set || (() => undefined))(edtContext, v)
                snap.commit()
                initVal = void 0
                reFocus && setTimeout(reFocus)
              } catch (ex) {
                snap.cancel()

                console.error(ex)

                edtContext.snap.error(`编辑器(${editor.title}.value.set)发生错误.`, ex.message)
                return
              }
            }
          }
        }
      })(), options
    } as any)
  } else {
    throw new Error(`Invalid typeof editor(function or object expect)`)
  }
}