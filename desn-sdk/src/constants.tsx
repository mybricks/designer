/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import Icon from "./Icon";

export const ICON_COM_DEFAULT = `https://ss2.baidu.com/6ON1bjeh1BF3odCf/it/u=1653910386,2069326335&fm=15&gp=0.jpg`
export namespace NS_XGraphComLib {
  export const id = 'xg-comlib'
  export const coms = {
    dialog: 'xgraph.coms.dialog',
    module: 'xgraph.coms.module',
    moduleJoiner: 'xgraph.coms.moduleJoiner',
    dialogInputs: 'xgraph.coms.dialogInputs',
    dialogProxy: 'xgraph.coms.dialogProxy'
  }
}

export namespace NS_EditorsDefault {
  export const TEXT = 'TEXT'
  export const INPUTNUMBER = 'INPUTNUMBER'
  export const BUTTON = 'BUTTON'
  export const TEXTAREA = 'TEXTAREA'
  export const RADIO = 'RADIO'
  export const SLIDER = 'SLIDER'
  export const SELECT = 'SELECT'
  export const SWITCH = 'SWITCH'

  export const COLORPICKER = 'COLORPICKER'

  export const SCRATCH = 'SCRATCH'
  export const _TEXT_ = '_TEXT_'
  export const RESIZER = '_RESIZER_'
  export const RESIZERH = '_RESIZERH_'
  export const RESIZERV = '_RESIZERV_'
  export const SERVICESELECT = 'SERVICESELECT'

  export const TREESELECT = 'TREESELECT'

  export const TABLE = 'TABLE'

  export const STYLE = 'STYLE'
}

export namespace NS_Icons {
  export function config(args) {
    return <Icon {...args}>&#xe6ba;</Icon>
  }

  export function event(args) {
    return <Icon {...args}>&#xe620;</Icon>
  }
}

export const SerializeNS = `xg.desn.sdk.`