import React, {useCallback} from 'react'

import {Radio} from 'antd';
import css from './index.less'
import {useObservable} from "@mybricks/rxui";
import {isValid} from "../utils";

export default function (props): any {
  const {value, options} = props
  let datasource
  if (Array.isArray(options)) {
    datasource = options
  } else {
    datasource = options || {}
  }

  const model = useObservable({val: isValid(value.get()) ? value.get() : '', value}, [value])

  const updateVal = useCallback(val => {
    model.val = val.target.value
    model.value.set(model.val)
  }, [])

  return (
    <div className={css.editor}>
      <Radio.Group
        options={datasource}
        buttonStyle={"solid"}
        onChange={updateVal}
        value={model.val}
        optionType="button"
        size="small"
      />
    </div>
  )
}