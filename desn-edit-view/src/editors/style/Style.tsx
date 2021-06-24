import css from './Style.less'
import React, {useCallback} from "react";
import {useObservable} from "@mybricks/rxui";
import {Form, InputNumber, Radio, Select} from 'antd';
import ColorEditor from "../_commons/color-editor";
//import { SketchPicker } from 'react-color'

export default function Style(props) {
  const {value, options} = props

  const opts = options || {
    fontFamily: true,
    fontSize: true,
    color: true,
    fontWeight: true,
    textAlign: true
  }

  const {Option} = Select;
  const [form] = Form.useForm()

  const ctx = useObservable(class {
    value

    colorVal

    save() {
      form.validateFields().then(values => {
        value.set(Object.assign({}, values, {color: this.colorVal}))
      }).catch(err => {
        throw err
      })
    }
  }, next => {
    const val = value.get()
    next({
      colorVal: val?.color,
      value: val || {}
    })
  })


  const fontFamily = (
    <Form.Item
      label={'字体:'}
      name={'fontFamily'}>
      <Select size={"small"} style={{width: 140}}>
        <Option value="arial,helvetica,microsoft yahei">微软雅黑</Option>
        <Option value="arial,helvetica,宋体">宋体</Option>
        <Option value="arial,helvetica,黑体">黑体</Option>
        <Option value="Helvetica">Helvetica</Option>
        <Option value="Arial">Arial</Option>
        <Option value="Verdana">Verdana</Option>
        <Option value="Tahoma">Tahoma</Option>
        <Option value="Times">Times</Option>
      </Select>
    </Form.Item>
  )

  const fontSize = (
    <Form.Item
      label={'字号:'}
      name={'fontSize'}>
      <InputNumber
        size={"small"}
        min={12}
        max={72}
        style={{width: 60}}
      />
    </Form.Item>
  )


  const color = (
    <Form.Item
      label={'颜色:'}
      name={'color'}>
      <div>
        <ColorEditor value={{
          get() {
            return ctx.colorVal
          }, set(color) {
            ctx.colorVal = color
            ctx.save()
          }
        }}/>
      </div>
    </Form.Item>
  )

  const fontWeight = (
    <Form.Item
      label={'加粗:'}
      name={'fontWeight'}>
      <Radio.Group
        options={[
          {label: '细体', value: 'lighter'},
          {label: '一般', value: 'normal'},
          {label: '粗体', value: 'bold'}
        ]}
        buttonStyle={"solid"}
        optionType="button"
        size="small"
      />
    </Form.Item>
  )

  const textAlign = (
    <Form.Item
      label={'对齐:'}
      name={'textAlign'}>
      <Radio.Group
        options={[
          {label: '左', value: 'left'},
          {label: '中', value: 'center'},
          {label: '右', value: 'right'}
        ]}
        buttonStyle={"solid"}
        optionType="button"
        size="small"
      />
    </Form.Item>
  )

  return (
    <div className={css.main}>
      <Form form={form} initialValues={ctx.value} size={"small"}
            onValuesChange={ctx.save}>
        {opts.fontFamily && fontFamily}
        {opts.fontSize && fontSize}
        {opts.color && color}
        {opts.fontWeight && fontWeight}
        {opts.textAlign && textAlign}
      </Form>
    </div>
  )

}