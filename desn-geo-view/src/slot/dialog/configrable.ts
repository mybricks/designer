import {NS_Configurable} from "@sdk";
import {antiShaking} from "@utils";
import {GeoViewContext} from "../GeoView";

//Record for current active editor array
let activeEditorAry = []

export function get(geoViewContext: GeoViewContext) {
  activeEditorAry = []

  const {viewModel: model, context, emitItem, emitPage} = geoViewContext
  const rtn = []

  const normalCategary = new NS_Configurable.Category('页面布局')
  rtn.push(normalCategary)

  const normalGroup = new NS_Configurable.Group();
  normalCategary.addGroup(normalGroup)

  // normalGroup.addItem(createEdtItem(geoViewContext, {
  //   title: '标题',
  //   type: 'text',
  //   description: `设置页面的标题`,
  //   value: {
  //     get() {
  //       return model.page.title
  //     }, set(val) {
  //       model.page.title = val
  //     }
  //   }
  // }))

  normalGroup.addItem(createEdtItem(geoViewContext, {
    title: '背景色',
    type: 'color',
    description: `设置页面的背景色`,
    value: {
      get() {
        return model.style.backgroundColor
      }, set(val) {
        model.style.backgroundColor = val
      }
    }
  }))

  normalGroup.addItem(createEdtItem(geoViewContext, {
    title: '页面内间距',
    type: 'inputNumber',
    options: [
      {
        title: '上',
        width: 100
      }, {
        title: '下',
        width: 100
      }, {
        title: '左',
        width: 100
      }, {
        title: '右',
        width: 100
      }
    ],
    value: {
      get() {
        return [
          model.style.paddingTop,
          model.style.paddingBottom,
          model.style.paddingLeft,
          model.style.paddingRight
        ]
      },
      set([top, bottom, left, right]) {
        model.style.paddingTop = top
        model.style.paddingBottom = bottom
        model.style.paddingLeft = left
        model.style.paddingRight = right
      }
    }
  }))

  const contentGroup = new NS_Configurable.Group('内容')
  normalGroup.addItem(contentGroup)

  contentGroup.addItem(createEdtItem(geoViewContext, {
    title: '水平对齐',
    type: 'Select',
    options: [
      {value: 'flex-start', label: '居左'},
      {value: 'center', label: '居中'},
      {value: 'flex-end', label: '居右'}
    ],
    description: `水平对齐`,
    value: {
      get() {
        return model.style.alignItems
      }, set(val) {
        model.style.alignItems = val
      }
    }
  }))

  contentGroup.addItem(createEdtItem(geoViewContext, {
    title: '垂直对齐',
    type: 'Select',
    options: [
      {value: 'flex-start', label: '居上'},
      {value: 'center', label: '居中'},
      {value: 'flex-end', label: '居下'},
    ],
    description: `垂直对齐`,
    value: {
      get() {
        return model.style.justifyContent
      }, set(val) {
        model.style.justifyContent = val
      }
    }
  }))

  // //---------------------------------------------------------------------------------------------
  // const sysGroup = new NS_Configurable.Group()
  // sysGroup.fixedAt = 'bottom'
  //
  // normalCategary.addGroup(sysGroup)
  // sysGroup.addItem(createEdtItem(geoViewContext, {
  //   title: '删除',
  //   type: 'button',
  //   options: {
  //     type: 'danger'
  //   },
  //   value: {
  //     set(context, val) {
  //       emitPage.delete(model.page.id)
  //     }
  //   }
  // }))

  return rtn.map(catelog => {
    catelog.groups && (catelog.groups.forEach(group => {
      group.items && (group.items = group.items.filter(item => item))
    }))
    return catelog
  })
}

function createEdtItem(geoViewContext: GeoViewContext, editor: any) {
  activeEditorAry.push(editor)

  const {model, emitItem, emitSnap, emitCanvasView} = geoViewContext
  if (typeof editor === 'object') {
    let ifVisible
    if (typeof editor.ifVisible === 'function') {
      ifVisible = () => {
        const activeF = activeEditorAry.indexOf(editor) >= 0//To avoid triger observable in disactive editor
        if (activeF) {
          const rtn = editor.ifVisible()
          return typeof (rtn) === 'boolean' ? rtn : false
        }
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