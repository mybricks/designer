import React from 'react'
import {useObservable} from "@mybricks/rxui"
import {Select} from 'antd'
import css from './index.less'
import {isValid} from "../utils";

interface Item {
  value: any
  label: string
}

// let showOption = false
// let optionLabel = ''

interface SelectType {
  props: any
  className?: string
}

const {Option} = Select;

export default function (props): any {
  const {value, options} = props

  const model = useObservable({val: isValid(value.get()) ? value.get() : '', value}, [value])

  return (
    <div className={css.editor}>
      <Select size="small"
              value={model.val}
              onChange={val => {
                model.val = val
                model.value.set(model.val)
              }}>
        {
          Array.isArray(options) && options.map((item: Item) => (
            <Option value={item.value} key={item.value}>{item.label}</Option>
          ))
        }
      </Select>
    </div>
  )
}