import React from 'react'
import {isValid} from '../utils'
import {useCallback, useEffect} from 'react'
import {useComputed, useObservable} from '@mybricks/rxui'

import css from './index.less'

export default function (editConfig): any {
  const {value, options = {}} = editConfig
  const {readonly = false, type = 'text', ...other} = options
  const model: any = useObservable({value})

  useComputed(() => {
    const val = value.get()
    model.val = isValid(val) ? val : ''
  })

  const updateVal = useCallback(() => {
    model.value.set(model.val)
  }, [])

  useEffect(() => {
    return () => {
      const val = value.get()
      if (model.val && val && model.val !== val) {
        updateVal()
      }
    }
  }, [])

  return (
    <div className={css['editor-text']}>
      <input
        type={type}
        className={`${css['editor-text__input']}${readonly ? ` ${css['editor-text__inputdisabled']}` : ''}`}
        value={model.val}
        disabled={readonly}
        onChange={evt => {
          model.val = evt.target.value
        }}
        onKeyPress={evt => {
          if (evt.key !== 'Enter') return
          updateVal()
        }}
        onBlur={() => {
          updateVal()
        }}
        {...other}
      />
    </div>
  )
}