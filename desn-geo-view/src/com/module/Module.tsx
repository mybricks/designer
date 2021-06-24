/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {evt, observe, useComputed} from "@mybricks/rxui";
import css from "./Module.less";
import {useEffect, useMemo} from "react";
import {ComContext} from "../GeoCom";
import {NS_Configurable, NS_Listenable} from "@sdk";
import {get as getConfigurable, getEditContext} from "../configrable";
import {get as getListenable} from "./listenable";
import {refactorStyle} from "../../geoUtil";
import I_Configurable = NS_Configurable.I_Configurable;
import I_Listenable = NS_Listenable.I_Listenable;

export default function Module({mouseDown}) {
  const comContext = observe(ComContext, {from: 'parents'})

  const {comDef, model, context, emitItem} = comContext

  const style = useComputed(computeStyle)

  //Init
  useMemo(() => {
    // if (!model.init) {
    //   model.init = true
    //   if (comDef.editors) {
    //     let viewOn = comDef.editors.view || comDef.editors
    //     const initFn = viewOn['@init']
    //     if (typeof initFn === 'function') {
    //       initFn(getEditContext(comContext))
    //     }
    //   }
    //
    //   //model.addSlot(model.id, '默认', VIEW_GEO_NAME, true)
    // }

    ;(model as I_Configurable).getConfigs = function () {
      return getConfigurable(comContext)
    }
    ;(model as I_Listenable).getListeners = function () {
      return getListenable(comContext)
    }
  }, [])

  useEffect(() => {
    if (model.state.isFocused()) {
      emitItem.focus(model)
    }
  }, [])

  return (
    <div ref={el => el && (model.$el = el)}
         style={style}
         data-geo-com-namespace={model.runtime.def.namespace}
         className={`${css.module} 
                     ${model.runtime.labelType === 'todo' ? `${css.labelTodo}` : ''}
                     ${model.state.isMoving() ? css.moving : ''}`
         }
         onMouseOver={evt(mouseOver).stop}
         onMouseOut={evt(mouseout).stop}
         onClick={evt(click).stop}
         // onDoubleClick={evt(dbClick).stop}
         onMouseDown={evt(mouseDown).stop}>
      <div>
        <p>
          {model.runtime.title || comDef.title}
        </p>
        {/*<button onClick={evt(open).stop}>打开</button>*/}
      </div>
    </div>
  )
}

function open() {
  const {comDef, model, context, emitModule, emitItem} = observe(ComContext)

  const slot = model.slots ? model.slots[0] : void 0

  emitModule.load({
    instId: model.id,
    title: model.runtime.title || comDef.title,
    slot//Emits slot only,frame will found in DBLView
  } as any)
  emitItem.blur()
}

function dbClick(evt) {
  const {model, comDef, context, emitItem, emitSnap} = observe(ComContext)
  emitItem.focusFork(model)
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
  const {model, comDef, context, emitItem, emitSnap} = observe(ComContext)

  //console.log('clicked', this.model.state.isFocused(),this.model.state.isEditing())

  if (context.isDebugMode()) return

  let state = model.state
  if (state.isMoving()) {
    emitItem.focus(model)
    return
  }

  if (state.isEnabled()) {
    emitItem.focus(model)
  }
}

function computeStyle() {
  const comContext = observe(ComContext)
  const {model, context, emitItem, emitSnap, comDef} = comContext

  if (comDef?.editors) {
    const viewEditors = comDef.editors['view'] || comDef.editors
    if (viewEditors) {
      if (typeof viewEditors['@willMount'] === 'function') {
        viewEditors['@willMount'](getEditContext(comContext))
      }
    }
  }

  const css = model.style.toCSS()
  let sty = {}
  for (let nm in css) {
    sty[nm] = css[nm]
  }

  if (!model.style.isVisible()) {
    sty['width'] = '100%'
    sty['visibility'] = 'hidden'
    sty['position'] = 'absolute'
  }

  const {left, top, width, height} = model.style

  if (model.style.left === void 0) {
    model.style.left = 0
  }

  if (model.style.top === void 0) {
    model.style.top = 0
  }

  sty = Object.assign(sty, model.style.isLayoutAbsolute() ? {
    // transform: model.isLayoutAbsolute() ?
    //   `translateY(${model.position.y}px) translateX(${model.position.x}px)` : '',
    zIndex: 1,
    position: 'absolute',
    left: left + 'px',
    top: top + 'px',
    width: width + 'px',
    height: height + 'px'
  } : {
    //height: height ? (height + 'px') : undefined
  })

  sty['display'] = 'flex'

  refactorStyle(sty)
  return sty
}