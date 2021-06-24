import css from './index.less'
import {evt, observe, useComputed, useObservable} from '@mybricks/rxui'
import {getPosition} from '@utils'
import {GeoComModel} from '../../com/GeoComModel'
import {GeoViewContext} from '../GeoView'
import {DesignerContext, NS_Configurable, NS_Icons, NS_Shortable} from "@sdk";
import {getEditorPath} from "../../com/editorUtils";
import I_Configurable = NS_Configurable.I_Configurable;
import Shortcuts from "./Shortcuts";
import React, {useCallback} from "react";


type TMeta = {
  model: GeoComModel,
  points: Array<string>,
  enable: { width: boolean, height: boolean }
}

export class MaskContext {
  shortcuts: { x: number, y: number, fn: Function }
}

export default function Mask() {
  const gvContext = observe(GeoViewContext, {
    from: 'parents'
  })

  const {context, viewModel, emitItem} = gvContext

  const zoom = 1

  const myCtx = useObservable(MaskContext)

  const showShortcuts = useCallback((e, fn) => {
    const po = getPosition(e.target)
    myCtx.shortcuts = {x: po.x, y: po.y + e.target.offsetHeight, fn}
  }, [])

  const focused = useComputed(() => {
    myCtx.shortcuts = void 0

    const rtn = []
    if (context.focusModelAry) {
      const focusModelAry = context.focusModelAry.filter(model => model instanceof GeoComModel)
      if (focusModelAry.length > 0) {
        const boxAry = focusBox(context, focusModelAry, zoom)
        if (boxAry) {
          boxAry.forEach((box, idx) => {
            let diagramsJSX
            if (idx == 0 && focusModelAry.length === 1) {
              const comId = focusModelAry[0].id
              const diagrams = emitItem.getDiagrams(comId)
              if (diagrams) {
                diagramsJSX = (
                  <div className={css.diagrams}>
                    {diagrams.map(diagram => {
                      return diagram&&(
                        <div key={diagram.id} className={css.event}
                             onClick={() => {
                               Promise.resolve().then(v => {
                                 emitItem.editDiagram(comId, diagram.outPinHostId)
                               })
                             }}>
                          {diagram.outPinTitle}
                        </div>
                      )
                    })}
                  </div>
                )
              }
            }

            rtn.push(
              <div className={`${css.focus} ${box.editingF ? css.editing : ''}`} key={`focus-mask-${idx}`}
                   style={{
                     width: box.width,
                     height: box.height,
                     left: box.left,
                     top: box.top
                   }}>
                <div className={css.itemTitle}>
                  <div className={css.titleBar}>
                    {box.title}
                    {
                      box.shortcuts ? (
                        <span className={css.shortcuts}
                              onClick={evt(e => showShortcuts(e, box.shortcuts)).stop}>
                            <NS_Icons.config/>
                          </span>
                      ) : null
                    }
                  </div>
                  {diagramsJSX}
                </div>
              </div>
            )
          })
          rtn.push(<Shortcuts key='shortcuts' ctx={myCtx}/>)
        }
      }
    }
    return rtn
  })

  const hovered = useComputed(() => {
    const rtn = []
    if (gvContext.hoverModel) {
      //const diagrams = emitItem.getDiagrams(gvContext.hoverModel.id)

      const box = hoverBox(gvContext.hoverModel, zoom)
      box && rtn.push(
        <div className={css.hover} key='hover-mask'
             style={{
               width: box.width,
               height: box.height,
               left: box.left,
               top: box.top
             }}>
          <div className={css.itemTitle}>
            {box.title || '无标题'}
          </div>
          {/*{*/}
          {/*  diagrams?.length > 0 ? (*/}
          {/*    <div className={css.diagrams}>*/}
          {/*      {diagrams.map(diagram => {*/}
          {/*        return (*/}
          {/*          <span key={diagram.id}*/}
          {/*                className={css.event}>*/}
          {/*            <span>*/}
          {/*              <NS_Icons.event/>*/}
          {/*            </span>*/}
          {/*            {diagram.outPinTitle}*/}
          {/*          </span>*/}
          {/*        )*/}
          {/*      })}*/}
          {/*    </div>*/}
          {/*  ) : null*/}
          {/*}*/}
        </div>
      )
    }
    return rtn
  })

  return focused.concat(hovered)
}

