import {DesignerContext, NS_Emits} from "@sdk";

export default class ComLibViewCtx {
  show: boolean = false

  context: DesignerContext

  emitSnap: NS_Emits.Snap

  emitLogs: NS_Emits.Logs

  emitItems: NS_Emits.Component

  activeLib: { id: string, comAray }

  renderedLib: { id: string, content }[] = []

  activeCatalog

  mode: 'geo' | 'topl'

  matchCom(comDef) {
    if (this.mode) {
      if (this.mode === 'geo') {
        if (!comDef.rtType || comDef.rtType.match(/vue|react/gi)) {
          return true
        }
      } else if (this.mode === 'topl') {
        if (comDef.rtType && comDef.rtType.match(/js|ts/gi)) {
          return true
        }
      }
    }
  }
}