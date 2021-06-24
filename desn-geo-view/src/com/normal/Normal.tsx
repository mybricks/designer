/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {evt, observe, useComputed} from "@mybricks/rxui";
import css from "./Normal.less";
import React, {useEffect, useMemo} from "react";
import {ComContext} from "../GeoCom";
import {getEnv, getInputs, getOutputs, getStyle} from "../comCommons";
import {edtOnSelectorAry, getEditorPath} from '../editorUtils'
import {GeoComModel} from "../GeoComModel";
import Slot from "../../slot/Slot";

import {get as getConfigurable, getEditContext} from "../configrable";
import {get as getListenable} from "./listenable";
import {refactorStyle} from "../../geoUtil";
import {NS_Configurable, NS_Listenable} from "@sdk";
import {THEME_COLOR_PREMIMER} from "../../constants";
import I_Configurable = NS_Configurable.I_Configurable;
import I_Listenable = NS_Listenable.I_Listenable;

export default function Normal({mouseDown}) {
  const comContext = observe(ComContext, {from: 'parents'})

  const {comDef, model, context, emitItem, emitLogs} = comContext

  const style = useComputed(computeStyle)

  //Init
  useMemo(() => {
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

    ;(model as I_Configurable).getConfigs = (onlyShortcuts: boolean) => {
      return getConfigurable(comContext, onlyShortcuts)
    }
    ;(model as I_Listenable).getListeners = () => {
      return getListenable(comContext)
    }
  }, [])

  useEffect(() => {
    if (!model.initDom) {
      model.initDom = true

      let comEle = model.$el;
      if (comEle) {
        const realEle: HTMLElement = comEle.children[0] as HTMLElement

        if (realEle) {//Check if it's width:100% or height:100%
          if (model.style.width === void 0) {
            const nowWidth = realEle.offsetWidth
            comEle.classList.add(css.fullWidth)

            if (nowWidth !== realEle.offsetWidth) {
              model.style.width = '100%'//100% width
              model.style.display = 'block'
            } else if (nowWidth === model.parent.$el.offsetWidth) {
              model.style.width = '100%'//100% width
              model.style.display = 'block'
            } else {
              model.style.width = 'fit-content'
              model.style.display = 'inline-block'
            }
            comEle.classList.remove(css.fullWidth)
          }

          // if (model.style.height === void 0) {
          //   const nowHeight = realEle.offsetHeight
          //   comEle.classList.add(css.fullHeight)
          //   if (nowHeight !== realEle.offsetHeight) {
          //     model.style.height = '100%'//100% height
          //   }
          //   comEle.classList.remove(css.fullHeight)
          // }
        }

        // comEle.querySelectorAll('a[href]').forEach(alink => {
        //   alink['href'] = 'javascript:void(0);'
        // })

        // const styleSheet = [].find.call(styleSheets, (stylesheet: CSSStyleSheet) => {
        //   return stylesheet.ownerNode && stylesheet.ownerNode.nodeName.toLowerCase() === 'style'
        // })

        setTimeout(v => {
          const stag = document.createElement("style");
          document.head.appendChild(stag);

          const styleSheets = document.styleSheets
          const styleSheet = styleSheets[styleSheets.length - 1]

          styleSheet.addRule(`${model.id}-hover`, '');

          edtOnSelectorAry(comDef).forEach(({selector, edtAry}) => {
            if (!selector.match(/^\:|\@|\*/)) {
              let title, eAry;
              if (!Array.isArray(edtAry) && typeof edtAry === 'object') {
                if (!Array.isArray(edtAry.items)) {
                  throw new Error(`Invalid value type for selector(${selector}) in component(${comDef.namespace}),expect {items:[],title:string}.`)
                }
                title = edtAry.title
                eAry = edtAry.items
              } else {
                eAry = edtAry
              }
              let isItemEditable = false

              if (Array.isArray(eAry)) {
                eAry = eAry.filter(item => item)
                isItemEditable = eAry.find(item => {
                  return item && (item.type || Array.isArray(item.items))
                  //&& !item.type.match(/^_.+$/gi)
                })
              }

              if (isItemEditable) {
                styleSheet.addRule(`.${model.id}-hover ${selector}`, `
              position:relative;
              pointer-events: auto !important;
              cursor:pointer;
            `)

                styleSheet.addRule(`.${model.id}-hover ${selector}:not(.${css.editableFocus}):hover`, `
              outline-offset: -2px;
              outline: 1px dashed ${THEME_COLOR_PREMIMER} !important;
              overflow:hidden !important;
            `)
                styleSheet.addRule(`.${model.id}-hover ${selector}:not(.${css.editableFocus}):hover:after`, `
              height:19px;
              line-height:19px;
              width:fit-content !important;
              max-width:100%;
              overflow:hidden;
              position:absolute;
              pointer-events:none;
              left:1px;
              top:1px;
              font-size:12px;
              content:'${title || '可编辑区域'}';
              color:#FFF;
              background-color:${THEME_COLOR_PREMIMER};
              padding:1px 4px !important;
              border-radius:3px;
              text-overflow:ellipsis;
              white-space: nowrap;
            `)
              }
            }
          })
        })

        comEle.addEventListener('DOMNodeRemoved', function (e) {
          model.notifyEleChanged()
        })
      }
    }

    if (model.state.isFocused()) {
      emitItem.focus(model)
    }
  }, [])

  const rtContent = useComputed(() => {
    if (comDef) {
      if (comDef.runtime) {
        //return null
        return (
          <comDef.runtime
            data={model.data}
            env={getEnv(model, comContext)}
            style={getStyle()}
            slots={renderSlots(model, 'dev')}
            inputs={getInputs()}
            outputs={getOutputs()}
            key={model.id + 'dev'}
            // _onError_={(ex, type) => {
            //   console.error(ex)
            //   emitLogs.error('组件异常', ex.stack.replaceAll(/\/n/gi, '<br/>'))
            //
            //   if (type === 'render') {
            //     return (
            //       <div className={css.error}>
            //         {model.runtime.title}组件发生错误:<br/>
            //         {ex.message}
            //       </div>
            //     )
            //   }
            // }}
          />
        )
      }
    } else {
      return `"${model.runtime.def.namespace}" not found`
    }
  })

  const classes = useComputed(() => {
    const rtn = [css.com, css.desn]
    // if (comContext.hoverF) {
    //   rtn.push(model.id + '-hover')
    // }
    // const resizeHEditor = getResizeHEditor(comDef)
    // if (resizeHEditor) {
    //   if (resizeHEditor.get === 'function') {
    //     const width = resizeHEditor.get()
    //     if (width === void 0 || width === '100%') {
    //       rtn.push(css.fullWidth)
    //     }
    //   } else {
    //     rtn.push(css.fullWidth)
    //   }
    // }
    if (model.state.isFocused()) {
      rtn.push(css.focus)
      rtn.push(model.id + '-hover')
    }

    if (model.state.isEditing()) {
      rtn.push(css.editable)
    }
    if (model.runtime.labelType === 'todo') {
      rtn.push(css.labelTodo)
    }
    if (!model.style.isLayoutAbsolute() && model.state.isMoving()) {
      rtn.push(css.moving)
    }
    if (model.runtime.upgrade) {
      rtn.push(css.warn)
    }
    return rtn.join(' ')
  })

  return (
    <div ref={el => el && (model.$el = el)}
         style={style}
      // data-geo-com-namespace={model.runtime.def.namespace}
         className={classes}
         onMouseOver={evt(mouseEnter).stop}
         onMouseOut={evt(mouseLeave).stop}
         onClick={evt(click).stop}
      // onDoubleClick={evt(dbClick).stop}
         onMouseDown={evt(mouseDown).stop}>
      <ErrorBoundary title={`${model.runtime.title} 组件发生错误`}>
        {rtContent}
      </ErrorBoundary>
      {model.runtime.upgrade ?
        <div className={css.info} dom-type-info='1'>
          <ul>
            <li>{model.runtime.upgrade.info}</li>
          </ul>
          <p className={css.upgrade} onClick={upgrade}>升级</p>
        </div> :
        ''}
    </div>
  )
}

