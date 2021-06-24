import React, {useCallback} from 'react'

import css from './index.less'

import {TreeSelect} from 'antd';

export default function TreeSelector(props): any {
  const {value, options} = props

  if (!options) {
    throw new Error(`options not found.`)
  }
  if (typeof options.datasource !== 'object') {
    throw new Error(`options.datasource not found.`)
  }
  const ds = options.datasource

  const fn = item => {
    if (item.id) {
      item.value = item.id
    }
    item.children?.map(fn)
  }

  ds.map(fn)

  const searchInDS = (function () {
    let sid, rtn
    const sfn = item => {
      if (item.id === sid) {
        return rtn = item
      }
      if (item.children) {
        return item.children.find(sfn)
      }
    }

    return id => {
      sid = id
      ds.find(sfn)
      return rtn
    }
  })()

  const now = value.get()

  return (
    <div className={css.editor}>
      <TreeSelect
        //showSearch
        // multiple={false}
        // treeCheckable={true}
        size={"small"}
        style={{width: '100%'}}
        value={now && now.id}
        dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
        treeDefaultExpandAll
        onChange={val => {
          const item = searchInDS(val)
          value.set(item)
        }}
        treeData={ds}
      />
    </div>
  )
}