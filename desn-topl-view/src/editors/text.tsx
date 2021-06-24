import {observable, render} from '@mybricks/rxui'
import {getPosition} from "@utils";
import css from './editors.less'
import {useCallback, useEffect, useRef} from "react";

let textObj

function Text() {
  const ref = useRef<HTMLElement>()
  const change = useCallback(event => {
    //console.log(Math.random())
    textObj.callback.set(event.target.value)
  }, [])
  const blur = useCallback(event => {
    textObj.po = void 0
  }, [])
  useEffect(() => {
    ref.current.focus()
  })

  return (
    <div className={css.text} style={{
      display: textObj.po ? 'block' : 'none',
      left: textObj.po?.x, top: textObj.po?.y
    }}>
      <input ref={ele => ref.current = ele} type='text' value={textObj.callback.get()} onChange={change} onBlur={blur}/>
    </div>
  )
}

export function text(targetEle: HTMLElement): { val: ({get, set}) => any } {
  if (!textObj) {
    textObj = observable({po: void 0, callback: void 0})

    setTimeout(v => {
      const div = document.createElement("div")
      document.body.appendChild(div)

      render(Text, div)
    })
  }

  return {
    val(cb) {
      const po = getPosition(targetEle)
      textObj.po = po
      textObj.callback = cb
    }
  }
}