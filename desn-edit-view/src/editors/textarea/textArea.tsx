import { useObservable } from "@mybricks/rxui"
import React, { useCallback, useEffect } from 'react'
import { isValid } from '../utils'
import { Input } from 'antd'

const { TextArea } = Input
import css from './index.less'

export default function(props): any {
  const { value, options } = props
  const { readonly = false, minRows = 4, maxRows = 16 } = options||{}
  const model = useObservable({val: isValid(value.get()) ? value.get() : '', value}, [value])
  
  const updateVal = useCallback(() => {
    model.value.set(model.val)
  }, [])

  useEffect(() => {
    return () => {
      if (model.val && value.get() && model.val !== value.get()) {
        updateVal()
      }
    }
  }, [])

  return (
    <div className={css['editor-text']}>
      <TextArea
        disabled={readonly}
        defaultValue={model.val}
        onChange={evt => {
          model.val = evt.target.value
        }} 
        onKeyPress={evt => {
          if (evt.key !== 'Enter') return
          // if (evt.which !== 13) return
          updateVal()
        }}
        onBlur={() => {
          updateVal()
        }}
        autoSize={{ minRows, maxRows }}
      />
    </div>
  )
}