import React from 'react'

import css from './index.less'

import {Tree} from 'antd'

export default function TreeSelector(props): any {
  const {value, options} = props

  return (
    <div className={css.selector}>
      <Tree
        autoExpandParent
        showIcon={true}
        blockNode={true}
        // checkable
        // disableCheckbox
        defaultSelectedKeys={[value.get()]}
        onSelect={(keys) => {
          value.set(keys[0])
        }}
        treeData={options.datasource}
      />
    </div>
  )
}