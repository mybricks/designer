import React, {useCallback} from 'react'
import css from './index.less'
import {evt, useComputed, useObservable} from "@mybricks/rxui";
import {NS_Emits} from "@sdk";


export default function ServiceSelect({title, value, options, ele, containerEle}: { ele: HTMLElement }) {
  const emitServices = useObservable(NS_Emits.Services, {expectTo: 'parents'})

  // const states = useObservable({passed: void 0})

  const selectServices = useCallback(() => {
    emitServices.openSelector().then(service => {
      if (service) {
        value.set({id: service.id, title: service.title, jsCode: service.jsCode})
      }
    })
  }, [])

  const test = useCallback(() => {
    nowService.passed = void 0
    if (nowService && nowService.jsCode) {
      eval(nowService.jsCode)({},
        response => {
          if (response && response.status && response.status === 200) {
            nowService.passed = true
          } else {
            nowService.passed = false
          }
        }, error => {
          nowService.passed = false
        },{timeout:2000})
    }
  }, [])

  const nowService = value.get()

  const stateClass = useComputed(() => {
    if (!nowService) {
      return css.normal
    }
    if (nowService.passed === void 0) {
      return css.normal
    } else if (nowService.passed) {
      return css.passed
    } else {
      return css.failed
    }
  })

  return (
    <div className={`${css.editor} ${css[options?.type]}`}>
      <div className={css.btns}>
        <div className={css.selected}
             onClick={selectServices}>
          <span>已选择:</span>
          <span>{nowService ? nowService.title : '[空] 点击选择..'}</span>
        </div>
        <div className={`${css.test} ${!nowService ? css.disable : ''}`}
             onClick={evt(test).stop}>
          <span className={stateClass}></span>
          测试
        </div>
      </div>
    </div>
  )
}