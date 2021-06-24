/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {evt, observe, useComputed} from '@mybricks/rxui';
import css from './ExceptionCom.less';
import {ComContext, getStyle, Inputs, Outputs} from '../ToplCom';
import {ToplComModel} from "../ToplComModel";
import {useMemo} from "react";
import {get as getListenable} from "../listenable";
import {NS_Configurable, NS_Listenable} from "@sdk";
import I_Listenable = NS_Listenable.I_Listenable;
import cssParant from "../ToplCom.less";
import {get as getConfigurable} from "./configrable";
import I_Configurable = NS_Configurable.I_Configurable;

export default function ExceptionCom({model, type, msg}: { model: ToplComModel, type: string, msg: string }) {
  const comContext = observe(ComContext, {from: 'parents'})

  useMemo(() => {
    (model as I_Configurable).getConfigs = function () {
      return getConfigurable(comContext)
    }
    ;(model as I_Listenable).getListeners = function () {
      if (comContext.context.isDesnMode()) {
        return getListenable(comContext)
      }
    }
  }, [])

  const classes = useComputed(() => {
    const rtn = []
    rtn.push(css.com)
    rtn.push(css[type])
    model.state.isFocused() && rtn.push(cssParant.focus)
    model.state.isMoving() && rtn.push(cssParant.moving)

    return rtn.join(' ')
  })

  return (
    <div ref={el => el && (model.$el = el)}
         className={classes}
         style={getStyle(model)}
      //style={style}
         onClick={evt(click).stop}>
      <p className={css.title}>{msg}</p>
      <Inputs model={model}/>
      <Outputs model={model}/>
    </div>
  )
}

function click(evt) {
  const {model, wrapper, emitItem, emitSnap} = observe(ComContext)

  // if (model.state.isFocused()) {
  //   emitItem.blur(model)
  //   model.blur()
  // } else {
  //
  // }

  if (wrapper) {
    emitItem.focus(wrapper)
  } else {
    emitItem.focus(model)
  }
}