import css from './Console.less'

import {Fragment} from 'react'

import {dragable, observe, useComputed, useObservable, evt} from "@mybricks/rxui";
import {dateFormat} from "./util";
import BlocklyContext from "./BlocklyContext";
import {getPosition} from "@utils";

class Ctx {
  ele: HTMLElement

  height: number = 200

  varTitle: string
  varName: string

  inputVal: any
  returnVal: any

  outputAry: {
    title: string,
    hostId: string,
    val: any
  }[]

  onResize: () => {}

  setOutputVal(hostId: string, val: any) {
    if (this.outputAry) {
      const out = this.outputAry.find(out => out.hostId === hostId)
      if (out) {
        out.val = val
      }
    }
  }
}

export default function Console({onResize}) {
  const wsCtx = observe(BlocklyContext, {from: 'parents'})

  const myCtx = useObservable(Ctx, next => {
    const outputAry = []

    const outPinAry = wsCtx.getCurOutputs()
    if (outPinAry) {
      outPinAry.forEach(pin => {
        outputAry.push({
          title: pin.title,
          id: pin.id,
          val: void 0
        })
      })
    }

    next({
      onResize,
      varName: wsCtx.curFn.id,
      outputAry
    })
  }, [wsCtx.curFn.id])

  const Debug = useObservable({logs: wsCtx._logs}, [wsCtx._logs.length])

  const inputs = useComputed(() => {
    return (
      <>
        {
          !wsCtx.curFn.input ? ('') : (
            <>
              <div className={css.var}>
                {myCtx.varName}<span> 输入:</span>
              </div>
              <div className={css.value}>
                <textarea value={myCtx.inputVal} onChange={e => {
                  myCtx.inputVal = e.target.value
                }}/>
              </div>
            </>
          )
        }
      </>
    )
  })

  const outputs = useComputed(() => {
    return (
      <>
        <div className={css.var}>
          <span>返回:</span>
        </div>
        <p className={css.value} style={{marginTop: 10}}>
          {stringfy(myCtx.returnVal)}
        </p>
        {
          myCtx.outputAry && (
            myCtx.outputAry.map((out, idx) => {
              return (
                <Fragment key={idx}>
                  <div className={css.var}>
                    <span>{out.title}:</span>
                  </div>
                  <p className={css.value}>
                    {stringfy(out.val)}
                  </p>
                </Fragment>
              )
            })
          )
        }
      </>
    )
  })

  return (
    <>
      <div className={css.sperH}
           onMouseDown={evt(moveConsole).stop}
           onClick={evt().stop}/>
      <div className={css.console}
           style={{height: myCtx.height}}
           ref={ele => ele && (myCtx.ele = ele)}
           onClick={evt().stop}>
        <div className={css.title}>
          <span className={css.tt}>
              控制台
          </span>
          <button onClick={e => debug(Debug)}>调试</button>
          <button onClick={e => clear(Debug)} style={{marginLeft: 'auto'}}>清空</button>
        </div>
        <div className={css.main}>
          <div className={css.configs}>
            <div className={css.inputs}>
              {inputs}
            </div>
            <div className={css.outputs}>
              {outputs}
            </div>
          </div>
          <div className={css.exeResult}>
            {
              Debug.logs.map((item, idx) => {
                return (
                  <p className={`${css.log}`} key={'log-' + idx}>
                    <span className={css.time}>[{dateFormat('yyyy-MM-dd HH:mm:ss')}]</span>
                    <span className={css.content} dangerouslySetInnerHTML={{__html: stringfy(item.content)}}/>
                  </p>
                )
              })
            }
          </div>
        </div>
      </div>
    </>
  )
}

function moveConsole(evt) {
  const ctx = observe(Ctx)

  let {x, y, w, h} = getPosition(ctx.ele);

  dragable(evt, ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
    if (state == 'moving') {
      if(h-dy>30){
        ctx.height = h -= dy
        ctx.onResize()
      }
    }
    if (state == 'finish') {
    }
  })
}

function clear(Debug) {
  const myCtx = observe(Ctx)
  const wsCtx = observe(BlocklyContext)

  //myCtx.inputVal = void 0
  myCtx.returnVal = void 0
  wsCtx.clearLogs()

  //Debug.logs = []
}

function debug(Debug) {
  clear(Debug)

  const wsCtx = observe(BlocklyContext)

  const {getEnvVarDebugValue} = wsCtx

  const myCtx = observe(Ctx)

  const {setOutputVal} = myCtx

  wsCtx.mode = 'debug'

  const logFn = (content, style?) => {
    Debug.logs.push({content, style})
  }

  logFn('开始编译...')
  const ary = [
    `
      function _debugLog(contentAry,style){
        const content = contentAry.map(ct=>ct).join(' ')
        Debug.logs.push({content:content,style:style})
      }
    `
  ]

  ary.push(`const ${myCtx.varName}=function(fn){
      fn(eval(\`(()=>{return ${myCtx.inputVal}})()\`),function(returnVal){
        myCtx.returnVal = returnVal
      })
    }`)

  const outPinAry = wsCtx.getCurOutputs()
  if (outPinAry) {
    outPinAry.forEach(pin => {
      ary.push(`const ${pin.id}=function(val){
        setOutputVal('${pin.id}',val)
    }`)
    })
  }

  ary.push(`
    var _envVars_ = {
      getUserToken(){
        return '${getEnvVarDebugValue('userToken')}';
      },
      getEnvType(){
        return '${getEnvVarDebugValue('envType')}';
      },
      getEnvParam(name){
        var envParams = '${getEnvVarDebugValue('envParams')}'
        var all = envParams!==''?JSON.parse(envParams):void 0;
        return typeof(all)==='object'?all[name]:undefined;
      }
    }
  `)


  ary.push(Blockly['JavaScript'].workspaceToCode(wsCtx.workspace))

  const script = ary.join('\n')

  logFn('编译完成,执行以下脚本:')
  logFn(script.replace(/\n/gi, '<br/>'))

  eval(script)
}

function stringfy(val) {
  try {
    return JSON.stringify(val)
  } catch (ex) {
    return `打印结果发生错误.\n` + ex
  }
}