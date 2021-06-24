import {init as initVarUnknow} from './var_unknow'

import var_set from "./var_set";

import input_start from "./input_start";
import input_return from "./input_return";

import {create} from './configFactory'
import BlocklyContext from "../BlocklyContext";

export default function initBlocks(wsCtx: BlocklyContext) {
  initVarUnknow()

  defineBlock(wsCtx, input_return)
  defineBlock(wsCtx, input_start)
  defineBlock(wsCtx, var_set)

  const blockNameAry = []

  let defAry: { name?, blockAry }[] = [
    // {
    //   name: '返回数据',
    //   blockAry: [input_start, var_set]
    // }
  ]

  if (wsCtx.blocksDef) {
    defAry = defAry.concat(wsCtx.blocksDef as any)
  }

  defAry.forEach(({name, blockAry}) => {
    const ary = []
    blockAry.forEach(def => {
      if (typeof def === 'string') {
        ary.push({name: def})
      } else {
        ary.push(defineBlock(wsCtx, def as any))
      }
    })
    blockNameAry.push({
      name,
      blockAry: ary
    })
  })

  return blockNameAry
}

type BlockDef = {
  name: string,
  title: string,
  showInToolbox?: boolean,
  data: {},
  render
  editors: []
}

function defineBlock(wsCtx: BlocklyContext, def: BlockDef) {
  Blockly.JavaScript[def.name] = function (block) {
    return def.to('js', block, block._data, {
      logDebug: wsCtx.logDebug,
      curFn: wsCtx.curFn,
      getEnvVarScript(varName, ...args) {
        return wsCtx.getEnvVarScript(varName, args)
      }
    })
  }

  Blockly.Blocks[def.name] = {
    _data: void 0,
    _refresh: void 0,
    _rootBlock:def.root,
    init: function () {
      if (!this._data) {
        this._data = proxyData(JSON.parse(JSON.stringify(def.data)), () => {
          if (this._refresh) {
            this._refresh()
          }
        })
      }
      this._refresh = def.render(
        this,//Renderer
        this._data,//Data
        {//Context
          //getInputAry: wsCtx.getInputAry,
          getOutputAry: wsCtx.getCurOutputs,
          getCurVarAry: wsCtx.getCurVars,
          curFn: wsCtx.curFn,
          createBlock: wsCtx.createBlock
        })
      if (this._refresh === void 0 || this._refresh === null) {
        this._refresh = () => {
        }
      } else if (typeof this._refresh !== 'function') {
        throw new Error(`Invalid render type(should return undefined or function for rerender)`)
      }
    },
    _getConfig() {
      if (def.editors) {
        const th = this
        return create(th, def.title, def.editors, {
          data: th._data,
          curFn: wsCtx.curFn,
          refresh: () => this._refresh,
          logs:wsCtx.logs
        })
      }
    },
    mutationToDom: function (workspace) {
      const container = Blockly.utils.xml.createElement('mutation');
      if (!this.isInFlyout) {
        container.setAttribute('data-def', JSON.stringify(this._data))
      }
      return container;
    },
    domToMutation: function (dom) {
      const _data = dom.getAttribute('data-def')
      if (_data) {
        const data = JSON.parse(_data)
        for (let key in data) {
          this._data[key] = data[key]
        }
      }
    }
  }
  return {name: def.name, showInToolbox: def.showInToolbox}
}

function proxyData(data, refresh) {
  const proxy = obj => {
    return new Proxy(
      obj, {
        has(target, key) {
          if (key == '_is_data_proxy_') {
            return true;
          }
          return key in target;
        },
        get(target, prop, receiver) {
          if (prop === 'toString'
            || prop === 'valueOf'
            || prop === '$$typeof'
            || prop === 'constructor'
            || prop === '__@mybricks/rxui__'
            || isSymbol(prop)) {
            return target[prop]
          }

          const rst = target[prop]
          if (rst !== undefined && rst !== null
            && typeof (rst) == 'object'
            && typeof (rst) !== 'function'
            && !('_is_data_proxy_' in rst)) {
            return proxy(rst)
          }
          return rst;
        },
        set(target: object, propKey: string, value, receiver) {
          if (value !== target[propKey]) {
            target[propKey] = value
            refresh()
          }
          return true
        }
      }
    )
  }
  return proxy(data)
}

function isSymbol(value) {
  return (
    typeof value === "symbol" ||
    (isObjectLike(value) && Object.prototype.toString.call(value) === "[object Symbol]")
  )
}

function isObjectLike(value) {
  return typeof value == "object" && value !== null
}