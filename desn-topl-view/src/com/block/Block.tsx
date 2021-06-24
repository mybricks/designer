import {observe, useComputed} from '@mybricks/rxui';
import {ComContext} from '../ToplCom';
import {useMemo} from "react";
import {PinExtInputs} from "../../config";
import {NS_Configurable, NS_Listenable, T_PinSchema} from "@sdk";
import {get as getConfigurable, getEditContext} from "../configrable";
import {get as getListenable} from "../listenable";
import I_Configurable = NS_Configurable.I_Configurable;
import I_Listenable = NS_Listenable.I_Listenable;

import FoldedBlock from './FoldedBlock'
import UnfoldedBlock from "./UnfoldedBlock";

export default function Block() {
  const comContext = observe(ComContext, {from: 'parents'})
  const {model, comDef} = comContext

  useMemo(() => {
    if (model.runtime.hasUI()) {
      PinExtInputs.forEach(pin => {
        model.addInputPinExt(pin.hostId, pin.title, pin.schema as T_PinSchema)
      })
    }

    if (comDef.editors && !model.runtime.initState.editorInitInvoked) {
      model.runtime.initState.editorInitInvoked = true

      let editors = comDef.editors
      const initFn = editors['@init']
      if (typeof initFn === 'function') {
        initFn(getEditContext(comContext))
      }
    }

    (model as I_Configurable).getConfigs = function () {
      return getConfigurable(comContext)
    }
    ;(model as I_Listenable).getListeners = function () {
      return getListenable(comContext)
    }
  }, [])

  return (
    model.folded ? <FoldedBlock click={click} dblClick={dblClick} upgrade={upgrade}/>
      : <UnfoldedBlock click={click} dblClick={dblClick} upgrade={upgrade}/>
  )
}

function click(evt) {
  const {model, context, emitItem, emitSnap} = observe(ComContext)
  emitItem.focus(model)
}

function dblClick(evt) {
  const {model, comDef, context, emitItem, emitSnap} = observe(ComContext)
  emitItem.focusFork(model)
}

function upgrade() {
  const {model, comDef, emitItem, emitSnap} = observe(ComContext)
  emitItem.upgrade(model)
}