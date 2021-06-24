import {ConContext} from "./Con";
import {NS_Listenable} from "@sdk";

export function getCon(conContext: ConContext): Array<NS_Listenable.T_Listener> {
  const {model, comDef, emitSnap, emitComponent} = conContext

  let btns = [
    {
      title: '删除',
      keys: ['Backspace'],
      exe: () => {
        let snap = emitSnap.start('itemDelete')
        emitComponent.delete(model)

        emitComponent.disConnected(model)
        emitComponent.focus(null)
        model.parent.connections.changed()
        snap.commit()
      }
    }]

  return btns
}

export function getComment(conContext: ConContext): Array<NS_Listenable.T_Listener> {
  const {model, comDef, emitSnap, emitComponent} = conContext

  let btns = [
    {
      title: '删除',
      keys: ['Backspace'],
      exe: () => {
        let snap = emitSnap.start('itemDelete')
        model.removeComment()
        snap.commit()
      }
    }]

  return btns
}