import css from './ExceptionCom.less';
import {GeoComModel} from "../GeoComModel";
import {evt, observe, useComputed} from "@mybricks/rxui";
import {ComContext} from "../GeoCom";
import {useMemo} from "react";
import {get as getConfigurable, getEditContext} from "../configrable";
import {get as getListenable} from "../normal/listenable";
import {NS_Configurable, NS_Listenable} from "@sdk";
import I_Configurable = NS_Configurable.I_Configurable;
import I_Listenable = NS_Listenable.I_Listenable;

export default function ExceptionCom({model, type, msg}: { model: GeoComModel, type: string, msg: string }) {
  const comContext = observe(ComContext, {from: 'parents'})

  useMemo(() => {
    ;(model as I_Configurable).getConfigs = function () {
      return getConfigurable(comContext)
    }
    ;(model as I_Listenable).getListeners = function () {
      return getListenable(comContext)
    }
  }, [])

  const classes = useComputed(() => {
    const rtn = [css.com, css.desn, css[type]]

    if (model.state.isFocused()) {
      rtn.push(`${model.id}-focus ` + css.focus)
    }

    return rtn.join(' ')
  })

  return (
    <div onClick={evt(click).stop} ref={el => el && (model.$el = el)}
         onMouseOver={evt(mouseOver).stop}
         onMouseOut={evt(mouseout).stop}
         className={classes}>
      <p>{msg}</p>
    </div>
  )
}

function mouseOver() {
  const {model, context, emitItem, emitSnap} = observe(ComContext)
  emitItem.hover(model)
}

function mouseout() {
  const {emitItem} = observe(ComContext)
  if (emitItem) {
    emitItem.hover(null)
  }
}

function click(evt) {
  const comContext = observe(ComContext)
  const {model, comDef, context, emitItem, emitSnap} = comContext

  //console.log('clicked', this.model.state.isFocused(),this.model.state.isEditing())

  if (context.isDebugMode()) return

  emitItem.focus(model)
}