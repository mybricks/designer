/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import {useMemo} from "react";
import {useObservable} from "@mybricks/rxui";

import BlocklyView from './BlocklyView'
import {require} from "@utils";

const ASSETS_PRE = `https://m.hellobike.com/npm/blockly@3.20200924.3`

export default function Load({options, value,closeView}
                               : { options, value: { get, set },closeView }) {
  const ctx = useObservable({BlocklyView: void 0})
  useMemo(() => {
    if (!window.Blockly) {
      loadBlockly(ASSETS_PRE + '/blockly_compressed.js',
        ASSETS_PRE + '/msg/zh-hans.js',
        ASSETS_PRE + '/blocks_compressed.js',
        ASSETS_PRE + '/javascript_compressed.js')
        .then(Blockly => {
          let styleSheets = document.styleSheets
          const styleSheet = [].find.call(styleSheets, (stylesheet: CSSStyleSheet) => {
            return stylesheet.ownerNode && stylesheet.ownerNode.nodeName.toLowerCase() === 'style'
          })

          styleSheet.addRule(`.blocklyFlyout`, 'border-right:1px solid #DDD !important;')
          styleSheet.addRule(`.blocklyFlyout >path`, 'fill-opacity:0.5;')
          styleSheet.addRule(`.blocklyScrollbarHorizontal,.blocklyScrollbarVertical`, 'fill-opacity:0.01;')
          styleSheet.addRule(`.blocklyMainBackground`, `stroke-width:0px !important;`)

          ctx.BlocklyView = BlocklyView
        })
    } else {
      ctx.BlocklyView = BlocklyView
    }
  }, [])

  if (ctx.BlocklyView) {
    return <ctx.BlocklyView options={options} value={value} closeView={closeView}/>
  }
}

function loadBlockly(...srcs) {
  return new Promise((resolve => {
    const load = () => {
      if (srcs.length > 0) {
        const src = srcs.shift()
        require([src], () => {
          load()
        })
      } else {
        //__WEBPACK_EXTERNAL_MODULE_blockly__ = window.Blockly
        resolve(window.Blockly)
      }
    }
    load()
  }))
}