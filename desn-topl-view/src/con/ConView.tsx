/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './ConView.less'
import Con from "./Con";
import {useComputed, useObservable} from "@mybricks/rxui";
import Beautify from "./Beautify";
import FrameModel from "../frame/FrameModel";
import {ToplComModel} from "../com/ToplComModel";
import {T_Po} from "./conTypes";
import DiagramModel from "../frame/diagram/DiagramModel";

export class ConViewContext {
  contextPoints: { [id: string]: Array<T_Po> } = {}
}

export default function ConView({frameModel}: { frameModel: FrameModel|DiagramModel }) {
  useObservable(ConViewContext, {to: 'children'})

  const classes = useComputed(() => {
    // if (frameModel.focusModelAry && frameModel.focusModelAry.find(item => item instanceof ToplComModel)) {
    //   return css.focusCom
    // }
    return css.normal
  })
  const cons = useComputed(() => {
    return frameModel.conAry.map((md, idx) => {
        return <Con key={md.id} model={md}/>
      }
    )
  })
  return (
    <svg className={`${classes} ${css.conView}`}>
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="10" refX="2" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" className={css.arrow}/>
        </marker>
        <marker id={`arrowR`} markerWidth="8" markerHeight="10" refX="0" refY="2" orient="auto">
          <path d="M0,0 L0,4 L3,2 z" className={css.running}/>
        </marker>
        <marker id={`arrowE`} markerWidth="8" markerHeight="10" refX="0" refY="2" orient="auto">
          <path d="M0,0 L0,4 L3,2 z" className={css.error}/>
        </marker>
      </defs>
      <Beautify frameModel={frameModel}/>
      {cons}
    </svg>
  )
}