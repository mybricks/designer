/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import Text from './text'
import InputNumber from './inputNumber'
import Button from './button'
import Textarea from './textarea'
import Select from './select'
import Switch from './switch'
import Slider from './slider'
import Radio from './radio'

import ColorPicker from './colorpicker'

import Scratch from "./scratch";
import _Text_ from "./_text";
import Resizer from "./_resizer/Resizer";
import ResizerHV from "./_resizer/ResizerHV";
import ServiceSelect from './_serviceSelect_'

import TreeSelect from './treeSelect'
import Table from './table'

import Style from './style'
import {NS_EditorsDefault} from "@sdk";

const editors = {}

reg(NS_EditorsDefault.TEXT, Text)
reg(NS_EditorsDefault.INPUTNUMBER, InputNumber)
reg(NS_EditorsDefault.BUTTON, Button)
reg(NS_EditorsDefault.TEXTAREA, Textarea)
reg(NS_EditorsDefault.SELECT, Select)
reg(NS_EditorsDefault.SWITCH, Switch)
reg(NS_EditorsDefault.SLIDER, Slider)
reg(NS_EditorsDefault.RADIO, Radio)

reg(NS_EditorsDefault.COLORPICKER, ColorPicker)

reg(NS_EditorsDefault.SCRATCH, Scratch)
reg(NS_EditorsDefault._TEXT_, _Text_)
reg(NS_EditorsDefault.RESIZER, Resizer)
reg(NS_EditorsDefault.RESIZERH, ResizerHV)
reg(NS_EditorsDefault.RESIZERV, ResizerHV)
reg(NS_EditorsDefault.SERVICESELECT, ServiceSelect)

reg(NS_EditorsDefault.TREESELECT, TreeSelect)
reg(NS_EditorsDefault.TABLE, Table)
reg(NS_EditorsDefault.STYLE, Style)

function reg(type, Editor) {
  editors[type] = function (arg) {
    const {type, options, ele} = arg
    const st = Editor.showTitle
    return {
      render() {
        return <Editor {...arg}/>
      },
      showTitle: typeof st === 'function' ?
        st(arg) : (st === void 0 ? true : st)
    }
  }
}

export default function (arg) {
  const {type, options, ele} = arg

  const editor = editors[(type as string).toUpperCase()]
  if (editor) {
    return editor(arg)
  } else {
    console.warn(`Editor type ${type} not found.`)
  }

}