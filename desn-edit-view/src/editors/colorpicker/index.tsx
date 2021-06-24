import React from 'react'
import ColorEditor from "../_commons/color-editor";

export default function ColorPicker({title, value, options, ele, containerEle}: { ele: HTMLElement }) {
  return (
    <ColorEditor value={value}/>
  )
}

