/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './ComAdder.less'

import {evt, observe, useObservable} from "@mybricks/rxui";
import React, {useCallback, useEffect} from "react";
import ComlibView from "./ComlibView";
import {DesignerContext, NS_Emits} from "@sdk";

export class ComLibViewCtx {
  show: boolean = false

  rtTypes:RegExp

  context: DesignerContext

  emitSnap: NS_Emits.Snap

  emitLogs: NS_Emits.Logs

  emitItems: NS_Emits.Component

  activeLib: { id: string, comAray }

  renderedLib: { id: string, content }[] = []

  activeCatalog
}

export default function ComAdder({shower,rtTypes}) {
  const context = observe(DesignerContext, {from: 'parents'})
  const emitSnap = useObservable(NS_Emits.Snap, {expectTo: 'parents'})
  const emitItems = useObservable(NS_Emits.Component, {expectTo: 'parents'})
  const emitLogs = useObservable(NS_Emits.Logs, {expectTo: 'parents'})

  const ctx = useObservable(ComLibViewCtx, next => next({
    context,
    emitLogs,
    emitSnap,
    emitItems,
    rtTypes:rtTypes||/vue|react/gi
  }), {to: 'children'})

  useEffect(() => {
    return () => {
      //debugger
    }
  }, [])

  return (
    <>
      <div key={'comAdder'}
           className={`${css.adderCom}`}
           style={{display: shower ? '' : 'none'}}
           onClick={evt(() => ctx.show = true).stop}>+
      </div>
      <ComlibView/>
    </>
  )
}