class ErrorBoundary extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {error: null, errorInfo: null};
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div className={css.errorRT}>
          <div className={css.tt}>{this.props.title}</div>
          <div className={css.info}>
            {this.state.error && this.state.error.toString()}
          </div>
          <div className={css.stack}>
            {this.state.errorInfo.componentStack}
          </div>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}


function renderSlots(model: GeoComModel, env) {
  if (model.slots) {
    const rst = {}
    model.slots.forEach(slot => {
      rst[slot.id] = {
        id: slot.id,
        title: slot.title,
        render(opt) {
          return <Slot key={slot.id + env} model={slot} options={opt}/>
        }
      }
    })
    return rst
  }
}

// function dbClick(evt) {
//   const comContext = observe(ComContext)
//   const {model, comDef, context, emitItem, emitSnap} = comContext
//   const found = getEdtAreaEle(evt.target, comContext)
//   if (found && found.editorAry && found.editorAry.find(({type}) => type && type.match(TextEditorsReg))) {
//     return
//   } else {
//     emitItem.focusFork(model)
//   }
// }

function upgrade() {
  const {model, context, emitItem, emitSnap} = observe(ComContext)
  emitItem.upgrade(model)
}

function mouseEnter() {
  const comContext = observe(ComContext)
  comContext.hoverF = true
  comContext.emitItem.hover(comContext.model)
}

