/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import React from 'react'

import {Tooltip} from 'antd'
import RightOutlined from '@ant-design/icons/RightOutlined'
import DownOutlined from '@ant-design/icons/DownOutlined'
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined'

import css from './Catelog.less'

import {observe} from '@mybricks/rxui'
import EditContext from "./EditContext";
import {NS_Configurable} from "@sdk";

import defaultEditos from './editors'

const foldableStyle = {
  height: 18,
  overflow: 'hidden'
}

export default function EditCatelog({catelog}: { catelog: NS_Configurable.Category }) {
  const myContext = observe(EditContext, {from: 'parents'})
  const fixedGroups = []
  return (
    <div key={catelog.id}
         className={css.catelog}
         style={{display: myContext.isActiveCatelog(catelog.id) ? 'flex' : 'none'}}>
      <div className={css.scroll}>
        {
          catelog.groups && catelog.groups.map((group, idx) => {
            if (group.fixedAtBottom && group.fixedAtBottom()) {
              fixedGroups.push(group)
            } else {
              return RenderGroup(group)
            }
          })
        }
      </div>
      {
        fixedGroups.length > 0 ? (
          <div className={css.fixed}>
            {fixedGroups.map((group, idx) => RenderGroup(group))}
          </div>
        ) : null
      }
    </div>
  )
}

function RenderGroup(group: NS_Configurable.Group, isChild: boolean = false) {
  if (group.ifVisible && !group.ifVisible()) {
    return
  }
  return (
    <div key={group.id} className={`${css.group}
                     ${group.folded ? css.folded : css.unfold}
                     ${isChild ? css.child : ''}
                     ${typeof group.fixedAtBottom === 'function' && group.fixedAtBottom() ? css.fixedAtBottom : ''}`}>
      <div className={isChild || group.title ? css.groupTitle : ''}>
        {
          group.title ? (
            <div className={css.text}>
              <p dangerouslySetInnerHTML={{__html: group.title}}/>
              {(group.description && group.title) && Tip(group.description)}
            </div>
          ) : null
        }
        {isChild && group.items && group.items.length ?
          <div className={css.action}
               onClick={(e) => clickSwitch(e, group)}>
            {
              group.folded ? <RightOutlined/> : <DownOutlined/>
            }
          </div> : null}
      </div>
      <div className={css.content}>
        {
          group.items && group.items.map((item, idx) => {
              if (!item) return
              if (item instanceof NS_Configurable.Group) {
                return RenderGroup(item, isChild = true)
              } else {
                return <EditItem key={`item_${idx}`} item={item}/>
              }
            }
          )
        }
      </div>
    </div>
  )
}

function onEditError(ex, type) {
  console.error(ex)

  if (type === 'render') {
    return (
      <div className={css.error}>
        <div className={css.itemTitle}>
          编辑器发生错误:
        </div>
        <div className={css.desc}>
          {ex.message}
        </div>
      </div>
    )
  }
}

function EditItem({item}: { item: { id, type: string, title, description, options, ele, containerEle, fn } }) {
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
  } else if (item instanceof NS_Configurable.FunctionItem) {//IEEF
    setTimeout(item.fn)
  } else if (item instanceof NS_Configurable.ErrorItem) {//Error occured
    return (
      <div className={`${css.item} ${css.error}`}>
        <div className={css.itemTitle}>
          <span dangerouslySetInnerHTML={{__html: item.title}}/>
        </div>
        <div className={css.desc} dangerouslySetInnerHTML={{__html: item.description}}>
        </div>
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
    // const editMap = {
    //   'TEXT': 'EditorText',
    //   'SELECT': 'EditorSelect',
    //   'RANGE': 'EditorRange',
    //   'COLOR': 'EditorColor',
    //   'BUTTON': 'EditorButton',
    //   'CHECKBOX': 'EditorCheckbox'
    // }
    let Editor, showTitle = true

    // if (type.toUpperCase() === 'BUTTON') {
    //   showTitle = false
    // }

    const editorArgs = Object.assign({_onError_: onEditError}, item)

    if (typeof myContext.context.configs.editorLoader === 'function') {
      Editor = myContext.context.configs.editorLoader(editorArgs)
    }

    if (!Editor) {
      const defaultEditorDesc = defaultEditos(editorArgs)

      if (defaultEditorDesc) {
        showTitle = defaultEditorDesc.showTitle
        Editor = defaultEditorDesc.render()
      }
    }

    if (!Editor && typeof myContext.context.configs.editorLoader === 'function') {
      Editor = myContext.context.configs.editorLoader(editorArgs)
    }

    if (Editor && (!ifVisible || ifVisible())) {
      if (type.match(/^_.+_$/g)) {//Private
        return (
          <>
            {Editor}
          </>
        )
      } else {
        return (
          <div className={css.item}>
            {showTitle ?
              <div className={css.itemTitle}>
                <span dangerouslySetInnerHTML={{__html: item.title}}/>
                {(title && showTitle && description) && Tip(description)}
              </div> : null
            }
            {Editor}
          </div>
        )
      }
    }
  }
}

function Tip(description: string) {
  return (
    <Tooltip title={
      <span className={css.descriptionTitle}>{description}</span>
    } className={css.description}>
      <InfoCircleOutlined/>
    </Tooltip>
  )
}

function clickSwitch(e: any, group: NS_Configurable.Group): void {
  group.folded = !group.folded
}