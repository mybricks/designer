import {MaskContext} from "./index";
import {DesignerContext, NS_Configurable} from "@sdk";
import {observe, useObservable} from "@mybricks/rxui";
import css from "./Shortcuts.less";
import React from "react";
import EditContext from "./EditContext";
import defaultEditors from './editors'
import {createPortal} from "react-dom";

export default function Shortcuts({ctx}: { ctx: MaskContext }) {
  const context = observe(DesignerContext, {from: 'parents'})
  useObservable(EditContext, next => next({
    context
  }), {to: 'children'})

  if (ctx.shortcuts) {
    const {x, y, fn} = ctx.shortcuts
    const catelogs = fn(true)

    return createPortal(
      <div className={css.bg}>
        <EditCatelog catelog={catelogs[0]} x={x} y={y}/>
      </div>
      , document.body)
  }
}

function EditCatelog({catelog, x, y}: { catelog: NS_Configurable.Category, x: number, y: number }) {
  observe(EditContext, {from: 'parents'})

  const items = []

  if (catelog.groups) {
    catelog.groups.map((group, idx) => {
      if (group.items && group.items.length > 0) {
        const ct = RenderGroup(group)
        if (ct) {
          items.push(ct)
        }
      }
    })
  }

  return (
    <div key={catelog.id}
         className={css.catelog} style={{left: x, top: y}}>
      <div className={css.scroll}>
        {
          items.length > 0 ? items :
            (
              <div className={css.empty}>没有事件定义</div>
            )
        }
      </div>
    </div>
  )
}

function RenderGroup(group: NS_Configurable.Group, isChild: boolean = false) {
  if (group.ifVisible && !group.ifVisible()) {
    return
  }

  const ct = []

  group.items.forEach((item, idx) => {
      if (item instanceof NS_Configurable.Group) {
        const tct = RenderGroup(item, isChild = true)
        if (tct) {
          ct.push(tct)
        }
      } else {
        ct.push(<EditItem key={`item_${idx}`} item={item}/>)
      }
    }
  )
  if (ct.length > 0) {
    return (
      <div key={group.id} className={`${css.group}
                     ${isChild ? css.child : ''}
                     ${typeof group.fixedAtBottom === 'function' && group.fixedAtBottom() ? css.fixedAtBottom : ''}`}>
        <div className={isChild || group.title ? css.title : ''}>
          <div className={css.titlename}>
            <p dangerouslySetInnerHTML={{__html: group.title}}/>
            {(group.description && group.title) && Tip(group.description)}
          </div>
          {isChild && group.items && group.items.length ?
            <div className={css.action}
                 onClick={(e) => clickSwitch(e, 38)}>收起</div> : <></>}
        </div>
        <div className={css.groupContent}>
          {ct}
        </div>
      </div>
    )
  }
}

function EditItem({item}: { item: { id, type: string, title, options, ele, containerEle, fn } }) {
  const myContext = observe(EditContext, {from: 'parents'})

  if (typeof item === 'function') {
    return (
      <div className={css.item}>
        {item()}
      </div>
    )
  } else if (item instanceof NS_Configurable.RenderItem) {
    return (
      <div className={css.item}>
        {typeof item.content === 'function' ? (
          <item.content/>
        ) : item.content}
      </div>
    )
  } else {
    const {
      description,
      title,
      type,
      value,
      options,
      ifVisible,
      ele
    } = item

    let Editor, showTitle = true

    const defaultEditorDesc = defaultEditors(item)

    if (defaultEditorDesc) {
      showTitle = defaultEditorDesc.showTitle
      Editor = defaultEditorDesc.render()
    }

    if (!Editor && typeof myContext.context.configs.editorLoader === 'function') {
      Editor = myContext.context.configs.editorLoader({
        type, title, value, options
      })
    }

    if (Editor && (!ifVisible || ifVisible())) {
      let foldable: boolean = false
      if (options && options.foldable) {
        foldable = true
      }
      return (
        <div className={css.item} style={foldable ? foldableStyle : {}}>
          {showTitle ?
            <div className={foldable ? css.foldable : ''}>
              <p className={css.foldabletitle}>
                <span dangerouslySetInnerHTML={{__html: item.title}}/>
                {(title && showTitle && description) && Tip(description)}
              </p>
              {foldable && <div className={css.foldableaction} onClick={(e) => clickSwitch(e, 18)}>展开</div>}
            </div> : null}
          {Editor}
        </div>
      )
    }
  }
}

function Tip(description: string) {
  // return (
  //   <Tooltip title={
  //     <span className={css.descriptionTitle}>{description}</span>
  //   } className={css.description}>
  //     <InfoCircleOutlined/>
  //   </Tooltip>
  // )
}

// TODO
function clickSwitch(e: any, height: any = false): void {
  let groupContainer = e.target.parentElement.parentElement
  if (e.target.innerText === '展开') {
    e.target.innerText = '收起'
    // groupContainer.style.height = `${groupContainer.scrollHeight}px`
    groupContainer.style.height = '100%'
    groupContainer.style.overflow = 'initial'
  } else {
    e.target.innerText = '展开'
    groupContainer.style.height = `${height}px`
    groupContainer.style.overflow = 'hidden'
  }
}