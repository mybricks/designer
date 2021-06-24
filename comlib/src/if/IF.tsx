import css from './IF.less'
import {useComputed, useObservable} from "@mybricks/rxui";

export default function IF({env, inputs, slots}) {
  const my = useObservable(class {
    curSlotId: string = 'true'
    expression: any
  })

  useComputed(()=>{
    inputs['expression'](val => {
      //console.log('IF---expression--',val)
      const cval = eval(val)
      if (cval) {
        my.curSlotId = 'true'
      } else {
        my.curSlotId = 'false'
      }
      my.expression = cval
    })
  })

  const renderSlots = useComputed(() => {
    if (env.runtime) {
      const realyDo = my.expression !== void 0
      return realyDo ? [
        <div key='true' style={{display: my.expression ? 'block' : 'none'}}>
          {slots['true'].render({expression: my.expression})}
        </div>,
        <div key='false' style={{display: !my.expression ? 'block' : 'none'}}>
          {slots['false'].render({expression: my.expression})}
        </div>
      ] : null
    } else if (env.edit) {
      return [
        <div key='true'>
          {slots['true'].render()}
        </div>,
        <div key='false'>
          {slots['false'].render()}
        </div>
      ]
    }
  })

  return (
    <div className={css.if}>
      {renderSlots}
    </div>
  )
}