function focusBox(context: DesignerContext, focusModelAry, zoom) {
  if (focusModelAry.length > 1) {//Multi
    let x, y, w, h;
    focusModelAry.forEach(({style: {left, top, width, height, display}}) => {
      if (x === undefined) {
        x = left;
        y = top;
        w = x + width;
        h = y + height
      } else {
        x = Math.min(left, x);
        y = Math.min(top, y);
        w = Math.max(left + width, w);
        h = Math.max(top + height, h);
      }
    })
    return [{
      editingF: false,
      width: w - x,
      height: h - y,
      left: x,
      top: y
    }]
  } else {
    let fm = focusModelAry[0] as GeoComModel, el;
    if (fm && fm.$el && (el = fm.$el.children[0]) && fm.parent.$el && !fm.state.isMoving()) {
      fm.listenForEleChanged()

      const sty = fm.style,
        epo = getPosition(el),
        ppo = getPosition(fm.parent.$el),
        vpo = getPosition(fm.root.$el)

      const rtn = []
      //let lyAbsF = fm.style.isLayoutAbsolute()

      const comDef = context.getComDef(fm.runtime.def)

      const editorPath = getEditorPath(void 0, fm, context)
      const titleAry = []
      if (editorPath) {
        editorPath.forEach(({title: tt, ele, model}, idx) => {
          titleAry.push(<span key={idx} onClick={evt(e => {
            model.focus()
            ele.click()
          }).stop}>{tt}</span>)
        })
      }
      titleAry.push(<span key='my' onClick={evt().stop}>{fm.runtime.title || comDef.title}</span>)

      if (fm.focusArea) {
        const comMask = {
          //title: titleAry,
          editingF: fm.state.isEditing(),
          width: el.offsetWidth * zoom,
          height: el.offsetHeight * zoom,
          left: epo.x - vpo.x,
          top: epo.y - vpo.y
        }

        rtn.push(comMask)

        fm.focusArea.listenForEleChanged()

        const {title, ele, editorPath} = fm.focusArea

        const eatitleAry = []
        if (editorPath) {
          editorPath.forEach(({model, title: tt, ele}, idx) => {
            eatitleAry.push(<span key={idx} onClick={evt(e => {
              model.focus()
              ele.click()
            }).stop}>{tt}</span>)
          })
        }
        eatitleAry.push(<span key='my' onClick={evt().stop}>{title || '区域'}</span>)

        const fepo = getPosition(ele)

        rtn.push({
          title: eatitleAry,
          width: ele.offsetWidth * zoom,
          height: ele.offsetHeight * zoom,
          left: fepo.x - vpo.x,
          top: fepo.y - vpo.y,
          shortcuts: (fm as I_Configurable).getConfigs
        } as any)
      } else {
        const comMask = {
          title: titleAry,
          editingF: fm.state.isEditing(),
          // width: (lyAbsF ? sty.width : el.clientWidth) * zoom,
          // height: (lyAbsF || fm.state.isResizing() ?
          //   (sty.height + (el.style.paddingTop ? parseInt(el.style.paddingTop) : 0)
          //     + (el.style.paddingBottom ? parseInt(el.style.paddingBottom) : 0))
          //   : el.clientHeight) * zoom,
          width: el.offsetWidth * zoom,
          height: el.offsetHeight * zoom,
          //height: sty.height * zoom,
          left: epo.x - vpo.x,
          top: epo.y - vpo.y,
          //points:lyAbsF?points:null,
          shortcuts: (fm as I_Configurable).getConfigs
        }

        rtn.push(comMask)
      }

      return rtn
    }
  }
}

function hoverBox(hoverModel, zoom) {
  let hm: GeoComModel
  if (hm = hoverModel as GeoComModel) {
    if (hm && hm.$el && hm.parent.$el && hm.root.$el && !hm.state.isFocused() && !hm.state.isMoving()
      && !hm.state.isEditing() && !hm.state.isResizing()) {
      hm.listenForEleChanged()

      const el = hm.$el.children[0] as HTMLElement
      if (el) {
        let sty = hm.style,
          epo = getPosition(el),
          vpo = getPosition(hm.root.$el)

        return {
          title: hm.runtime.title,
          width: el.offsetWidth * zoom,
          //height: (lyAbsF ? se.h : el.clientHeight),
          height: el.offsetHeight * zoom,
          left: epo.x - vpo.x,
          top: epo.y - vpo.y
        }
      }
    }
  }
}