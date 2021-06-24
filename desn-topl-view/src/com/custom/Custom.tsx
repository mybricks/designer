/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {evt, observe, useComputed} from '@mybricks/rxui';
import {NS_Configurable, NS_Listenable} from '@sdk';
import {useMemo} from 'react';
import css from './Custom.less';
import cssParant from '../ToplCom.less';

import {ComContext, getStyle, Info, Inputs, mouseDown, Outputs} from '../ToplCom';
import {get as getConfigurable, getEditContext} from '../configrable'
import {get as getListenable} from '../listenable'
import I_Configurable = NS_Configurable.I_Configurable;
import I_Listenable = NS_Listenable.I_Listenable;

export default function Custom() {
  const comContext = observe(ComContext, {from: 'parents'})
  const {model, comDef, context} = comContext

  useMemo(() => {
    if (!model.init) {
      model.init = true

      if (comDef.editors && !model.runtime.initState.editorInitInvoked) {
        model.runtime.initState.editorInitInvoked = true

        let editors = comDef.editors
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
    model.runtime.upgrade && rtn.push(cssParant.warn)
    model.runtime.labelType === 'todo' && rtn.push(cssParant.labelTodo)

    model.state.isFocused() && rtn.push(cssParant.focus)
    model.state.isMoving() && rtn.push(cssParant.moving)

    return rtn.join(' ')
  })

  const render = useComputed(() => {
    const rd = comDef.editors["@render"]
    const Render = rd.topl || rd
    return <Render title={model.runtime.title}
                   data={model.runtime.model.data}/>
  })

  return (
    <div ref={el => el && (model.$el = el)}
         data-topl-com-namespace={model.runtime.def.namespace}
         className={classes}
         style={getStyle(model)}
         onClick={evt(click).stop}
      // onDoubleClick={evt(dblClick).stop}
         onMouseDown={evt(mouseDown).stop.prevent}>
      {render}
      <Inputs model={model}/>
      <Outputs model={model}/>
      <Info model={model}/>
    </div>
  )
}

function click(evt) {
  const {model, wrapper, emitItem, emitSnap} = observe(ComContext)

  emitItem.focus(model)
}