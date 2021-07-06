/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import css from './ComlibView.less';
import {evt, observe, useComputed, useObservable, uuid} from '@mybricks/rxui';
import {Button, Select, Tooltip} from 'antd'
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import CaretRightOutlined from '@ant-design/icons/CaretRightOutlined'
import {ComSeedModel, DesignerContext, NS_Emits, T_XGraphComDef} from '@sdk';

import {versionGreaterThan} from "@utils";
import React, {ReactChild, useState} from 'react';
import Ctx from './Ctx'

const {Option} = Select;

let myCtx: Ctx

export default function ComlibView({mode}) {
  const context = observe(DesignerContext, {from: 'parents'})
  const emitSnap = useObservable(NS_Emits.Snap, {expectTo: 'parents'})
  const emitItems = useObservable(NS_Emits.Component, {expectTo: 'parents'})
  const emitLogs = useObservable(NS_Emits.Logs, {expectTo: 'parents'})

  myCtx = useObservable(Ctx, next => next({
    context,
    emitLogs,
    emitSnap,
    emitItems,
    mode,
    renderedLib: [],
  }), {to: 'children'}, [mode])

  useComputed(() => {
    if (myCtx.context.comLibAry) {
      const optionlibs: { id: string; comAray: any; }[] = []
      myCtx.context.comLibAry.forEach(lib => {
        if (!lib.id) {
          lib.id = uuid()
        }

        if (lib.visible !== false) {
          if (lib.comAray.find(comDef => myCtx.matchCom(comDef))) {////TODO
            lib._visible = true
            lib._expanded = true
            optionlibs.push(lib)
          } else {
            lib._visible = false
          }
          // if (lib._visible &&
          //   (!myCtx.activeLib || !myCtx.activeLib._visible)) {
          //   myCtx.activeLib = lib
          // }
        }
      })

      // const activeLib = optionlibs.find(lib => lib.id === myCtx.activeLib?.id)
      // if (!activeLib) {
      //   myCtx.activeLib = optionlibs[0]
      // }
    }
  })

  // 组件库选项
  const libTitleAry = useComputed(() => {
    const options: JSX.Element[] = []
    if (myCtx.activeLib && myCtx.context.comLibAry) {
      myCtx.context.comLibAry.map((lib, idx) => {
        if ((lib.visible === void 0 || lib.visible) && lib._visible) {
          options.push(
            <Option
              key={lib.id + 'title'}
              className={`${css.lib} ${myCtx.activeLib === lib ? css.libActive : ''}`}
              value={idx}>
              {lib.title} {lib.version}
            </Option>
          )
        }
      })
    }

    return options
  })

  // 组件列表
  // const coms = useComputed(() => {
  //   const rdLib = []
  //   const activeLib = myCtx.activeLib
  //   if (activeLib) {
  //     if (!rdLib.find(lib => lib.id === activeLib.id)) {
  //       let ary = []
  //       if (activeLib.comAray) {
  //         let noCatalogAry: JSX.Element[] = []
  //         let hasCatalog = false
  //         activeLib.comAray.forEach((com, idx) => {
  //           // if (Array.isArray(com.comAray)) {
  //           //   hasCatalog = true
  //           //   const coms = com.comAray.map((com) => {
  //           //     const jsx = renderComItem(activeLib, com)
  //           //     return jsx
  //           //   })
  //           //   ary.push(
  //           //     <ExpandableCatalog
  //           //       key={`${com.title}-${idx}`}
  //           //       name={com.title}
  //           //     >
  //           //       {coms}
  //           //     </ExpandableCatalog>
  //           //   )
  //           // } else {
  //             const renderedItem = renderComItem(activeLib, com)
  //             renderedItem && noCatalogAry.push(renderedItem)
  //           //}
  //         })
  //         if (noCatalogAry.length > 0) {
  //           let noCatalogComs = (
  //             <div key={'noCatalog'} className={css.coms}>
  //               {noCatalogAry}
  //             </div>
  //           )
  //           if (hasCatalog) {
  //             noCatalogComs = (
  //               <ExpandableCatalog key="others" name="其它">
  //                 <>{noCatalogComs}</>
  //               </ExpandableCatalog>
  //             )
  //           }
  //           ary.push(noCatalogComs)
  //         }
  //       }

  //       rdLib.push(
  //         {id: activeLib.id, content: ary}
  //       )
  //     }
  //   }

  //   return rdLib.map(({id, content}, idx) => {
  //       return (
  //         <div key={id}
  //              style={{display: id === activeLib.id ? 'block' : 'none'}}>
  //           {content}
  //         </div>
  //       )
  //     }
  //   )
  // })

  // 分类选项
  // const catalogOptions = useComputed(() => {
  //   return myCtx.renderedLib.reduce((obj: Record<string, JSX.Element[]>, {
  //     id,
  //     content
  //   }: { id: string, content: JSX.Element[] }) => {
  //     let options: JSX.Element[] = []
  //     if (content[0].key !== 'noCatalog') {
  //       options = content.map((catalog, idx) => (
  //         <Option
  //           value={catalog.props.name}
  //           key={idx}
  //         >
  //           {catalog.props.name}
  //         </Option>
  //       ))
  //     }
  //     return {
  //       ...obj,
  //       [id]: options
  //     }
  //   }, {})
  // })

  // 当前组件库索引
  // const libIdx = myCtx.activeLib ? myCtx.context.comLibAry.findIndex(lib => lib.id === myCtx.activeLib.id) : -1

  const RenderComlibs = useComputed(() => {
    let comLibAry = myCtx.context.comLibAry ? myCtx.context.comLibAry.filter(comLib => (comLib.visible === void 0 || comLib.visible) && comLib._visible) : []
    return comLibAry.map((comLib, idx) => {
      const title = `${comLib.title}(${comLib.version})`
      return (
        <div className={css.collapsePanel}>
          <div className={css.header} onClick={evt(() => {
            comLib._expanded = !comLib._expanded
          }).stop}>
            <CaretRightOutlined className={`${css.arrowIcon} ${comLib._expanded ? css.expandedIcon : ''}`}/>
            <Tooltip title={title} placement='topLeft'>
              <div className={css.title}>
                {title}
              </div>
            </Tooltip>
          </div>
          <div className={css.comLibsContainer} style={{height: comLib._expanded ? '100%' : 0}}>
            {coms(comLib)}
            {/* {useMemo(() => {
              return (
                <div>123</div>
              )
            }, [])} */}
            {/* <div className={css.basicList}>
              {coms(comLib)}
            </div> */}
          </div>

          {idx === comLibAry.length - 1 && (
            <div className={css.addComBtn} onClick={addComLib}>添加组件库</div>
          )}
        </div>
      )
    })
  })

  return (
    <div className={`${css.panel}`}
         onClick={evt(null).stop}>
      <div className={css.toolbarLayout}>
        <div className={css.libSelection}>
          {/* <Select
            value={libIdx >= 0 ? libIdx : '[组件库为空]'}
            onChange={(value) => {
              myCtx.activeLib = myCtx.context.comLibAry[value]
            }}
            style={{width: 190}}>
            {libTitleAry}
          </Select>
          {
            myCtx.context.configs.comlibAdder ? (
              <Button
                shape="circle"
                icon={<PlusOutlined/>}
                className={css.addComBtn}
                onClick={addComLib}
              />
            ) : null
          } */}
          {RenderComlibs}
        </div>
        {/* 分类选择框 */}
        {/*<div className={css.catalogSelection}>*/}
        {/*  <Select*/}
        {/*    defaultValue=""*/}
        {/*    onChange={(value) => {*/}
        {/*      myCtx.activeCatalog = value*/}
        {/*    }}*/}
        {/*    style={{width: 190}}*/}
        {/*  >*/}
        {/*    <Option value="" key="-1">*/}
        {/*      全部类型*/}
        {/*    </Option>*/}
        {/*    {myCtx.activeLib ? catalogOptions[myCtx.activeLib.id] : null}*/}
        {/*  </Select>*/}
        {/*</div>*/}
        {/* <div className={css.comsSelection}>
          {coms}
        </div> */}
      </div>
    </div>
  )
}


