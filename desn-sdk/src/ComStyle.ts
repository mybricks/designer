/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {clone, Serializable} from '@mybricks/rxui'
import {SerializeNS} from "./constants";

@Serializable(SerializeNS + 'ComStyle')
export default class ComStyle {
  display: 'block' | 'inline-block' | 'none' = 'block'

  position: 'relative' | 'absolute' | 'fixed'

  layout: 'auto' | 'static' = 'auto'

  top: number

  right: number

  bottom: number

  left: number

  width: number | string

  height: number | string

  zIndex: number

  zoom: number

  marginTop: number

  marginRight: number

  marginBottom: number

  marginLeft: number


  toCSS() {
    return {
      width: this.width,
      display: this.display,
      paddingTop: this.marginTop,
      paddingRight: this.marginRight,
      paddingBottom: this.marginBottom,
      paddingLeft: this.marginLeft
    }
  }

  isVisible() {
    return this.display && (this.display === 'block' || this.display === 'inline-block')
  }

  isLayoutAbsolute() {
    return this.position?.toLowerCase() == 'absolute'
  }

  isLayoutFixed() {
    return this.position?.toLowerCase() == 'fixed'
  }

  isLayoutAbsoluteOrFixed() {
    return this.position?.toLowerCase() == 'absolute' || this.position?.toLowerCase() == 'fixed'
  }

  isLayoutStatic() {
    return this.layout && this.layout.toLowerCase() == 'static'
  }

  setLayout(val: 'auto' | 'static') {
    if (typeof val === 'string' && val.match(/auto|static/gi)) {
      this.layout = val.toLowerCase() as any
    }
  }

  clone() {
    const rtn = new ComStyle()
    for (const name in this) {
      rtn[name] = this[name]
    }
    const obj = clone(this)
    Object.assign(rtn, obj)

    return rtn
  }
}