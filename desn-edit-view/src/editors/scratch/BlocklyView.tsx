/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './BlocklyView.less'

import {dragable, evt, observe, useComputed, useObservable} from "@mybricks/rxui";
import {initConfig} from "./init";
import {useCallback, useEffect, useMemo} from "react";

import Console from './Console'

import {DesignerContext, NS_Emits} from "@sdk";
import {BLOCK_TYPE_INPUT_START} from "./constants";

import BlocklyContext from './BlocklyContext'
import {antiShaking, getPosition} from "@utils";

export default function BlocklyView({options, value, closeView}:
                                      { options: { title, blocks, startBlocks }, value: { get, set }, closeView }) {
  const emitItem = useObservable(NS_Emits.Component, {expectTo: 'parents'})
  const desnCtx = observe(DesignerContext, {from: 'parents'})

  const ctx = useObservable(BlocklyContext, next => {
    const fns = value.get()

    let curFn
    if (Array.isArray(fns)) {
      if (fns.length > 0) {
        curFn = fns[0]
      }
    }

    const extBlocks = options.blocks
    const startBlocks = options.startBlocks
    next({
      _designerContext: desnCtx,
      startBlocks,
      blocksDef: extBlocks,
      value,
      fns,
      curFn,
      closeView
    })
  }, {ignore: ['workspace'], to: "children"})

  const resize = useCallback(() => {
    Blockly.svgResize(ctx.workspace);
  }, [])

  useEffect(() => {
    const wsCfg = initConfig(ctx)
    ctx.workspace = Blockly.inject('_workspace_', wsCfg)

    setTimeout(() => {
      resize()
      ctx.workspace.addChangeListener(wsEvent);
    })

    const AS = antiShaking()

    function wsEvent(primaryEvent) {
      if (primaryEvent instanceof Blockly.Events.Ui) {
        if (primaryEvent.blockId) {
          const block = ctx.workspace.getBlockById(primaryEvent.blockId)

          emitItem.focus({
            getConfigs() {
              return block && block._getConfig ? block._getConfig() : void 0
            }
          })
        }
      } else {
        if (primaryEvent.type === 'var_create') {
          ctx.addVar(primaryEvent.varName)
        } else if (primaryEvent.type === 'create') {

        }

        const topBlocks = ctx.workspace.getTopBlocks()
        const topIds = {}
        if (topBlocks) {
          topBlocks.forEach(block => {
            topIds[block.id] = true
            if (!block._rootBlock) {
              block.setEnabled(false)
            }
          })
        }
        ctx.workspace.getAllBlocks().forEach(block => {
          if (!topIds[block.id]) {
            if (!block.isEnabled()) {
              block.setEnabled(true)
            }
          }
        })

        AS.push(() => {
          save(ctx)
        })
      }
    }

    //Check if editor size changed
    document.querySelector('#_iframe_').contentWindow.addEventListener('resize', () => {
      console.log('size Change！');
      resize()
    }, false)

    //Blockly.Variables.createVariableButtonHandler(workspace, null, 'panda');
    switchFn(ctx, ctx.curFn)

    globalClick()
  }, [])

  const fnMenu = useMemo(() => {
    const rtn = []
    try {
      ctx.getFns().forEach((fn, idx) => {
        const title = fn.title + `${fn.input ? '(' + fn.input + ')' : ''}`
        rtn.push(<div key={'input-' + idx} className={css.item}
                      onClick={e => {
                        if (ctx.curFn.id !== fn.id) {
                          switchFn(ctx, fn)
                        }
                      }}>{title}</div>)
      })
    } catch (ex) {
      console.error(ex)
    }
    return rtn
  }, [])

  const menuStyle = useComputed(() => {
    if (ctx.showMenu) {
      return {
        display: 'block'
      }
    } else {
      return {
        display: 'none'
      }
    }
  })

  const vars = useComputed(() => {
    const varAry = ctx.getCurVars()
    if (varAry) {
      const rtn = []
      varAry.forEach((varModel, idx) => {
        rtn.push(<div className={css.var} key={'-' + idx}
                      onMouseDown={e => moveVar(e, varModel.name)}>{varModel.name}</div>)
      })
      return rtn
    }
  })

  const globalClick = useCallback(() => {
    ctx.showMenu = false
    emitItem.blur()
  }, [])

  return (
    <div className={css.workspace} onClick={globalClick}>
      <div className={css.titleBar}>
        {/*<i>*/}
        {/*  当:*/}
        {/*</i>*/}
        {/*<span className={css.sper}/>*/}
        <p className={css.inputTitle}
           onClick={evt(e => ctx.showMenu = true).stop}>
          {ctx.curFn.title}
        </p>
        <div className={css.menu} style={menuStyle}>{fnMenu}</div>
        <span className={css.sper}/>
        {/*<i>到达</i>*/}
        <p className={css.comTitle}>
          {options.title || '未知组件'}
        </p>
        <button className={css.btnClose} onClick={close}>关闭</button>
      </div>
      <div id='_workspace_' className={css.main}/>
      <Console onResize={resize}/>
      <div className={css.vars}>
        <div className={css.tt}>
          变量
          <div className={`${css.var} ${css.varAdd}`} onClick={e => createVar()}>新建</div>
        </div>
        <div className={css.varsList}>
          {vars}
        </div>
        {/*<div className={`${css.var} ${css.varAdd}`} onClick={e => setVar()}>变量赋值</div>*/}
      </div>
      <iframe id='_iframe_' style={{width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, zIndex: -1}}/>
    </div>
  )
}