async function addComLib() {
  const libDesc = await myCtx.context.configs.comlibAdder()

  if (!libDesc) return

  if (typeof myCtx.context.configs.comlibLoader === 'function') {
    const addedComLib = await myCtx.context.configs.comlibLoader(libDesc)

    if (addedComLib) {
      const exitLib = myCtx.context.comLibAry.find(lib => lib.id === addedComLib.id)
      if (exitLib) {
        if (addedComLib.version === exitLib.version) {
          myCtx.emitLogs.error('组件库更新', `当前项目已存在组件库 ${addedComLib.title}@${addedComLib.version}.`)
          return
        }
        if (versionGreaterThan(addedComLib.version, exitLib.version)) {//update
          const idx = myCtx.context.comLibAry.indexOf(exitLib)
          myCtx.context.comLibAry.splice(idx, 1, addedComLib)
          myCtx.activeLib = addedComLib

          myCtx.emitLogs.info('组件库更新完成', `已将组件库 ${addedComLib.title} 更新到版本 ${addedComLib.version}.`)
        } else {
          myCtx.emitLogs.error('组件库更新失败', `当前项目存在更高版本的组件库.`)
        }
      } else {
        myCtx.context.comLibAry.push(addedComLib)
        const tlib = myCtx.context.comLibAry[myCtx.context.comLibAry.length - 1]
        myCtx.activeLib = tlib
        myCtx.emitLogs.info('组件库添加完成', `已将组件库 ${addedComLib.title}@${addedComLib.version} 添加到当前项目中.`)
      }
    } else {
      myCtx.emitLogs.error('组件库更新失败', `添加组件库${JSON.stringify(libDesc)}失败.`)
    }
  }


  //
  // context.comLibAry.forEach((comLib, comLibIndex) => {
  //   if (comLib.id === addComLib.id && comLib.version !== addComLib.version) {
  //     upgradeIndex = comLibIndex
  //     upgradeLib = addComLib
  //   }else{
  //
  //   }
  // })
  //
  // if (upgradeIndex === -1) {
  //   context.comLibAry.push(addComLib)
  //   const tlib = context.comLibAry[context.comLibAry.length - 1]
  //
  //   myCtx.activeLib = tlib
  // } else {
  //   context.comLibAry.splice(upgradeIndex, 1, upgradeLib)
  //   myCtx.activeLib = context.comLibAry[upgradeIndex];
  // }

  //myCtx.show = true
}

