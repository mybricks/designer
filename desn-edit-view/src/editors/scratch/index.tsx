import {evt, useObservable} from "@mybricks/rxui";
import {NS_Emits} from "@sdk";
import Load from "./Load";
import {useCallback} from "react";

const btnStyle = {
  width: '100%',
  height: '25px',
  backgroundColor: '#FFFDE3',
  border: '1px solid #ccc',
  borderRadius: '3px',
  boxShadow: '0 1px 3px -1px #AAA'
}

export default function ({title, value, options}) {
  const fns = value.get()

  if (!Array.isArray(fns)) {
    throw new Error(`使用Scratch编辑器时，传入的数据格式不正确.`)
  }

  const emitViews = useObservable(NS_Emits.Views, {expectTo: 'parents'})

  const open = useCallback(() => {
    emitViews.hideNav()
    emitViews.disableHandlers()

    emitViews.pushInStage(() => {
      return <Load title={title} options={options} value={value} closeView={() => {
        emitViews.popInStage()
        emitViews.showNav()
        emitViews.enableHandlers()
      }}/>
    })
  }, [])

  return (
    <button style={btnStyle} onClick={evt(open).stop}>编辑Scratch</button>
  )
}