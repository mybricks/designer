import React, { useMemo } from 'react'
import { InputNumber } from 'antd'
import { useCallback } from "react"
import {useObservable, uuid} from "@mybricks/rxui"
import css from './index.less'

export default function(editConfig): any {
  const { value, options = [] } = editConfig
  const model = useObservable({val: Array.isArray(value.get()) ? value.get() : [0], value}, [value])
  // let resAry: any[] = deepCopy(model.val)
  
  // const update = useCallback(() => {
  //   model.val = resAry
  //   model.value.set(resAry)
  // }, [resAry])

  const update = useCallback(() => {
    model.value.set(model.val)
  }, [])

  const RenderInputNumber = useMemo(() => {
    return (
      <div>
        {options && options.length ? options?.map(({formatter = '', width = 70, ...other}, index: number) => {
          const defaultConfig = {
            min: -Infinity,
            max: Infinity,
            step: 1,
            size: 'small',
            title: ''
          } as {
            size: "small" | "middle" | "large" | undefined
          }
          const item = Object.assign(defaultConfig, other)
  
          return (
            <div key={uuid()} className={css['edit-inputnumber']}>
              <div className={css['edit-inputnumber__all']} style={{width}}>
                <div className={css['edit-inputnumber__all-title']} style={{marginTop: 5}}>{item.title || ''}</div>
                <InputNumber
                  {...item}
                  defaultValue={Array.isArray(model.val) ? (model.val[index] || 0) : (model.val || 0)}
                  formatter={evt => `${evt}${formatter}`}
                  parser={evt => evt ? evt.replace(formatter, '') : ''}
                  style={{marginTop: 5, width}}
                  onChange={evt => {
                    if (typeof evt === 'number' && evt >= item.min && evt <= item.max) {
                      model.val[index] = evt
                      update()
                    }
                  }}
                  // onBlur={update}
                />
              </div>
            </div>
          )
        }): <div>数据不合法</div>}
      </div>
    )
  }, [])

  return RenderInputNumber
}