function close() {
  const ctx = observe(BlocklyContext)
  const {value, closeView, getFns} = ctx

  save(ctx)

  ctx.workspace.dispose()

  closeView()
}

function setVar() {
  const {workspace} = observe(BlocklyContext)
  const containerBlock = workspace.newBlock('xg.var_set');

  containerBlock.initSvg();
  containerBlock.render()
  containerBlock.moveBy(20, 20);
}

function moveVar(evt, varName) {
  const {createBlock} = observe(BlocklyContext)

  let varBlock
  dragable(evt, ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
    if (state === 'moving') {
      if (!varBlock) {
        varBlock = createBlock('variables_get', {name: varName})
        const tpo = getPosition(document.querySelector('.blocklyBlockCanvas'))
        const tx = (x - tpo.x) / 0.70
        const ty = (y - tpo.y) / 0.70
        varBlock.moveBy(tx, ty)

        // Blockly.Events.fire(new Blockly.Events.Ui(varBlock));
        //
        // //Blockly.Events.fire(new Blockly.Events.BlockChange(th, 'params', 'params', true, false))
        //
      }
      if (varBlock) {
        varBlock.moveBy(dx / 0.7, dy / 0.7)
      }
    }
  })
}

function createVar() {
  const {addVar, model, workspace, createBlock} = observe(BlocklyContext)
  const varName = window.prompt("创建新的变量", "")
  if (!varName) {
    return
  }
  addVar(varName)
}

function switchFn(ctx: BlocklyContext, toFn) {
  const {curFn, workspace, getCurXml, setCurXml, setCurScript} = ctx

  function domToWS() {
    let curXml = getCurXml()

    if (curXml) {
      const dom: Element = Blockly.Xml.textToDom(curXml)
      Blockly.Xml.domToWorkspace(dom, workspace)
    }
  }

  if (curFn.id === toFn.id) {
    domToWS()
  } else {
    saveCurWS(ctx)

    Blockly.mainWorkspace.clear();

    ctx.setCurFn(toFn)

    const oriTree = workspace.options.languageTree
    workspace.updateToolbox(oriTree);

    domToWS()
  }

  const varAry = ctx.getCurVars()
  if (!varAry) {
    if (ctx.curFn.input) {
      workspace.createVariable(ctx.curFn.input)
    }

    const varAry = []
    const varModelList = ctx.workspace.getAllVariables()
    varModelList.forEach(({id, name, type}) => {
      varAry.push({id, name, type})
    })
    ctx.setCurVars(varAry)
  } else {
    varAry.forEach(varModel => {
      if (!workspace.getVariable(varModel.name)) {
        workspace.createVariable(varModel.name)
      }
    })
  }

  const topBlocks = workspace.getTopBlocks()
  if (topBlocks) {
    const startId = ctx.startBlocks && ctx.startBlocks[curFn.id] || BLOCK_TYPE_INPUT_START

    // topBlocks.forEach(block=>{
    //   block.setDeletable(true)
    // })

    if (!topBlocks.find(block => {
      return block.type === startId
    })) {
      const containerBlock = workspace.newBlock(startId);

      containerBlock.initSvg();
      containerBlock.render()
      containerBlock.moveBy(100, 100);
      containerBlock.setDeletable(false)
    }
  }
}

function save(ctx: BlocklyContext) {
  const {getFns, value} = ctx
  ctx.mode = 'runtime'
  saveCurWS(ctx)

  const fns = getFns()

  let nfns = JSON.parse(JSON.stringify(fns))

  value.set(nfns.map(fn=>{
    if(fn.script){
      fn.script = encodeURI(fn.script)
    }
    if(fn.xml){
      fn.xml = encodeURI(fn.xml)
    }
    return fn
  }))
}

function saveCurWS(ctx: BlocklyContext) {
  const {setCurXml, setCurScript, workspace} = ctx
  const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace, false))
  setCurXml(xml)//Save it

  let script = Blockly['JavaScript'].workspaceToCode(workspace)
  setCurScript(script)
}