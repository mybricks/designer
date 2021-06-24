import {ComContext} from "../GeoCom";
import {NS_Listenable} from "@sdk";
import {copy} from "@utils";

export function get(comContext: ComContext): Array<NS_Listenable.T_Listener> {
  const {model, comDef, emitSnap, emitItem, emitMessage} = comContext

  if (model.focusArea) {
    return
  }

  const isLyAbs = model.style.isLayoutAbsolute()

  let btns = [
    {
      title: '复制',
      keys: ['ctrl+c'],
      exe: () => {
        const json = model.runtime.toJson()

        json.fromId = model.id

        if (copy(JSON.stringify(json))) {
          emitMessage.info(`已复制到剪切板.`)
        }
      }
    },
    // {
    //   title: '切换',
    //   items: [
    //     {
    //       title: '视角',
    //       exe: () => {
    //         emitItem.focusFork(this)
    //       }
    //     }
    //   ].concat(switches)
    // },
  ]

  if (model.deletable) {
    btns.push({
      title: '删除',
      keys: ['Backspace'],
      exe: () => {
        let snap = emitSnap.start('itemDelete')
        emitItem.delete(model)
        emitItem.focus(null)

        snap.commit()
      }
    })
  }

  return (isLyAbs ? [{
    title: '移至最前',
    exe: () => {
      let snap = emitSnap.start('itemZindex')
      model.setZIndex('max');
      snap.commit();
    }
  },
    {
      title: '移至最后',
      exe: () => {
        let snap = emitSnap.start('itemCopy')
        model.setZIndex('min');
        snap.commit();
      }
    }] : []).concat(btns)
}