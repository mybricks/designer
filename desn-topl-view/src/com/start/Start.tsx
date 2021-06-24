import {evt, observe, useComputed} from '@mybricks/rxui';
import {NS_Configurable, NS_Listenable} from '@sdk';
import {useEffect} from 'react';
import css from './Start.less';
import cssParant from '../ToplCom.less';

import {ComContext, Info, Inputs, Outputs} from '../ToplCom';
import {get as getConfigurable, getEditContext} from '../configrable'
import {get as getListenable} from '../listenable'
import ToplComModelForked from "../ToplComModelForked";
import I_Configurable = NS_Configurable.I_Configurable;
import I_Listenable = NS_Listenable.I_Listenable;

export default function Start() {
  const comContext = observe(ComContext, {from: 'parents'})
  const {model, comDef, context} = comContext

  useEffect(() => {
    if (!model.init) {
      model.init = true

      if (comDef.editors && !model.runtime.initState.editorInitInvoked) {
        model.runtime.initState.editorInitInvoked = true

        const editors = comDef.editors
        const initFn = editors['@init']
        if (typeof initFn === 'function') {
          initFn(getEditContext(comContext))
        }
      }
    }

    (model as I_Configurable).getConfigs = function () {
      return getConfigurable(comContext)
    }
    ;(model as I_Listenable).getListeners = function () {
      if (context.isDesnMode()) {
        return getListenable(comContext)
      }
    }
  }, [])

  const classes = useComputed(() => {
    const rtn = []
    rtn.push(css.com)

    model.error && rtn.push(cssParant.error)
    model.runtime.upgrade && rtn.push(css.warn)
    model.runtime.labelType === 'todo' && rtn.push(cssParant.labelTodo)

    if (model.forkedFrom && model.forkedFrom.state.isFocused()) {
      rtn.push(css.focus)
    }
    model.state.isFocused() && rtn.push(css.focus)
    model.state.isMoving() && rtn.push(cssParant.moving)

    return rtn.join(' ')
  })

  const pinType = model instanceof ToplComModelForked && model.isStartInDiagram() ? 'start' : void 0

  return (
    <div ref={el => el && (model.$el = el)}
         className={classes}
         onClick={evt(click).stop}
      // onMouseDown={evt(mouseDown).stop.prevent}
         onDoubleClick={evt(dblClick).stop}>
      {/*<p className={css.title}>{model.runtime.title || comDef.title}</p>*/}
      <Outputs model={model} type={pinType} className={css.outputPins}/>
      <Info model={model} className={css.info}/>
    </div>
  )
}

function click(evt) {
  const {model, emitItem, emitSnap} = observe(ComContext)

  //emitItem.focus([model, model.forkedFrom])
  emitItem.focus(model)
}

function dblClick(evt) {
  const {model, comDef, context, emitItem, emitSnap} = observe(ComContext)
  if (context.isDebugMode()) {
    return
  }

  if (context.isDesnMode()) {
    emitItem.focusFork(model)
  }
}