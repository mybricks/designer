/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */
import css from './for.less'
import {useComputed, useObservable} from '@mybricks/rxui';

export default function For({env, data, inputs, outputs, slots}) {
  const myCtx = useObservable(class {
    dataSource: []
  })
  useComputed(() => {
    inputs['datasource'](ds => {
      console.log('For--inputs--datasource:',ds)
      myCtx.dataSource = ds
    })
  })

  const rtRender = useComputed(() => {
    const rtn = []
    if (myCtx.dataSource && slots) {
      myCtx.dataSource.forEach((data, idx) => {
        console.log('For--curVal--datasource:',data)

        rtn.push(<div key={idx}>
          {slots['content'].render({
            index: idx,
            curVal: data
          }, idx)}
        </div>)
      })
    }
    return rtn
  })

  return (
    <div className={`${css.for} ${css.forScrollY}`} style={{
      // height: `${data.height}rpx`
    }}>
      {env.edit ? slots['content'].render() : rtRender}
    </div>
  )
}