/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {NS_EditorsDefault} from "@sdk";

import Button from './button'

export default function (arg) {
  const {type, ele} = arg

  if (type.toUpperCase() === NS_EditorsDefault.BUTTON) {
    return {
      render() {
        return <Button {...arg}/>
      },
      showTitle: false
    }
  }
}