function mouseLeave() {
  const comContext = observe(ComContext)
  comContext.hoverF = void 0
  comContext.emitItem.hover(null)
}

function click(evt) {
  const comContext = observe(ComContext)
  const {model, comDef, context, emitItem, emitSnap} = comContext

  //console.log('clicked', this.model.state.isFocused(),this.model.state.isEditing())

  if (context.isDebugMode()) return

  let state = model.state
  if (state.isMoving()) {
    emitItem.focus(model)
    return
  }

  const focusAreaEles = model.$el.querySelectorAll(`.${css.editableFocus}`)
  if (focusAreaEles.length > 0) {
    for (let i = 0; i < focusAreaEles.length; i++) {
      focusAreaEles[i].classList.remove(css.editableFocus)
    }
  }

  // if (state.isEnabled()) {
  //   if (model.focusArea) {
  //     //model.focusArea.ele.classList.remove(css.editableFocus)
  //     model.focusArea = void 0
  //   }
  //   // state.focus()//Focus now,so parent could found it
  //
  //   emitItem.focus(model)
  // } else if (state.isFocused()) {
  // state.focusedTimeRefresh()
  // if (state.focusedStepTime < 300) {
  //   return
  // }

  if (state.isEnabled()) {
    model.focusArea = void 0
    emitItem.reFocus(model)
    return
  }

  if (state.isFocused()) {
    state.editing()

    const found = getEdtAreaEle(evt.target, comContext)
    if (found) {
      const {title, ele, editorAry, editorPath} = found

      // if (model.focusArea) {
      //   model.focusArea.ele.classList.remove(css.editableFocus)
      // }

      ele.classList.add(css.editableFocus)

      model.setFocusArea(ele, ele['_vc_init_'].selectors, editorPath, title)

      emitItem.focus(model)
    } else if (evt.target === model.$el) {
      model.focusArea = void 0
      emitItem.reFocus(model)
    }
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

  //sty['display'] = 'block'//Ignore display in runtime

  if (!model.style.isVisible()) {
    sty['width'] = '100%'
    sty['visibility'] = 'hidden'
    sty['position'] = 'absolute'
  }

  const {top, right, bottom, left, width, height} = model.style
//console.log(model.style)
  let tsty
  if (model.style.isLayoutAbsolute() || model.style.isLayoutFixed()) {
    tsty = {
      // transform: model.isLayoutAbsolute() ?
      //   `translateY(${model.position.y}px) translateX(${model.position.x}px)` : '',
      //zIndex: 1,
      position: model.style.position,
      width: width + 'px',
      height: height + 'px'
    }

    if (top !== void 0) {
      tsty.top = top + 'px'
    }
    if (right !== void 0) {
      tsty.right = right + 'px'
    }
    if (bottom !== void 0) {
      tsty.bottom = bottom + 'px'
    }
    if (left !== void 0) {
      tsty.left = left + 'px'
    }
  } else {
    tsty = {
      height: height ? height : undefined
    }
  }
  sty = Object.assign(sty, tsty)

  refactorStyle(sty)

  delete sty['display']

  return sty
}

function getEdtAreaEle(targetEle, comContext: ComContext): {
  editorPath: {
    title: string,
    ele: HTMLElement
  }[]
  title: string,
  ele: HTMLElement,
  editorAry: {}[]
} {
  const {model, comDef, context} = comContext

  //const comEle = model.$el as HTMLElement;
  const comEle = model.$el.firstChild as HTMLElement;
  // if (targetEle === comEle) {
  //   return;
  // }
  const editOnAry = edtOnSelectorAry(comDef)

  const elesInSelector: { selector, eles }[] = []

  let foundTitle, foundEle, foundEdtAry;
  editOnAry.forEach(({selector, edtAry, viewOn}) => {
    // if(selector==='[data-item-type=composition]'){
    //   debugger
    // }

    if (!selector.match(/^:|\@|\*/)) {
      // if(foundEle){
      //   debugger
      // }

      let edtAry = viewOn[selector], isItemEditable = false;
      let title
      if (!Array.isArray(edtAry) && typeof edtAry === 'object') {
        if (!Array.isArray(edtAry.items)) {
          throw new Error(`Invalid value type for selector(${selector}) in component(${comDef.namespace}),expect {items:[],title:string}.`)
        }
        title = edtAry.title
        edtAry = edtAry.items
      }

      if (Array.isArray(edtAry)) {
        isItemEditable = edtAry.find(
          ({type, items}) => type || Array.isArray(items)
          //&& !type.match(/^_.+$/gi)
        )//_** ReservedEditors
      }
      if (isItemEditable) {
        let selAll;
        try {
          selAll = comEle.querySelectorAll(selector);
        } catch (ex) {
          console.log(model.$el)
          debugger
          selAll = comEle.querySelectorAll(':scope' + selector);
        }

        elesInSelector.push({
          selector,
          title,
          edtAry,
          eles: selAll
        })
      }
    }
  })

  if (elesInSelector.length > 0) {
    let tel = targetEle;
    do {
      if (elesInSelector.find(({selector, title, edtAry, eles}) => {
        return [].find.call(eles, ele => {
          if (tel === ele) {
            foundTitle = title
            foundEle = ele
            if (!foundEle['_vc_init_']) {
              foundEle['_vc_init_'] = {selectors: {[selector]: true}};
            } else {
              foundEle['_vc_init_'].selectors[selector] = true
            }
            if (!foundEdtAry) {
              foundEdtAry = edtAry
            }
            return true
          }
        })
      })) {
        break
      }
      tel = tel.parentNode
    } while (tel.parentNode)
  }

  if (foundEle) {
    const editorPath: { title: string, ele: HTMLElement }[] = getEditorPath(foundEle, model, context)
    return {
      editorPath,
      title: foundTitle,
      ele: foundEle,
      editorAry: foundEdtAry
    }
  }
}