import React, {useCallback} from 'react'
import {Switch} from 'antd'
import {useObservable} from "@mybricks/rxui"
import {isValid} from '../utils'
import css from './index.less'

export default function FN(props): any {
  const {value, options} = props
  const {readonly = false} = options || {}

  const model = useObservable({val: isValid(value.get()) ? value.get() : false, value}, [value])

  const onChange = useCallback(() => {
    model.val = !model.val
    model.value.set(model.val)
  }, [])

  return (
    <div className={css['editor-switch']}>
      <Switch
        disabled={readonly}
        checked={model.val}
        size="small"
        onChange={onChange}
      />
    </div>
  )
}