function renderComItem(lib, com) {
  if (com.enable !== void 0 && com.enable === false) {
    return
  }
  if (com.visibility !== void 0 && com.visibility === false) {
    return
  }

  if (myCtx.matchCom(com)) {
    const isJS = !!(com.rtType && com.rtType.match(/js|ts/gi))
    return (
      // <div key={com.namespace} ref={ele => ele & (ref.current = ele as any)}
      <div key={com.namespace}
           data-namespace={com.namespace}
          //  className={css.com}
          className={`${css.comItem} ${isJS ? css.notAllowed : ''}`}
        // onMouseDown={evt((et: any) => {
        //   if (et.target.tagName.match(/input/gi) || !myCtx.show) {
        //     return true//TODO input 全局事件待处理
        //   }
        //   mouseDown(et, com, lib)
        // })}
           onClick={evt((et: any) => {
             if (et.target.tagName.match(/input/gi)) {
               return true//TODO input 全局事件待处理
             }
             if (!isJS) {
              click(lib, com)
             }
            //  click(lib, com)
           })}>
        {/* <div className={css.title}>
          {com.icon === './icon.png' || !/^(https:)/.test(com.icon) ? (
            <div className={css.comIconFallback}>{com.title?.substr(0, 1)}</div>
          ) : (
            <div className={css.comIcon} style={{backgroundImage: `url(${com.icon})`}}/>
          )}
          <span className={css.comText}>{com.title}</span>
        </div> */}
        <div className={css.widgetIconWrapper}>
          {com.icon === './icon.png' || !/^(https:)/.test(com.icon) ? (
            <div className={css.comIconFallback}>{com.title?.substr(0, 1)}</div>
          ) : (
            <div className={css.img} style={{backgroundImage: `url(${com.icon})`}}></div>
          )}
        </div>
        <div className={css.title}>{com.title}</div>
      </div>
    )
    // return (
    //   // <div key={com.namespace} ref={ele => ele & (ref.current = ele as any)}
    //   <div key={com.namespace}
    //        data-namespace={com.namespace}
    //        className={css.com}
    //     // onMouseDown={evt((et: any) => {
    //     //   if (et.target.tagName.match(/input/gi) || !myCtx.show) {
    //     //     return true//TODO input 全局事件待处理
    //     //   }
    //     //   mouseDown(et, com, lib)
    //     // })}
    //        onClick={evt((et: any) => {
    //          if (et.target.tagName.match(/input/gi)) {
    //            return true//TODO input 全局事件待处理
    //          }
    //          click(lib, com)
    //        })}>
    //     <div className={css.title}>
    //       {com.icon === './icon.png' || !/^(https:)/.test(com.icon) ? (
    //         <div className={css.comIconFallback}>{com.title?.substr(0, 1)}</div>
    //       ) : (
    //         <div className={css.comIcon} style={{backgroundImage: `url(${com.icon})`}}/>
    //       )}
    //       <span className={css.comText}>{com.title}</span>
    //     </div>
    //   </div>
    // )
  }
}

