/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {DesignerContext, T_XGraphComDef} from "@sdk";
import {GeoComModel} from "./GeoComModel";
import {EDITOR_RESERVED} from "../config";

/**
 * For *:[{type:'@resizeH',...}] editor
 *
 * @param comDef
 */
export function getResizeHEditor(comDef: T_XGraphComDef, selector: string = '*') {
  if (comDef.editors) {
    let viewOn = comDef.editors.layout || comDef.editors
    if (viewOn) {
      const allEditorAry = viewOn[selector]
      if (Array.isArray(allEditorAry)) {
        // if(comDef.title==='工具条'){
        //   debugger
        // }
        return allEditorAry.find(editor => {
          if (typeof editor === 'object' && editor.type === EDITOR_RESERVED.RESIZEH) {
            return true
          }
        })
      }
    }
  }
}

export function edtOnSelectorAry(comDef: T_XGraphComDef) {
  let editOn = comDef && comDef.editors;
  if (editOn) {
    const viewOn = editOn.layout || editOn;
    if (viewOn) {
      const ary = Object.keys(viewOn);
      if (ary) {
        return ary.map(selector => {
          if(selector!=='logic'){
            return {
              selector,
              edtAry: viewOn[selector], viewOn
            }
          }
        }).filter(item=>item)
      }
    }
  }
  return []
}

type T_EditorNode = {
  model: GeoComModel,
  title: string,
  ele: HTMLElement
}

export function getEditorPath(foundEle: HTMLElement,
                              model: GeoComModel,
                              context: DesignerContext): T_EditorNode[] {
  const editPath: T_EditorNode[] = []

  function getComEditorPath(model: GeoComModel) {
    let parentCom
    if (model.parent && !model.parent.isRoot() && (parentCom = model.parent.parent)) {
      const editPath = getEditorPath(model.$el, parentCom, context)
      return editPath
    }
  }

  if (foundEle === void 0) {//For component
    return getComEditorPath(model)
  } else {
    const comDef = context.getComDef(model.runtime.def)

    const editOnAry = edtOnSelectorAry(comDef)

    let tel: HTMLElement = foundEle.parentNode as HTMLElement
    while (tel && tel !== model.$el.firstChild) {
      const tparent = tel.parentNode
      if (tparent) {
        editOnAry.find(({selector, edtAry, viewOn}) => {
          if (selector !== '*') {
            let selAll;
            try {
              selAll = tparent.querySelectorAll(selector);
            } catch (ex) {
              try {
                selAll = tparent.querySelectorAll(':scope' + selector);
              } catch (ex) {

              }
            }
            if (selAll) {
              let index = [].indexOf.call(selAll, tel)
              if (index >= 0) {
                editPath.push({
                  model,
                  ele: tel,
                  title: Array.isArray(edtAry) ? '未标题' : edtAry.title
                })
              }
            }
          }
        })
      }
      tel = tel.parentNode as HTMLElement
    }

    editPath.push({
      model,
      title: model.runtime.title || comDef.title,
      ele: model.$el
    })

    const parentEditorPath = getComEditorPath(model)
    if (parentEditorPath) {
      return parentEditorPath.concat(editPath.reverse())
    } else {
      return editPath.reverse()
    }
  }
}