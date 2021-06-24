import React from 'react'
import {useObservable} from "@mybricks/rxui"
import {useCallback} from 'react'
import {isValid} from '../utils'
import {
  Slider,
  InputNumber,
  Row,
  Col
} from 'antd'

import css from './index.less'

export default function (props): any {
  const {value, options} = props
  const model = useObservable({val: isValid(value.get()) ? value.get() : 0, value}, [value])

  const {
    min,
    max,
    step,
    formatter,
    readonly
  } = Object.assign({
    min: 0,
    max: 100,
    step: 1,
    formatter: '',
    readonly: false
  }, options)


  const updateVal = useCallback((evt: any) => {
    if (typeof evt !== 'number') return
    const v = Number(evt) || 0

    if (v >= min && v <= max) {
      model.val = v
    } else if (v > max) {
      model.val = max
    } else {
      model.val = min
    }
  }, [])

  const setVal = useCallback(() => {
    model.value.set(model.val)
  }, [])

  return (
    !readonly ? <Row className={css['editor-slider']}>
      <Col span={16}>
        <Slider
          min={min}
          max={max}
          step={step}
          tipFormatter={null}
          value={model.val}
          onChange={updateVal}
          onAfterChange={setVal}
        />
      </Col>
      <Col span={6}>
        <InputNumber
          min={min}
          max={max}
          step={step}
          size='small'
          className={css['editor-slider__input']}
          value={model.val}
          onChange={updateVal}
        />
      </Col>
      <Col span={2}>
        <span style={{paddingLeft: 5}}>{formatter}</span>
      </Col>
    </Row> : <div>{`${model.val}${formatter}`}</div>
  )
}