function click(lib, com: T_XGraphComDef) {
  const instanceModel = new ComSeedModel({
    namespace: com.namespace,
    version: com.version,
    rtType: com.rtType,
    //style,
    data: JSON.parse(JSON.stringify(com.data ? com.data : {}))
  })

  const snap = myCtx.emitSnap.start('add component')

  myCtx.emitItems.add(instanceModel, 'finish');

  snap.commit()
}

// function mouseDown(evt: any, com: T_XGraphComDef, lib: any) {
//   const myCtx = observe(MyContext)
//
//   const currentNode = getCurrentNode(evt)
//   const moveNode = document.createElement('div')
//   const copyNode = currentNode.cloneNode(true)
//   moveNode.style.position = 'absolute'
//   moveNode.style.display = 'none'
//   moveNode.style.width = '560px'
//   moveNode.style.background = '#ffffff'
//   moveNode.style.zIndex = '1000'
//   moveNode.style.transform = 'scale(.5) translate(-50%, -50%)'
//   moveNode.appendChild(copyNode)
//
//   function move(state, ex: number, ey: number) {
//     const instanceModel = new ComSeedModel(
//       {
//         namespace: com.namespace,
//         libId: lib.id,
//         style: {left: ex, top: ey},
//         data: JSON.parse(JSON.stringify(com.data ? com.data : {}))
//       }
//     )
//
//     myCtx.emitItems.add(instanceModel, state);
//   }
//
//   dragable(evt, ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
//     if (state == 'start') {
//       document.body.appendChild(moveNode)
//       moveNode.style.top = `${y}px`
//       moveNode.style.left = `${x}px`
//       moveNode.style.display = 'block'
//       return
//     }
//     if (state == 'moving') {
//       myCtx.show = false
//
//       moveNode.style.top = `${y + dy}px`
//       moveNode.style.left = `${x + dx}px`
//
//       move('ing', ex, ey)
//     }
//     if (state == 'finish') {
//       document.body.removeChild(moveNode)
//       move('finish', ex, ey)
//     }
//   })
// }

function getCurrentNode(e: any): Node {
  if ((e && /com/.test(e.className)) || (e.target && /com/.test(e.target.className))) {
    return e.target || e
  } else {
    return getCurrentNode(e.parentNode || e.target.parentNode)
  }
}

export function getInputs() {
  return new Proxy({}, {
    get(target: {}, _id: PropertyKey, receiver: any): any {
      return function () {
      }
    }
  })
}

export function getOutputs() {
  return new Proxy({}, {
    get(target: {}, _id: PropertyKey, receiver: any): any {
      return function (data) {
      }
    }
  })
}

function ExpandableCatalog({name, children}: { name: string, children: ReactChild }) {
  const [isExpand, setExpand] = useState(true)
  const hide = myCtx.activeCatalog && myCtx.activeCatalog !== name // 隐藏未被选中分类
  return (
    <div key={name} className={css.catalog} style={hide ? {display: 'none'} : {}}>
      <div className={css.cataTitle} onClick={() => setExpand(!isExpand)}>
        <span className={css.cataTitleText}>{name}</span>
        {
          isExpand
            ? <DownOutlined style={{color: '#fa6400'}}/>
            : <RightOutlined style={{color: '#fa6400'}}/>
        }
      </div>
      <div className={css.coms} style={{display: isExpand ? 'block' : 'none'}}>
        {children}
      </div>
    </div>
  )
}

function coms(comLib) {
  const rdLib = []
  let ary = []
  let noCatalogAry: JSX.Element[] = []
  let hasCatalog = false
  comLib.comAray.forEach((com, idx) => {
    const renderedItem = renderComItem(comLib, com)
    renderedItem && noCatalogAry.push(renderedItem)
  })
  if (noCatalogAry.length > 0) {
    let noCatalogComs = (
      <div key={'noCatalog'} className={css.basicList}>
        {noCatalogAry}
      </div>
    )
    if (hasCatalog) {
      noCatalogComs = (
        <ExpandableCatalog key="others" name="其它">
          <>{noCatalogComs}</>
        </ExpandableCatalog>
      )
    }
    ary.push(noCatalogComs)
  }

  rdLib.push(
    {id: comLib.id, content: ary}
  )

  return rdLib.map(({id, content}, idx) => {
    return (
      <div key={id}>
        {content}
      </div>
    )
  })
}